'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Welcome back!');
    router.push('/dashboard');
  };

  return (
    <AuthShell
      title="Sign in to SmartPrint AI"
      subtitle="Enter your credentials to access your dashboard."
      footer={<>Don't have an account? <Link href="/register" className="text-primary hover:underline">Create one</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full nv-btn-primary h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in</>}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <Link href="/admin/login" className="mt-4 w-full nv-btn-ghost h-11">
        <ShieldCheck className="h-4 w-4" /> Admin Login
      </Link>
    </AuthShell>
  );
}
