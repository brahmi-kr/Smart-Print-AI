'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, ArrowLeft, Check, Smartphone, CreditCard,
  Building, Wallet, QrCode, Loader2, Sparkles, Info,
} from 'lucide-react';
import { computeBreakdown, PAYMENT_METHODS, PaymentMethod, PriceBreakdown } from '@/lib/payment';

const ICONS: Record<string, any> = {
  smartphone: Smartphone, 'credit-card': CreditCard, building: Building, wallet: Wallet, 'qr-code': QrCode,
};

export type PendingJob = {
  fileName: string;
  fileSize: number;
  pages: number;
  copies: number;
  colorMode: 'color' | 'bw';
  duplex: boolean;
  paperSize: string;
  orientation: string;
  pageRange: string;
  priority: boolean;
  printerId: string;
  aiResultId?: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const [job, setJob] = useState<PendingJob | null>(null);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('sp_pending_job');
    if (!raw) { router.replace('/dashboard/upload'); return; }
    const j = JSON.parse(raw) as PendingJob;
    setJob(j);
    setBreakdown(computeBreakdown({
      pages: j.pages, copies: j.copies, colorMode: j.colorMode,
      duplex: j.duplex, priority: j.priority, paperSize: j.paperSize,
    }));
  }, [router]);

  if (!job || !breakdown) {
    return (
      <DashboardShell title="Payment" description="Loading job details…">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      </DashboardShell>
    );
  }

  const cancel = () => {
    sessionStorage.removeItem('sp_pending_job');
    router.push('/dashboard/upload');
  };

  const pay = () => {
    setPaying(true);
    sessionStorage.setItem('sp_payment_method', method);
    router.push('/dashboard/payment/processing');
  };

  return (
    <DashboardShell title="Payment" description="Review your order and choose a payment method.">
      <button onClick={cancel} className="nv-chip mb-5 hover:border-primary/40">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to upload
      </button>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Order summary */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Order summary</h3>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{job.fileName}</div>
                  <div className="text-xs text-muted-foreground">{(job.fileSize / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            </div>
            <dl className="space-y-2.5 text-sm">
              <Row label="Pages" value={`${job.pages}`} />
              <Row label="Copies" value={`${job.copies}`} />
              <Row label="Paper size" value={job.paperSize} />
              <Row label="Color mode" value={job.colorMode === 'color' ? 'Color' : 'Black & White'} />
              <Row label="Duplex" value={job.duplex ? 'Yes' : 'No'} />
              <Row label="Page range" value={job.pageRange} />
              <Row label="Priority" value={job.priority ? 'Yes' : 'No'} />
            </dl>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Price breakdown</h3>
            <div className="space-y-2.5 text-sm">
              <Row label="Printing cost" value={`₹${breakdown.baseAmount.toFixed(2)}`} sub={`${breakdown.pages}p × ${breakdown.copies} · ${breakdown.colorMode === 'color' ? 'Color' : 'B/W'}${breakdown.duplex ? ' · Duplex' : ''}`} />
              {breakdown.priorityCharge > 0 && <Row label="Priority charge" value={`₹${breakdown.priorityCharge.toFixed(2)}`} />}
              <Row label="GST (18%)" value={`₹${breakdown.gst.toFixed(2)}`} />
              <Row label="Platform fee" value={`₹${breakdown.platformFee.toFixed(2)}`} />
              <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center">
                <span className="font-semibold">Final amount</span>
                <span className="font-display text-2xl font-bold text-primary">₹{breakdown.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold">Payment method</h3>
              <span className="nv-chip border-success/40 text-success"><ShieldCheck className="h-3 w-3" /> Demo · No real charge</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">This is a demonstration payment system. No real money will be charged.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(m => {
                const Ic = ICONS[m.icon];
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-white/5 bg-white/[0.02] hover:border-primary/30'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-primary/15 text-primary' : 'bg-white/[0.04] text-muted-foreground'}`}>
                      <Ic className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{m.label}</span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {method === 'qr' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col items-center rounded-xl bg-white/[0.02] border border-white/5 p-6">
                <FakeQR value={`upi://pay?pa=smartprint@demo&am=${breakdown.finalAmount}`} />
                <p className="mt-3 text-xs text-muted-foreground">Scan with any UPI app to pay ₹{breakdown.finalAmount.toFixed(2)} (demo)</p>
              </motion.div>
            )}
            {method === 'upi' && (
              <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <label className="text-xs text-muted-foreground">Enter UPI ID (demo)</label>
                <input defaultValue="student@okhdfcbank" className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary/40" />
              </div>
            )}
            {(method === 'card-credit' || method === 'card-debit') && (
              <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Card number (demo)</label>
                  <input defaultValue="4242 4242 4242 4242" className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-primary/40" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">Expiry</label><input defaultValue="12/27" className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-primary/40" /></div>
                  <div><label className="text-xs text-muted-foreground">CVV</label><input defaultValue="123" className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-primary/40" /></div>
                  <div><label className="text-xs text-muted-foreground">ZIP</label><input defaultValue="560001" className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-primary/40" /></div>
                </div>
              </div>
            )}
            {method === 'netbanking' && (
              <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <label className="text-xs text-muted-foreground">Select bank (demo)</label>
                <select className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary/40">
                  <option>HDFC Bank</option><option>State Bank of India</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra</option>
                </select>
              </div>
            )}
            {method === 'wallet' && (
              <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between">
                <div><div className="text-sm font-medium">SmartPrint Wallet</div><div className="text-xs text-muted-foreground">Demo balance: ₹5,000.00</div></div>
                <span className="nv-chip border-success/40 text-success">Sufficient</span>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground">Amount payable</div>
                <div className="font-display text-3xl font-bold">₹{breakdown.finalAmount.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Secured · Demo</div>
            </div>
            <div className="flex gap-3">
              <Button onClick={pay} disabled={paying} className="flex-1 nv-btn-primary h-12">
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pay ₹{breakdown.finalAmount.toFixed(2)} Now</>}
              </Button>
              <Button onClick={cancel} variant="outline" className="h-12 px-6">Cancel</Button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
              <Info className="h-3 w-3" /> No real money is charged. This is a demo transaction.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="text-muted-foreground">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/70">{sub}</div>}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function FakeQR({ value }: { value: string }) {
  const size = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    cells.push(((seed >> 16) & 1) === 1);
  }
  const setFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      const border = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      cells[(r + dr) * size + (c + dc)] = border || inner;
    }
  };
  setFinder(0, 0); setFinder(0, size - 7); setFinder(size - 7, 0);
  return (
    <div className="inline-block bg-white p-3 rounded-xl">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 0 }}>
        {cells.map((on, i) => <div key={i} style={{ width: 6, height: 6, background: on ? '#000' : 'transparent' }} />)}
      </div>
    </div>
  );
}
