'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { useNotifications } from '@/lib/hooks';
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };
const COLOR = { info: 'text-primary', success: 'text-success', warning: 'text-warning', error: 'text-destructive' };

export default function AdminNotificationsPage() {
  const { items, reload } = useNotifications();
  const { user } = useAuth();

  const markAll = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    reload(); toast.success('All marked as read');
  };

  return (
    <DashboardShell title="Notifications" description="Admin alerts and updates." admin>
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{items.filter(n => !n.read).length} unread</span>
        <Button variant="outline" size="sm" onClick={markAll}>Mark all read</Button>
      </div>
      {items.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No notifications.</div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const Ic = ICON[n.type];
            return (
              <div key={n.id} className={`glass-card p-4 flex items-start gap-4 ${n.read ? 'opacity-60' : ''}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/5 ${COLOR[n.type]}`}><Ic className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="flex justify-between"><div className="font-medium text-sm">{n.title}</div><div className="text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div></div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
