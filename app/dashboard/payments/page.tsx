'use client';

import { DashboardShell, EmptyState, StatCard } from '@/components/dashboard-shell';
import { useMyPayments, useMyJobs } from '@/lib/hooks';
import { CreditCard, Download, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const { payments } = useMyPayments();
  const { jobs } = useMyJobs();
  const paid = payments.filter(p => p.status === 'paid');
  const total = paid.reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

  const jobFor = (id: string) => jobs.find(j => j.id === id);

  const downloadInvoice = (inv: string) => {
    const content = `SmartPrint AI — Invoice ${inv}\n\nThank you for using SmartPrint AI.\nThis is a generated invoice record.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${inv}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell title="Payments" description="Invoices, receipts, and payment history.">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Total spent" value={`₹${total.toFixed(2)}`} color="text-success" />
        <StatCard icon={Clock} label="Pending" value={`₹${pending.toFixed(2)}`} color="text-warning" />
        <StatCard icon={CheckCircle2} label="Paid invoices" value={paid.length} color="text-primary" />
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" desc="Your payment history will appear here after your first print job." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Invoice</div>
            <div className="col-span-3">Job</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">PDF</div>
          </div>
          <div className="divide-y divide-white/5">
            {payments.map(p => (
              <div key={p.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-sm">
                <div className="col-span-4 font-mono text-xs">{p.invoice_number}</div>
                <div className="col-span-3 truncate text-muted-foreground">{jobFor(p.print_job_id)?.file_name || '—'}</div>
                <div className="col-span-2 font-medium">₹{Number(p.amount).toFixed(2)}</div>
                <div className="col-span-2">
                  <span className={`nv-chip capitalize ${p.status === 'paid' ? 'border-success/40 text-success' : p.status === 'failed' ? 'border-destructive/40 text-destructive' : 'border-warning/40 text-warning'}`}>{p.status}</span>
                </div>
                <div className="col-span-1 text-right">
                  <Button variant="ghost" size="sm" onClick={() => downloadInvoice(p.invoice_number)}><Download className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
