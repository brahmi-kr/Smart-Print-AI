'use client';

import { useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useAdminJobs, useAdminPrinters, useAdminProfiles } from '@/lib/admin-hooks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ListChecks, Play, Check, X, RefreshCw } from 'lucide-react';

export default function AdminQueuePage() {
  const { jobs, loading, reload } = useAdminJobs();
  const { printers } = useAdminPrinters();
  const { profiles } = useAdminProfiles();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
  const userFor = (id: string) => profiles.find(p => p.id === id);
  const printerFor = (id: string | null) => printers.find(p => p.id === id);

  const advance = async (id: string, status: string) => {
    const next: Record<string, string> = { queued: 'printing', printing: 'ready', ready: 'completed' };
    const ns = next[status];
    if (!ns) return;
    const patch: any = { status: ns };
    if (ns === 'printing') patch.progress = 5;
    if (ns === 'ready') patch.progress = 100;
    if (ns === 'completed') patch.completed_at = new Date().toISOString();
    await supabase.from('print_jobs').update(patch).eq('id', id);
    toast.success(`Job moved to ${ns}`);
    reload();
  };

  const cancel = async (id: string) => {
    await supabase.from('print_jobs').update({ status: 'cancelled' }).eq('id', id);
    toast.success('Job cancelled');
    reload();
  };

  return (
    <DashboardShell title="Queue Management" description="Monitor and advance all print jobs." admin>
      <div className="flex justify-between items-center mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="printing">Printing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="No jobs" desc="Jobs will appear here as students submit them." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-3">File</div>
            <div className="col-span-2">Student</div>
            <div className="col-span-2">Printer</div>
            <div className="col-span-1">Pos</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
            {filtered.map(j => (
              <div key={j.id} className="grid grid-cols-12 px-5 py-3 items-center text-sm">
                <div className="col-span-3 truncate font-medium">{j.file_name}</div>
                <div className="col-span-2 truncate text-muted-foreground">{userFor(j.user_id)?.email || '—'}</div>
                <div className="col-span-2 truncate text-muted-foreground">{printerFor(j.printer_id)?.name || '—'}</div>
                <div className="col-span-1 font-mono">#{j.queue_position}</div>
                <div className="col-span-2"><span className="nv-chip capitalize">{j.status}</span></div>
                <div className="col-span-2 flex justify-end gap-1">
                  {(j.status === 'queued' || j.status === 'printing' || j.status === 'ready') && (
                    <Button size="sm" variant="outline" onClick={() => advance(j.id, j.status)}><Play className="h-3.5 w-3.5" /></Button>
                  )}
                  {(j.status === 'queued' || j.status === 'printing') && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancel(j.id)}><X className="h-3.5 w-3.5" /></Button>
                  )}
                  {j.status === 'completed' && <Check className="h-4 w-4 text-success ml-2" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
