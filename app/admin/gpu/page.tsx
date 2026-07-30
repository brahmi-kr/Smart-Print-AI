'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { Cpu, Thermometer, MemoryStick, Gauge as GaugeIcon, Zap, Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AdminGpuPage() {
  const [util, setUtil] = useState(64);
  const [mem, setMem] = useState(48);
  const [temp, setTemp] = useState(41);
  const [series, setSeries] = useState<{ t: string; util: number; mem: number }[]>([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setUtil(u => clamp(u + Math.round((Math.random() - 0.5) * 8), 20, 95));
      setMem(m => clamp(m + Math.round((Math.random() - 0.5) * 4), 30, 80));
      setTemp(t => clamp(t + Math.round((Math.random() - 0.5) * 2), 35, 75));
      setSeries(s => [...s.slice(-19), { t: new Date().toLocaleTimeString().slice(0, 8), util, mem }]);
    }, 2000);
    return () => clearInterval(iv);
  }, [util, mem]);

  return (
    <DashboardShell title="GPU Dashboard" description="Real-time GPU telemetry and CUDA status." admin>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Cpu} label="GPU" value="NVIDIA A100" hint="CUDA 12.4" color="text-primary" />
        <StatCard icon={GaugeIcon} label="Utilization" value={`${util}%`} color="text-success" />
        <StatCard icon={MemoryStick} label="Memory" value={`${mem}%`} hint="40GB HBM2" color="text-warning" />
        <StatCard icon={Thermometer} label="Temperature" value={`${temp}°C`} color="text-accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Live utilization</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#76b92a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#76b92a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="t" stroke="#888" fontSize={10} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Area type="monotone" dataKey="util" stroke="#76b92a" fill="url(#gu)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Runtime status</h3>
          <div className="space-y-3 text-sm">
            <Row icon={Server} label="CUDA Version" value="12.4" />
            <Row icon={Cpu} label="GPU Name" value="NVIDIA A100" />
            <Row icon={MemoryStick} label="GPU Memory" value="40 GB HBM2" />
            <Row icon={Activity} label="TF GPU Status" value="Enabled" ok />
            <Row icon={Zap} label="Inference Speed" value="88 ms" ok />
            <Row icon={GaugeIcon} label="Training Status" value="Idle" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <GaugeBar label="Tensor Core Usage" value={util} />
        <GaugeBar label="Memory Bandwidth" value={mem} />
        <GaugeBar label="Power Draw" value={Math.round(temp * 7)} unit="W" />
      </div>
    </DashboardShell>
  );
}

function Row({ icon: Icon, label, value, ok }: { icon: any; label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4 text-primary" /> {label}</span>
      <span className={`font-mono font-semibold ${ok ? 'text-success' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function GaugeBar({ label, value, unit = '%' }: { label: string; value: number; unit?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold">{value}{unit}</div>
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${value}%` }} />
      </div>
    </motion.div>
  );
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
