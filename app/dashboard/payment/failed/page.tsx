'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { XCircle, RotateCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { PaymentResult } from '@/lib/payment';

export default function FailedPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const r = sessionStorage.getItem('sp_payment_result');
    const err = sessionStorage.getItem('sp_payment_error');
    if (r) setResult(JSON.parse(r));
    if (err) setError(err);
  }, []);

  const retry = () => {
    sessionStorage.removeItem('sp_payment_result');
    sessionStorage.removeItem('sp_payment_error');
    sessionStorage.removeItem('sp_payment_failed');
    router.push('/dashboard/payment');
  };

  const back = () => {
    sessionStorage.removeItem('sp_payment_result');
    sessionStorage.removeItem('sp_payment_error');
    sessionStorage.removeItem('sp_payment_failed');
    router.push('/dashboard/upload');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-6 py-12">
      <AnimatedGrid />
      <Particles count={30} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card overflow-hidden">
          <div className="relative p-8 text-center border-b border-white/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 ring-2 ring-destructive/40"
            >
              <XCircle className="h-12 w-12 text-destructive" />
            </motion.div>
            <h1 className="mt-5 font-display text-2xl font-bold text-destructive">Payment Failed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {error ? 'An error occurred while creating your print job.' : 'Your demo payment could not be processed.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 nv-chip border-warning/30 text-warning">
              <AlertTriangle className="h-3 w-3" /> No money was charged
            </div>
          </div>

          {result && (
            <div className="p-6 space-y-3">
              <Row label="Transaction ID" value={result.transactionId} mono />
              <Row label="Payment ID" value={result.paymentId} mono />
              <Row label="Amount" value={`₹${result.amount.toFixed(2)}`} />
              <Row label="Time" value={new Date(result.timestamp).toLocaleString()} />
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-mono break-all">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="p-6 pt-2 flex flex-col gap-3">
            <Button onClick={retry} className="nv-btn-primary h-12">
              <RotateCw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={back} variant="outline" className="h-12">
              <ArrowLeft className="h-4 w-4" /> Back to Upload
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/dashboard"><Logo size={24} /></Link>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : ''} font-medium`}>{value}</span>
    </div>
  );
}
