'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Download, Sparkles, ArrowRight, Copy, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { PaymentResult } from '@/lib/payment';

export default function SuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [jobId, setJobId] = useState('');
  const [pickup, setPickup] = useState('');
  const [job, setJob] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      const r = sessionStorage.getItem('sp_payment_result');
      const jid = sessionStorage.getItem('sp_job_id');
      const pk = sessionStorage.getItem('sp_pickup_code');
      if (!r || !jid) { router.replace('/dashboard/upload'); return; }
      setResult(JSON.parse(r));
      setJobId(jid);
      setPickup(pk || '');
      const { data } = await supabase.from('print_jobs').select('*').eq('id', jid).maybeSingle();
      if (data) setJob(data);
    })();
  }, [router]);

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const amount = result.amount;
  const date = new Date(result.timestamp);

  const downloadReceipt = () => {
    const lines = [
      '=================================',
      '       SmartPrint AI — Receipt    ',
      '=================================',
      '',
      `Transaction ID : ${result.transactionId}`,
      `Payment ID     : ${result.paymentId}`,
      `Date & Time    : ${date.toLocaleString()}`,
      `Method         : ${result.method}`,
      `Print Job ID   : ${jobId}`,
      `Pickup Code    : ${pickup}`,
      '',
      '--- Job Details ---',
      job ? `File          : ${job.file_name}` : '',
      job ? `Pages         : ${job.pages}` : '',
      job ? `Copies        : ${job.copies}` : '',
      job ? `Color Mode    : ${job.color_mode}` : '',
      job ? `Paper Size    : ${job.paper_size}` : '',
      job ? `Duplex        : ${job.duplex ? 'Yes' : 'No'}` : '',
      job ? `Priority      : ${job.priority ? 'Yes' : 'No'}` : '',
      '',
      '--- Amount ---',
      `Amount Paid    : Rs. ${amount.toFixed(2)}`,
      '(Includes GST 18% + Platform Fee)',
      '',
      'Payment Status : PAID',
      '',
      'Thank you for using SmartPrint AI!',
      '=================================',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `receipt-${result.transactionId}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyTxn = () => {
    navigator.clipboard.writeText(result.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-6 py-12">
      <AnimatedGrid />
      <Particles count={40} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card overflow-hidden">
          {/* Success header */}
          <div className="relative p-8 text-center border-b border-white/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15 ring-2 ring-success/40"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="h-12 w-12 text-success" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 font-display text-2xl font-bold text-success"
            >
              Payment Successful
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1 text-sm text-muted-foreground"
            >
              Your print job has been queued.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 inline-flex items-center gap-1.5 nv-chip border-success/30 text-success"
            >
              <Sparkles className="h-3 w-3" /> Demo transaction · No real charge
            </motion.div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-3">
            <DetailRow label="Amount Paid" value={`₹${amount.toFixed(2)}`} highlight />
            <DetailRow label="Transaction ID" value={result.transactionId} mono action={
              <button onClick={copyTxn} className="text-muted-foreground hover:text-primary">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            } />
            <DetailRow label="Payment ID" value={result.paymentId} mono />
            <DetailRow label="Payment Method" value={result.method} />
            <DetailRow label="Date & Time" value={date.toLocaleString()} />
            <DetailRow label="Print Job ID" value={jobId.slice(0, 8) + '…'} mono />
            <DetailRow label="Pickup Code" value={pickup} mono highlight />
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 flex gap-3">
            <Link href="/dashboard/tracking" className="flex-1 nv-btn-primary h-12">
              <Sparkles className="h-4 w-4" /> Track My Print <ArrowRight className="h-4 w-4" />
            </Link>
            <Button onClick={downloadReceipt} variant="outline" className="h-12 px-6">
              <Download className="h-4 w-4" /> Receipt
            </Button>
          </div>

          <div className="px-6 pb-6 text-center">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary">Back to dashboard</Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Logo size={24} />
        </div>
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value, mono, highlight, action }: { label: string; value: string; mono?: boolean; highlight?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-bold text-primary' : 'font-medium'}`}>{value}</span>
        {action}
      </div>
    </div>
  );
}
