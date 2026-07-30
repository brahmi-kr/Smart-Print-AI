'use client';

import Link from 'next/link';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useMyJobs, usePrinters } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ListChecks, Upload, Timer, Printer, Sparkles } from 'lucide-react';

export default function QueuePage() {
  const { jobs, loading, reload } = useMyJobs();
  const { printers } = usePrinters();
  const active = jobs.filter(j => j.status === 'queued' || j.status === 'printing');

  return (
    <DashboardShell title="Queue" description="Your active print jobs in the queue.">
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{active.length} active</span>
        <Button variant="outline" size="sm" onClick={reload}>Refresh</Button>
      </div>
      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : active.length === 0 ? (
        <EmptyState icon={ListChecks} title="Queue is empty" desc="Upload a document to join the queue." action={<Link href="/dashboard/upload" className="nv-btn-primary"><Upload className="h-4 w-4" /> Upload</Link>} />
      ) : (
        <div className="space-y-3">
          {active.map((j, i) => {
            const printer = printers.find(p => p.id === j.printer_id);
            return (
              <div key={j.id} className="glass-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold ring-1 ring-primary/20">#{j.queue_position}</div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{j.file_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {j.pages}p × {j.copies} · {j.color_mode === 'color' ? 'Color' : 'B/W'}{j.duplex ? ' · Duplex' : ''} · {printer?.name || 'Auto-assigned'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {j.status === 'printing' ? (
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1"><span className="text-primary font-medium">Printing</span><span className="font-mono">{j.progress}%</span></div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${j.progress}%` }} /></div>
                      </div>
                    ) : (
                      <span className="nv-chip"><Timer className="h-3 w-3" /> ~{j.estimated_wait_minutes}m</span>
                    )}
                    <Link href="/dashboard/tracking" className="nv-chip hover:border-primary/40"><Sparkles className="h-3 w-3" /> Track</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
