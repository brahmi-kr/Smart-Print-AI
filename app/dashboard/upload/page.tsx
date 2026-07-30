'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { usePrinters } from '@/lib/hooks';
import { analyzeDocumentImage, AIResult } from '@/lib/ai-analysis';
import { predictQueue, recommendPrinters, computePrice, PrinterRec } from '@/lib/queue-model';
import {
  UploadCloud, FileText, X, ScanLine, Brain, Printer, Timer,
  CheckCircle2, Sparkles, Loader2, ArrowRight, Gauge, AlertTriangle,
} from 'lucide-react';

type Stage = 'idle' | 'analyzing' | 'review';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { printers, loading: printersLoading } = usePrinters();
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [ai, setAi] = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<'color' | 'bw'>('bw');
  const [duplex, setDuplex] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [pageRange, setPageRange] = useState('all');
  const [priority, setPriority] = useState(0);
  const [printerId, setPrinterId] = useState<string>('');
  const [recs, setRecs] = useState<PrinterRec[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = files.length > 0 ? Math.max(1, Math.ceil(files[0].size / 50000)) : 1; // rough estimate
  const price = computePrice({ pages, copies, colorMode, duplex, priority });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    if (dropped.length) setFiles(dropped.slice(0, 5));
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files).slice(0, 5));
  };

  const runAnalysis = async () => {
    if (!files.length) { toast.error('Add a file first.'); return; }
    setAnalyzing(true);
    setStage('analyzing');
    setAnalyzeProgress(0);
    const prog = setInterval(() => setAnalyzeProgress(p => Math.min(90, p + 8)), 80);
    try {
      const file = files[0];
      const result = files[0].type.startsWith('image/')
        ? await analyzeDocumentImage(file)
        : await analyzeDocumentImage(file); // PDFs fall back to bitmap-less heuristic via same path
      setAi(result);
      // compute recommendations
      const r = recommendPrinters(printers, pages, copies, colorMode);
      setRecs(r);
      if (r.length) setPrinterId(r[0].id);
      setStage('review');
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      toast.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      setStage('idle');
    } finally {
      clearInterval(prog);
      setAnalyzeProgress(100);
      setAnalyzing(false);
    }
  };

  const submit = () => {
    if (!user) return;
    if (!printerId) { toast.error('Select a printer.'); return; }
    // Stage the pending job for the dedicated payment flow. No job or payment
    // is created here — that happens only after a successful demo payment on
    // the processing page.
    const pending = {
      fileName: files[0].name,
      fileSize: files[0].size,
      pages, copies, colorMode, duplex, paperSize,
      orientation, pageRange, priority: priority === 1,
      printerId,
    };
    sessionStorage.setItem('sp_pending_job', JSON.stringify(pending));
    if (ai) sessionStorage.setItem('sp_pending_ai', JSON.stringify(ai));
    router.push('/dashboard/payment');
  };

  const reset = () => {
    setFiles([]); setAi(null); setStage('idle'); setRecs([]); setPrinterId('');
  };

  return (
    <DashboardShell title="Upload Document" description="Drag, analyze, and submit your print job.">
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upload + options */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 text-center ${dragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/40'}`}
            >
              <input ref={inputRef} type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={onPick} />
              <motion.div animate={{ y: dragging ? -4 : 0 }}>
                <UploadCloud className="h-10 w-10 text-primary mx-auto" />
              </motion.div>
              <p className="mt-4 font-medium">Drag & drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF or images · up to 5 files</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB · ~{pages} pages</div>
                      </div>
                    </div>
                    <button onClick={reset} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Print options */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Print options</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Copies</Label>
                <Input type="number" min={1} max={100} value={copies} onChange={e => setCopies(Math.max(1, Math.min(100, +e.target.value || 1)))} className="mt-1.5" />
              </div>
              <div>
                <Label>Color mode</Label>
                <Select value={colorMode} onValueChange={(v) => setColorMode(v as any)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bw">Black & White</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Paper size</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Page range</Label>
                <Input value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="all, 1-5, even, odd" className="mt-1.5" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4">
                <div><div className="text-sm font-medium">Duplex</div><div className="text-xs text-muted-foreground">Print on both sides</div></div>
                <Switch checked={duplex} onCheckedChange={setDuplex} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4">
                <div><div className="text-sm font-medium">Priority</div><div className="text-xs text-muted-foreground">Jump the queue (+₹10)</div></div>
                <Switch checked={priority === 1} onCheckedChange={c => setPriority(c ? 1 : 0)} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: analysis + recommendation + payment */}
        <div className="space-y-5">
          {/* AI Analysis */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold">AI Document Analysis</h3>
            </div>

            {stage === 'idle' && files.length > 0 && (
              <Button onClick={runAnalysis} className="w-full nv-btn-primary h-11">
                <ScanLine className="h-4 w-4" /> Run AI Analysis
              </Button>
            )}

            {stage === 'idle' && files.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Upload a file to begin analysis.</p>
            )}

            {analyzing && (
              <div className="py-6">
                <div className="flex items-center gap-2 text-sm text-primary mb-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Running computer-vision pipeline…
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${analyzeProgress}%` }} />
                </div>
                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground font-mono">
                  <div>→ OpenCV preprocessing</div>
                  <div>→ Laplacian variance (blur)</div>
                  <div>→ Luminance histogram (brightness/contrast)</div>
                  <div>→ High-frequency residual (noise)</div>
                  <div>→ Edge asymmetry (skew)</div>
                  <div>→ MobileNetV2 inference</div>
                </div>
              </div>
            )}

            {ai && stage !== 'analyzing' && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`nv-chip ${ai.quality_rating === 'good' ? 'border-success/40 text-success' : ai.quality_rating === 'poor' ? 'border-destructive/40 text-destructive' : 'border-warning/40 text-warning'}`}>
                      {ai.quality_rating === 'good' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      Quality: {ai.quality_rating.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{ai.inference_ms}ms · {ai.confidence}% conf</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      ['Blur / Sharpness', ai.blur_score],
                      ['Brightness', ai.brightness_score],
                      ['Contrast', ai.contrast_score],
                      ['Noise', ai.noise_score],
                      ['Skew', ai.skew_score],
                      ['Resolution', ai.resolution_score],
                      ['Readability', ai.readability_score],
                    ].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{l}</span><span className="font-mono">{v}/100</span></div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full ${(v as number) >= 70 ? 'bg-success' : (v as number) >= 45 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                    <div className="text-xs font-semibold mb-1">Suggestions</div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {ai.suggestions.map((s, i) => <li key={i} className="flex gap-2"><span className="text-primary">→</span>{s}</li>)}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Printer recommendation */}
          {recs.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3"><Printer className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Recommended printers</h3></div>
              <div className="space-y-2">
                {recs.slice(0, 3).map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setPrinterId(r.id)}
                    className={`w-full text-left rounded-xl border p-3 transition ${printerId === r.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/[0.02] hover:border-primary/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {i === 0 && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                          {r.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-primary">~{r.estimated_wait}m</div>
                        <div className="text-[10px] text-muted-foreground">score {r.score}</div>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted-foreground">{r.reason}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Queue prediction + payment */}
          {ai && printerId && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3"><Timer className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Queue prediction</h3></div>
              {(() => {
                const p = printers.find(x => x.id === printerId);
                const pred = predictQueue({ queueLength: p?.queue_length ?? 0, pages, copies, ppm: p?.ppm ?? 30, priority, colorMode });
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <div className="text-xs text-muted-foreground">Position</div>
                        <div className="font-display text-lg font-bold">#{pred.queue_position}</div>
                      </div>
                      <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <div className="text-xs text-muted-foreground">Wait</div>
                        <div className="font-display text-lg font-bold text-primary">{pred.estimated_wait_minutes}m</div>
                      </div>
                      <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="font-display text-lg font-bold text-success">{pred.confidence}%</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total price</span><span className="font-bold text-primary">₹{price.toFixed(2)}</span></div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{pages} pages × {copies} · {colorMode === 'color' ? 'Color' : 'B/W'}{duplex ? ' · Duplex' : ''}{priority ? ' · Priority' : ''}</div>
                    </div>
                    <Button onClick={submit} className="w-full nv-btn-primary h-11">
                      <>Proceed to Payment · ₹{price.toFixed(2)} <ArrowRight className="h-4 w-4" /></>
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
