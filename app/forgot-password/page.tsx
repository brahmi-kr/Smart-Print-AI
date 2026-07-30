'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success('Reset link sent.');
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link."
      footer={<><Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to login</Link></>}
    >
      {sent ? (
        <div className="glass-card p-5 text-sm text-muted-foreground">
          A password reset link has been sent to <span className="text-foreground font-medium">{email}</span>. Check your inbox.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" className="pl-9" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full nv-btn-primary h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send reset link</>}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
