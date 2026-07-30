'use client';

import Link from 'next/link';
import { DashboardShell, StatCard, EmptyState } from '@/components/dashboard-shell';
import { useMyJobs, useMyPayments, usePrinters } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Upload, Printer, Timer, CreditCard, ListChecks, Sparkles, ArrowRight, Cpu, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHome() {
  const { profile } = useAuth();
  const { jobs } = useMyJobs();
  const { payments } = useMyPayments();
  const { printers } = usePrinters();

  const active = jobs.filter(j => j.status === 'queued' || j.status === 'printing');
  const completed = jobs.filter(j => j.status === 'completed' || j.status === 'ready');
  const totalSpent = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const onlinePrinters = printers.filter(p => p.status === 'online').length;

  return (
    <DashboardShell title="Dashboard" description={`Welcome back, ${profile?.full_name || 'student'}.`}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListChecks} label="Active jobs" value={active.length} hint={`${jobs.length} total`} />
        <StatCard icon={Printer} label="Printers online" value={`${onlinePrinters}/${printers.length}`} color="text-accent" />
        <StatCard icon={Timer} label="Avg wait" value={`${active.length ? Math.round(active.reduce((s, j) => s + j.estimated_wait_minutes, 0) / active.length) : 0}m`} color="text-warning" />
        <StatCard icon={CreditCard} label="Total spent" value={`₹${totalSpent.toFixed(2)}`} color="text-success" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold">Quick actions</h3>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/upload" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-primary/40 transition group">
              <span className="flex items-center gap-3 text-sm"><Upload className="h-4 w-4 text-primary" /> Upload document</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/dashboard/queue" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-primary/40 transition group">
              <span className="flex items-center gap-3 text-sm"><ListChecks className="h-4 w-4 text-primary" /> View queue</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/dashboard/tracking" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-primary/40 transition group">
              <span className="flex items-center gap-3 text-sm"><Sparkles className="h-4 w-4 text-primary" /> Track a job</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/dashboard/ai-assistant" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-primary/40 transition group">
              <span className="flex items-center gap-3 text-sm"><Brain className="h-4 w-4 text-primary" /> Ask AI assistant</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Live queue */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Live queue status</h3>
            <span className="nv-chip"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Real-time</span>
          </div>
          <div className="mt-4">
            {active.length === 0 ? (
              <EmptyState icon={ListChecks} title="No active jobs" desc="Upload a document to join the queue." action={
                <Link href="/dashboard/upload" className="nv-btn-primary"><Upload className="h-4 w-4" /> Upload</Link>
              } />
            ) : (
              <div className="space-y-2">
                {active.slice(0, 6).map((j, i) => (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{j.file_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.pages}p × {j.copies} · {j.color_mode === 'color' ? 'Color' : 'B/W'} · Pos #{j.queue_position}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {j.status === 'printing' && (
                        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${j.progress}%` }} />
                        </div>
                      )}
                      <span className={`text-xs font-medium ${j.status === 'printing' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {j.status === 'printing' ? `${j.progress}%` : `~${j.estimated_wait_minutes}m`}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 glass-card p-5">
        <h3 className="font-display font-semibold">Recent activity</h3>
        <div className="mt-4">
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No completed jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {completed.slice(0, 5).map(j => (
                <div key={j.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{j.file_name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-success font-medium">₹{Number(j.total_price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI + GPU mini cards */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">AI pipeline</h3></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-muted-foreground text-xs">Model</div><div className="font-mono">MobileNetV2-CV-v1</div></div>
            <div><div className="text-muted-foreground text-xs">Avg inference</div><div className="font-mono text-primary">142 ms</div></div>
            <div><div className="text-muted-foreground text-xs">Accuracy</div><div className="font-mono text-success">92.4%</div></div>
            <div><div className="text-muted-foreground text-xs">Pipeline</div><div className="font-mono">OpenCV → CNN</div></div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">GPU telemetry</h3></div>
          <div className="mt-4 space-y-3">
            {[['Utilization', 64], ['Memory', 48], ['Temperature', 41]].map(([l, v]) => (
              <div key={l as string}>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{l}</span><span className="font-mono text-primary">{v}%</span></div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
