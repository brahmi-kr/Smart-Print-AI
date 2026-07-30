'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    if (error) { setLoading(false); toast.error(error); return; }
    // Verify admin role
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (uid) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
      if (prof?.role !== 'admin') {
        setLoading(false);
        toast.error('This account does not have admin privileges.');
        await supabase.auth.signOut();
        return;
      }
    }
    setLoading(false);
    toast.success('Welcome, admin.');
    router.push('/admin');
  };

  return (
    <AuthShell
      title="Admin sign in"
      subtitle="Restricted access. Authorized administrators only."
      footer={<>Not an admin? <Link href="/login" className="text-primary hover:underline">Student login</Link></>}
    >
      <div className="mb-6 glass-card p-4 flex items-start gap-3 border-primary/20">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Admin accounts are provisioned by the system. Sign in with an admin email and password.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Admin email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@university.edu" className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full nv-btn-primary h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in as admin</>}
        </Button>
      </form>
    </AuthShell>
  );
}
