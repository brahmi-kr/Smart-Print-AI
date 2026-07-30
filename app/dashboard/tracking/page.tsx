'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useMyJobs, usePrinters } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Sparkles, QrCode, CheckCircle2, Timer, Printer, RefreshCw, CreditCard, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

// Simple deterministic QR-like grid (no external dep)
function QRGrid({ value }: { value: string }) {
  const size = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    cells.push(((seed >> 16) & 1) === 1);
  }
  // Finder patterns
  const setFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      const border = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      cells[(r + dr) * size + (c + dc)] = border || inner;
    }
  };
  setFinder(0, 0); setFinder(0, size - 7); setFinder(size - 7, 0);
  return (
    <div className="inline-block bg-white p-2 rounded-lg">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 0 }}>
        {cells.map((on, i) => (
          <div key={i} style={{ width: 6, height: 6, background: on ? '#000' : 'transparent' }} />
        ))}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const { jobs, loading, reload } = useMyJobs();
  const { printers } = usePrinters();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payment, setPayment] = useState<any | null>(null);

  // Auto-advance printing progress locally for demo realism
  useEffect(() => {
    const printing = jobs.find(j => j.status === 'printing');
    if (!printing) return;
    const iv = setInterval(async () => {
      const next = Math.min(100, printing.progress + 7);
      await supabase.from('print_jobs').update({ progress: next, status: next >= 100 ? 'ready' : 'printing' }).eq('id', printing.id);
      if (next >= 100 && user) {
        await supabase.from('notifications').insert({
          user_id: user.id, title: 'Ready for pickup',
          message: `${printing.file_name} is ready. Pickup code: ${printing.pickup_code}`,
          type: 'success',
        });
      }
      reload();
    }, 3000);
    return () => clearInterval(iv);
  }, [jobs, reload, user]);

  const active = jobs.filter(j => j.status === 'queued' || j.status === 'printing' || j.status === 'ready');
  const selected = active.find(j => j.id === selectedId) ?? active[0];

  // Fetch payment for the selected job
  useEffect(() => {
    if (!selected) { setPayment(null); return; }
    let active = true;
    (async () => {
      const { data } = await supabase.from('payments').select('*').eq('print_job_id', selected.id).maybeSingle();
      if (active) setPayment(data);
    })();
    return () => { active = false; };
  }, [selected]);

  return (
    <DashboardShell title="Print Tracking" description="Live progress, status, and pickup verification.">
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{active.length} active jobs</span>
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : active.length === 0 ? (
        <EmptyState icon={Sparkles} title="Nothing to track" desc="Your active jobs will appear here." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="space-y-2">
            {active.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                className={`w-full text-left glass-card p-4 transition ${selected?.id === j.id ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate text-sm">{j.file_name}</div>
                  <StatusPill status={j.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Pos #{j.queue_position} · ETA {j.estimated_wait_minutes}m</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">{selected.file_name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {printers.find(p => p.id === selected.printer_id)?.name || 'Printer'} · {selected.pages}p × {selected.copies}
                  </p>
                </div>
                <StatusPill status={selected.status} large />
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono text-primary">{selected.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${selected.progress}%` }} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <Timer className="h-4 w-4 text-primary mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Est. wait</div>
                  <div className="font-bold">{selected.estimated_wait_minutes}m</div>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <Printer className="h-4 w-4 text-primary mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Queue pos</div>
                  <div className="font-bold">#{selected.queue_position}</div>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Print status</div>
                  <div className="font-bold capitalize">{selected.status}</div>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <CreditCard className="h-4 w-4 text-primary mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Payment</div>
                  <div className={`font-bold capitalize ${payment?.status === 'paid' ? 'text-success' : 'text-warning'}`}>{payment?.status || '—'}</div>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <Hash className="h-4 w-4 text-primary mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Transaction ID</div>
                  <div className="font-mono text-[11px] font-bold truncate">{payment?.invoice_number || '—'}</div>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <Hash className="h-4 w-4 text-primary mx-auto" />
                  <div className="mt-2 text-xs text-muted-foreground">Print Job ID</div>
                  <div className="font-mono text-[11px] font-bold truncate">{selected.id.slice(0, 8)}</div>
                </div>
              </div>

              {/* QR */}
              <div className="mt-6 rounded-xl bg-white/[0.02] border border-white/5 p-5 flex flex-col sm:flex-row items-center gap-5">
                <QRGrid value={selected.pickup_code || selected.id} />
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold"><QrCode className="h-4 w-4 text-primary" /> Pickup verification</div>
                  <p className="mt-1 text-xs text-muted-foreground">Show this QR code at the printer to release your document.</p>
                  <div className="mt-3 font-mono text-2xl tracking-widest text-primary">{selected.pickup_code}</div>
                </div>
              </div>

              {selected.status === 'ready' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <div className="text-sm font-semibold text-success">Ready for pickup</div>
                    <div className="text-xs text-muted-foreground">Collect from the printer using your pickup code.</div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}

function StatusPill({ status, large }: { status: string; large?: boolean }) {
  const map: Record<string, string> = {
    queued: 'text-muted-foreground border-white/10',
    printing: 'text-primary border-primary/40',
    ready: 'text-success border-success/40',
    completed: 'text-success border-success/40',
    cancelled: 'text-destructive border-destructive/40',
  };
  return <span className={`nv-chip ${map[status] || ''} ${large ? 'px-3 py-1.5' : ''} capitalize`}>{status}</span>;
}
