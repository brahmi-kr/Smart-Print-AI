'use client';

import { useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useAuth } from '@/lib/auth-context';
import { useMyJobs, useMyPayments } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User, Mail, Hash, Building2, Loader2, CheckCircle2, Printer, IndianRupee } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { jobs } = useMyJobs();
  const { payments } = useMyPayments();
  const [name, setName] = useState(profile?.full_name || '');
  const [roll, setRoll] = useState(profile?.roll_no || '');
  const [dept, setDept] = useState(profile?.department || '');
  const [saving, setSaving] = useState(false);

  const completed = jobs.filter(j => j.status === 'completed' || j.status === 'ready').length;
  const totalSpent = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: name, roll_no: roll, department: dept,
    }).eq('id', user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated'); refreshProfile(); }
  };

  return (
    <DashboardShell title="Profile" description="Your account details and stats.">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass-card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-glow">
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{profile?.full_name || 'Student'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-3 nv-chip capitalize border-primary/30 text-primary">{profile?.role || 'student'}</span>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <Row icon={Mail} label="Email" value={user?.email || ''} />
            <Row icon={Hash} label="Roll No" value={profile?.roll_no || '—'} />
            <Row icon={Building2} label="Department" value={profile?.department || '—'} />
            <Row icon={User} label="Member since" value={new Date(user?.created_at || Date.now()).toLocaleDateString()} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard icon={Printer} label="Total jobs" value={jobs.length} />
            <StatCard icon={CheckCircle2} label="Completed" value={completed} color="text-success" />
            <StatCard icon={IndianRupee} label="Total spent" value={`₹${totalSpent.toFixed(2)}`} color="text-primary" />
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Edit profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Roll number</Label><Input value={roll} onChange={e => setRoll(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Department</Label><Input value={dept} onChange={e => setDept(e.target.value)} className="mt-1.5" /></div>
            </div>
            <Button onClick={save} disabled={saving} className="nv-btn-primary mt-5 h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update profile'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}
