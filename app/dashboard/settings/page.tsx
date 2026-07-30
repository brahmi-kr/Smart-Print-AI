'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Loader2, Bell, Palette, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [roll, setRoll] = useState(profile?.roll_no || '');
  const [dept, setDept] = useState(profile?.department || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [theme, setTheme] = useState('dark');

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: name, roll_no: roll, department: dept, phone,
    }).eq('id', user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Settings saved'); refreshProfile(); }
  };

  return (
    <DashboardShell title="Settings" description="Manage your account and preferences.">
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5"><SettingsIcon className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Account</h3></div>
          <div className="space-y-4">
            <div><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Roll number</Label><Input value={roll} onChange={e => setRoll(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Department</Label><Input value={dept} onChange={e => setDept(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5" /></div>
            <Button onClick={save} disabled={saving} className="nv-btn-primary w-full h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5"><Bell className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Notifications</h3></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <div><div className="text-sm font-medium">Email notifications</div><div className="text-xs text-muted-foreground">Job status updates via email</div></div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <div><div className="text-sm font-medium">Push notifications</div><div className="text-xs text-muted-foreground">In-app real-time alerts</div></div>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5"><Palette className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Appearance</h3></div>
            <div>
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark (NVIDIA)</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">Dark theme is recommended for the best experience.</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3"><Shield className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Security</h3></div>
            <p className="text-xs text-muted-foreground">Your account is protected with JWT auth, RLS, and encrypted passwords. Password changes are handled via the forgot-password flow.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
