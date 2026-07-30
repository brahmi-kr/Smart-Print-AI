'use client';

import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useAdminLogs, useAdminPrinters } from '@/lib/admin-hooks';
import { ScrollText, Info, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';

const EVENT_ICON: Record<string, any> = {
  status_change: Info, paper_jam: AlertTriangle, toner_replace: Wrench,
  drum_clean: Wrench, firmware_update: CheckCircle2, offline_repair: AlertTriangle,
};

export default function AdminLogsPage() {
  const { logs } = useAdminLogs();
  const { printers } = useAdminPrinters();

  return (
    <DashboardShell title="System Logs" description="Audit trail of printer and system events." admin>
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No logs yet" desc="System and printer events will be logged here." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Event</div>
            <div className="col-span-3">Printer</div>
            <div className="col-span-4">Details</div>
          </div>
          <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto font-mono text-xs">
            {logs.map(l => {
              const Ic = EVENT_ICON[l.event] || Info;
              const p = printers.find(x => x.id === l.printer_id);
              return (
                <div key={l.id} className="grid grid-cols-12 px-5 py-3 items-center">
                  <div className="col-span-2 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
                  <div className="col-span-3 flex items-center gap-2"><Ic className="h-3.5 w-3.5 text-primary" /> <span className="capitalize">{l.event.replace('_', ' ')}</span></div>
                  <div className="col-span-3 text-muted-foreground">{p?.name || '—'}</div>
                  <div className="col-span-4 text-muted-foreground truncate">{l.details || '—'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
