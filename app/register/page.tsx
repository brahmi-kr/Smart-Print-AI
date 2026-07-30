'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User } from 'lucide-react';

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0..4
}

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const s = useMemo(() => strength(password), [password]);
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (s < 2) { toast.error('Use a stronger password.'); return; }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success('Account created. You are signed in.');
    router.push('/dashboard');
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join SmartPrint AI in seconds."
      footer={<>Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">University email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i < s ? colors[s] : 'bg-white/10'}`} />
                ))}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{labels[s]}</div>
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full nv-btn-primary h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account</>}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          By signing up you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
