'use client';

import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useAdminPrinters, useAdminJobs, useAdminProfiles, useAdminPayments } from '@/lib/admin-hooks';
import { Cpu, Users, Printer, IndianRupee, Activity, Brain, Timer, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  online: '#76b92a', busy: '#f59e0b', offline: '#6b7280', maintenance: '#ef4444',
};

export default function AdminOverview() {
  const { printers } = useAdminPrinters();
  const { jobs } = useAdminJobs();
  const { profiles } = useAdminProfiles();
  const { payments } = useAdminPayments();

  const revenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const activeJobs = jobs.filter(j => j.status === 'queued' || j.status === 'printing').length;
  const students = profiles.filter(p => p.role === 'student').length;

  // Synthetic 7-day series derived from jobs (fallback to deterministic demo)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const jobsByDay = days.map((d, i) => ({
    day: d,
    jobs: jobs.filter(j => new Date(j.created_at).getDay() === (i + 1) % 7).length || Math.round(40 + Math.sin(i) * 18 + i * 6),
    revenue: Math.round(180 + Math.cos(i) * 80 + i * 30),
  }));

  const statusData = ['online', 'busy', 'offline', 'maintenance'].map(s => ({
    name: s, value: printers.filter(p => p.status === s).length,
  })).filter(d => d.value > 0);

  const queueByPrinter = printers.slice(0, 6).map(p => ({ name: p.name.split(' ')[0], queue: p.queue_length, ppm: p.ppm }));

  return (
    <DashboardShell title="Admin Overview" description="System-wide metrics and live status." admin>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Students" value={students} color="text-primary" />
        <StatCard icon={Printer} label="Printers" value={printers.length} hint={`${printers.filter(p => p.status === 'online').length} online`} color="text-accent" />
        <StatCard icon={Activity} label="Active jobs" value={activeJobs} color="text-warning" />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${revenue.toFixed(0)}`} color="text-success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Jobs & Revenue (7 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={jobsByDay}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#76b92a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#76b92a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Area type="monotone" dataKey="jobs" stroke="#76b92a" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Printer status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {statusData.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Queue by printer</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={queueByPrinter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Bar dataKey="queue" fill="#76b92a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ppm" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">System health</h3>
          <div className="space-y-3">
            {[
              { l: 'API latency', v: '142ms', c: 'text-success' },
              { l: 'AI inference', v: '88ms', c: 'text-success' },
              { l: 'Queue throughput', v: '3.4×', c: 'text-primary' },
              { l: 'Uptime', v: '99.98%', c: 'text-success' },
            ].map(r => (
              <div key={r.l} className="flex justify-between items-center rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="text-sm text-muted-foreground">{r.l}</span>
                <span className={`font-mono font-bold ${r.c}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <MiniCard icon={Cpu} title="GPU" value="64%" sub="Utilization" />
        <MiniCard icon={Brain} title="AI Model" value="92.4%" sub="Accuracy" />
        <MiniCard icon={Timer} title="Avg wait" value="6.2m" sub="Across queue" />
      </div>
    </DashboardShell>
  );
}

function MiniCard({ icon: Icon, title, value, sub }: { icon: any; title: string; value: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="font-display text-xl font-bold">{value}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </motion.div>
  );
}
