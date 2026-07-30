'use client';

import { DashboardShell, EmptyState, StatCard } from '@/components/dashboard-shell';
import { useAdminPayments, useAdminJobs, useAdminProfiles } from '@/lib/admin-hooks';
import { CreditCard, IndianRupee, CheckCircle2, Clock } from 'lucide-react';

export default function AdminPaymentsPage() {
  const { payments } = useAdminPayments();
  const { jobs } = useAdminJobs();
  const { profiles } = useAdminProfiles();

  const paid = payments.filter(p => p.status === 'paid');
  const total = paid.reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const jobFor = (id: string) => jobs.find(j => j.id === id);
  const userFor = (uid: string) => profiles.find(p => p.id === uid);

  return (
    <DashboardShell title="Payments" description="All transactions across the platform." admin>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Total revenue" value={`₹${total.toFixed(2)}`} color="text-success" />
        <StatCard icon={Clock} label="Pending" value={`₹${pending.toFixed(2)}`} color="text-warning" />
        <StatCard icon={CheckCircle2} label="Paid invoices" value={paid.length} color="text-primary" />
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments" desc="Transactions will appear here." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-3">Student</div>
            <div className="col-span-3">Job</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-2">Status</div>
          </div>
          <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
            {payments.map(p => {
              const job = jobFor(p.print_job_id);
              const stu = job ? userFor(job.user_id) : null;
              return (
                <div key={p.id} className="grid grid-cols-12 px-5 py-3 items-center text-sm">
                  <div className="col-span-3 font-mono text-xs">{p.invoice_number}</div>
                  <div className="col-span-3 truncate text-muted-foreground">{stu?.email || '—'}</div>
                  <div className="col-span-3 truncate text-muted-foreground">{job?.file_name || '—'}</div>
                  <div className="col-span-1 font-medium">₹{Number(p.amount).toFixed(0)}</div>
                  <div className="col-span-2"><span className={`nv-chip capitalize ${p.status === 'paid' ? 'border-success/40 text-success' : p.status === 'failed' ? 'border-destructive/40 text-destructive' : 'border-warning/40 text-warning'}`}>{p.status}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
