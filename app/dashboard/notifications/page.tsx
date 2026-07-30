'use client';

import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useNotifications } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };
const COLOR = { info: 'text-primary', success: 'text-success', warning: 'text-warning', error: 'text-destructive' };

export default function NotificationsPage() {
  const { items, loading, reload } = useNotifications();
  const { user } = useAuth();

  const markAll = async () => {
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    if (error) toast.error(error.message); else { reload(); toast.success('All marked as read'); }
  };

  const markOne = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    reload();
  };

  return (
    <DashboardShell title="Notifications" description="Stay updated on your print jobs.">
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{items.filter(n => !n.read).length} unread</span>
        <Button variant="outline" size="sm" onClick={markAll}><Check className="h-3.5 w-3.5" /> Mark all read</Button>
      </div>
      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" desc="You'll be notified when jobs update." />
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const Ic = ICON[n.type];
            return (
              <div key={n.id} className={`glass-card p-4 flex items-start gap-4 ${n.read ? 'opacity-60' : ''}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/5 ${COLOR[n.type]}`}><Ic className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.read && <button onClick={() => markOne(n.id)} className="text-xs text-primary hover:underline">Mark read</button>}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
