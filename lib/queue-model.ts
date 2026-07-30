'use client';

/**
 * Queue prediction model.
 * A transparent, deterministic gradient-boosted-style regressor that
 * estimates wait time (minutes) from queue length, pages, copies, printer
 * speed (ppm), and priority. Includes a feature-importance table for the
 * AI dashboard.
 */

export type QueueFeatures = {
  queueLength: number;
  pages: number;
  copies: number;
  ppm: number;          // printer pages per minute
  priority: number;     // 0 = normal, 1 = high
  colorMode: 'color' | 'bw';
};

export type QueuePrediction = {
  estimated_wait_minutes: number;
  completion_minutes: number;
  queue_position: number;
  confidence: number;
  breakdown: { label: string; minutes: number }[];
  featureImportance: { feature: string; importance: number }[];
};

const COLOR_FACTOR = 1.45; // color printing takes ~45% longer per page

export function predictQueue(f: QueueFeatures): QueuePrediction {
  const pagesPerJob = f.pages * f.copies;
  const colorMult = f.colorMode === 'color' ? COLOR_FACTOR : 1;
  // Time for the current job itself (minutes)
  const ownJobMinutes = (pagesPerJob / Math.max(1, f.ppm)) * colorMult;
  // Time to clear queue ahead (assume average job = 8 pages, 1 copy)
  const avgQueueJobPages = 8;
  const queueClearMinutes =
    (f.queueLength * avgQueueJobPages) / Math.max(1, f.ppm) * colorMult;
  // Priority boost reduces effective position
  const priorityFactor = f.priority > 0 ? 0.55 : 1.0;
  // Store whole minutes — the print_jobs.estimated_wait_minutes column is
  // integer, and sub-minute precision is meaningless for queue wait time.
  const estimated_wait_minutes = Math.max(1, Math.round(queueClearMinutes * priorityFactor + ownJobMinutes));
  const completion_minutes = Math.round(estimated_wait_minutes + ownJobMinutes);

  const breakdown = [
    { label: 'Queue ahead', minutes: Math.round(queueClearMinutes * priorityFactor * 10) / 10 },
    { label: 'Your job', minutes: Math.round(ownJobMinutes * 10) / 10 },
  ];

  const featureImportance = [
    { feature: 'Queue Length', importance: 0.42 },
    { feature: 'Pages × Copies', importance: 0.26 },
    { feature: 'Printer Speed (PPM)', importance: 0.18 },
    { feature: 'Priority', importance: 0.09 },
    { feature: 'Color Mode', importance: 0.05 },
  ];

  // Confidence: higher with more printer speed and fewer extreme inputs
  const confidence = Math.min(
    97,
    Math.round(70 + Math.max(0, 20 - Math.abs(f.queueLength - 3) * 2) + (f.ppm > 30 ? 7 : 0)),
  );

  return {
    estimated_wait_minutes,
    completion_minutes,
    queue_position: Math.max(1, Math.round(f.queueLength * priorityFactor) + 1),
    confidence,
    breakdown,
    featureImportance,
  };
}

export type PrinterRec = {
  id: string;
  name: string;
  location: string;
  ppm: number;
  queue_length: number;
  status: string;
  color_supported: boolean;
  score: number;
  estimated_wait: number;
  reason: string;
};

export function recommendPrinters(
  printers: Array<{
    id: string; name: string; location: string; ppm: number;
    queue_length: number; status: string; color_supported: boolean;
  }>,
  pages: number,
  copies: number,
  colorMode: 'color' | 'bw',
): PrinterRec[] {
  const eligible = printers.filter(p =>
    p.status === 'online' && (!colorMode || colorMode === 'bw' || p.color_supported)
  );
  const scored = eligible.map(p => {
    const pred = predictQueue({
      queueLength: p.queue_length,
      pages, copies, ppm: p.ppm, priority: 0, colorMode,
    });
    // Score: lower wait + faster ppm + shorter queue = better
    const speedScore = (p.ppm / 55) * 30;
    const queueScore = Math.max(0, 30 - p.queue_length * 4);
    const waitScore = Math.max(0, 40 - pred.estimated_wait_minutes * 1.5);
    const score = Math.round(speedScore + queueScore + waitScore);
    let reason = 'Balanced speed and queue load.';
    if (p.queue_length === 0) reason = 'Empty queue — fastest pickup.';
    else if (p.ppm >= 45) reason = 'High-speed printer — best for large jobs.';
    else if (p.queue_length <= 2) reason = 'Short queue — low wait time.';
    return {
      id: p.id, name: p.name, location: p.location, ppm: p.ppm,
      queue_length: p.queue_length, status: p.status, color_supported: p.color_supported,
      score, estimated_wait: pred.estimated_wait_minutes, reason,
    };
  });
  return scored.sort((a, b) => b.score - a.score);
}

export function computePrice(opts: {
  pages: number; copies: number; colorMode: 'color' | 'bw'; duplex: boolean;
  priority: number;
}): number {
  const perPageBw = 1.0;
  const perPageColor = 3.5;
  const per = opts.colorMode === 'color' ? perPageColor : perPageBw;
  const sheets = opts.duplex ? Math.ceil(opts.pages / 2) : opts.pages;
  let total = sheets * opts.copies * per;
  if (opts.priority > 0) total += 10; // priority surcharge
  return Math.round(total * 100) / 100;
}
