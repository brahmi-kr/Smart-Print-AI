'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { predictQueue } from '@/lib/queue-model';
import { computeBreakdown, processPayment, PaymentMethod, METHOD_LABELS } from '@/lib/payment';
import type { PendingJob } from '../page';

const STEPS = [
  'Verifying payment details',
  'Contacting payment gateway (demo)',
  'Authorizing transaction',
  'Generating receipt',
  'Creating print job',
  'Adding to queue',
];

export default function ProcessingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const ranRef = useRef(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      const raw = sessionStorage.getItem('sp_pending_job');
      if (!raw || !user) { router.replace('/dashboard/upload'); return; }
      const job = JSON.parse(raw) as PendingJob;
      const method = (sessionStorage.getItem('sp_payment_method') || 'upi') as PaymentMethod;
      const breakdown = computeBreakdown({
        pages: job.pages, copies: job.copies, colorMode: job.colorMode,
        duplex: job.duplex, priority: job.priority, paperSize: job.paperSize,
      });

      // Animate steps
      for (let i = 0; i < STEPS.length; i++) {
        setStep(i);
        await new Promise(r => setTimeout(r, 450));
      }

      // Process payment (demo)
      const result = await processPayment(breakdown.finalAmount, method);

      if (!result.success) {
        sessionStorage.setItem('sp_payment_result', JSON.stringify(result));
        sessionStorage.setItem('sp_payment_failed', '1');
        router.push('/dashboard/payment/failed');
        return;
      }

      // Create the print job
      const pickup = Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data: printer } = await supabase.from('printers').select('*').eq('id', job.printerId).maybeSingle();
      const pred = predictQueue({
        queueLength: (printer as any)?.queue_length ?? 0,
        pages: job.pages, copies: job.copies, ppm: (printer as any)?.ppm ?? 30,
        priority: job.priority ? 1 : 0, colorMode: job.colorMode,
      });

      const { data: jobRow, error } = await supabase.from('print_jobs').insert({
        user_id: user.id,
        printer_id: job.printerId,
        file_name: job.fileName,
        file_size: job.fileSize,
        pages: job.pages, copies: job.copies,
        color_mode: job.colorMode, duplex: job.duplex, paper_size: job.paperSize,
        orientation: job.orientation, page_range: job.pageRange,
        priority: job.priority ? 1 : 0,
        status: 'queued',
        queue_position: pred.queue_position,
        estimated_wait_minutes: pred.estimated_wait_minutes,
        total_price: breakdown.finalAmount,
        pickup_code: pickup,
        progress: 0,
      }).select().single();

      if (error) {
        // Treat DB error as payment failure for demo safety
        const failResult = { ...result, success: false };
        sessionStorage.setItem('sp_payment_result', JSON.stringify(failResult));
        sessionStorage.setItem('sp_payment_error', error.message);
        router.push('/dashboard/payment/failed');
        return;
      }

      // Save payment as paid with transaction/payment IDs
      await supabase.from('payments').insert({
        print_job_id: jobRow.id,
        user_id: user.id,
        amount: breakdown.finalAmount,
        method: METHOD_LABELS[method],
        status: 'paid',
        invoice_number: result.transactionId,
        receipt_number: result.paymentId,
      });

      // Notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Payment successful',
        message: `Paid ₹${breakdown.finalAmount.toFixed(2)} for ${job.fileName}. Txn ${result.transactionId}. Pickup code: ${pickup}.`,
        type: 'success',
      });

      // AI result (staged from upload page)
      const aiRaw = sessionStorage.getItem('sp_pending_ai');
      if (aiRaw) {
        const aiData = JSON.parse(aiRaw);
        await supabase.from('ai_results').insert({
          print_job_id: jobRow.id, user_id: user.id,
          blur_score: aiData.blur_score, brightness_score: aiData.brightness_score,
          contrast_score: aiData.contrast_score, noise_score: aiData.noise_score,
          skew_score: aiData.skew_score, resolution_score: aiData.resolution_score,
          readability_score: aiData.readability_score, confidence: aiData.confidence,
          quality_rating: aiData.quality_rating, suggestions: aiData.suggestions,
          model_name: aiData.model_name, inference_ms: aiData.inference_ms,
        });
      }

      sessionStorage.setItem('sp_payment_result', JSON.stringify(result));
      sessionStorage.setItem('sp_job_id', jobRow.id);
      sessionStorage.setItem('sp_pickup_code', pickup);
      sessionStorage.removeItem('sp_pending_job');
      sessionStorage.removeItem('sp_payment_method');
      router.push('/dashboard/payment/success');
    })();
  }, [router, user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <AnimatedGrid />
      <Particles count={30} />
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <Logo size={36} className="justify-center mb-8" />

        <motion.div
          className="mx-auto relative h-24 w-24 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-9 w-9 text-primary" />
          </div>
        </motion.div>

        <h1 className="font-display text-2xl font-bold">Processing payment</h1>
        <p className="mt-2 text-sm text-muted-foreground">Securely processing your demo transaction. Please don't close this window.</p>

        <div className="mt-8 space-y-2 text-left">
          {STEPS.map((s, i) => (
            <motion.div
              key={s}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${i < step ? 'border-success/30 bg-success/5 text-success' : i === step ? 'border-primary/40 bg-primary/5 text-primary' : 'border-white/5 bg-white/[0.02] text-muted-foreground'}`}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: i <= step ? 1 : 0.4 }}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i === step ? (
                <motion.div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              ) : <div className="h-4 w-4 rounded-full border-2 border-white/10" />}
              <span>{s}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 256-bit SSL · Demo payment · No real charge
        </div>
      </div>
    </div>
  );
}
