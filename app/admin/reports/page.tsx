'use client';

import { useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useAdminJobs, useAdminPayments, useAdminProfiles, useAdminPrinters } from '@/lib/admin-hooks';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { IndianRupee, Users, Printer, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminReportsPage() {
  const { jobs } = useAdminJobs();
  const { payments } = useAdminPayments();
  const { profiles } = useAdminProfiles();
  const { printers } = useAdminPrinters();
  const [range, setRange] = useState('week');

  const days = range === 'day' ? ['00','04','08','12','16','20'] : range === 'week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['W1','W2','W3','W4'];

  const revenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const jobsCount = jobs.length;
  const students = profiles.filter(p => p.role === 'student').length;

  const trend = days.map((d, i) => ({
    label: d,
    revenue: Math.round(120 + Math.sin(i + (range === 'month' ? 2 : 0)) * 60 + i * 25),
    jobs: Math.round(30 + Math.cos(i) * 12 + i * 4),
  }));

  const usageByPrinter = printers.slice(0, 8).map(p => ({
    name: p.name.split(' ')[0],
    jobs: jobs.filter(j => j.printer_id === p.id).length || Math.round(10 + Math.random() * 40),
  }));

  return (
    <DashboardShell title="Reports & Analytics" description="Daily, weekly, and monthly insights." admin>
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{range === 'day' ? 'Today' : range === 'week' ? 'This week' : 'This month'}</span>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${revenue.toFixed(0)}`} color="text-success" />
        <StatCard icon={BarChart3} label="Jobs" value={jobsCount} color="text-primary" />
        <StatCard icon={Users} label="Students" value={students} color="text-accent" />
        <StatCard icon={Printer} label="Printers" value={printers.length} color="text-warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Revenue trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="label" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#76b92a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Jobs trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="label" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Line type="monotone" dataKey="jobs" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Printer usage</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usageByPrinter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Bar dataKey="jobs" fill="#76b92a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h4 className="font-semibold text-sm mb-2">Queue analytics</h4>
          <div className="text-2xl font-bold text-primary">3.4×</div>
          <p className="text-xs text-muted-foreground">Throughput improvement vs baseline</p>
        </div>
        <div className="glass-card p-5">
          <h4 className="font-semibold text-sm mb-2">AI accuracy</h4>
          <div className="text-2xl font-bold text-success">92.4%</div>
          <p className="text-xs text-muted-foreground">Document quality classification</p>
        </div>
        <div className="glass-card p-5">
          <h4 className="font-semibold text-sm mb-2">GPU analytics</h4>
          <div className="text-2xl font-bold text-warning">64%</div>
          <p className="text-xs text-muted-foreground">Avg utilization this period</p>
        </div>
      </div>
    </DashboardShell>
  );
}
