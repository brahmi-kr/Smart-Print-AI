'use client';

import { useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useAdminPrinters, useAdminLogs } from '@/lib/admin-hooks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Wrench, Plus, Loader2 } from 'lucide-react';

export default function AdminMaintenancePage() {
  const { printers, reload } = useAdminPrinters();
  const { logs, reload: reloadLogs } = useAdminLogs();
  const [printerId, setPrinterId] = useState('');
  const [event, setEvent] = useState('paper_jam');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const log = async () => {
    if (!printerId) { toast.error('Select a printer'); return; }
    setSaving(true);
    const { error } = await supabase.from('printer_logs').insert({ printer_id: printerId, event, details });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Maintenance log added');
    setDetails('');
    reloadLogs();
  };

  return (
    <DashboardShell title="Printer Maintenance" description="Log maintenance events and track printer health." admin>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Log maintenance event</h3>
          <div className="space-y-4">
            <div><Select value={printerId} onValueChange={setPrinterId}><SelectTrigger><SelectValue placeholder="Select printer" /></SelectTrigger><SelectContent>{printers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Select value={event} onValueChange={setEvent}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paper_jam">Paper Jam</SelectItem><SelectItem value="toner_replace">Toner Replace</SelectItem><SelectItem value="drum_clean">Drum Clean</SelectItem><SelectItem value="firmware_update">Firmware Update</SelectItem><SelectItem value="offline_repair">Offline Repair</SelectItem><SelectItem value="status_change">Status Change</SelectItem></SelectContent></Select></div>
            <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Details…" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary/40 min-h-24" />
            <Button onClick={log} disabled={saving} className="nv-btn-primary w-full h-11">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add log</>}</Button>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Maintenance history</h3>
          {logs.length === 0 ? (
            <EmptyState icon={Wrench} title="No maintenance logs" desc="Logged events will appear here." />
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {logs.map(l => {
                const p = printers.find(x => x.id === l.printer_id);
                return (
                  <div key={l.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <Wrench className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium capitalize">{l.event.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p?.name || 'Unknown printer'}</div>
                      {l.details && <div className="text-sm mt-1">{l.details}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
