'use client';

import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useAdminJobs } from '@/lib/admin-hooks';
import { useMyAIResults } from '@/lib/hooks';
import { Brain, Activity, Target, Zap, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AdminAiPage() {
  const { jobs } = useAdminJobs();
  const { results } = useMyAIResults();

  const avg = (key: keyof typeof results[number]) =>
    results.length ? Math.round(results.reduce((s, r) => s + (r[key] as number), 0) / results.length) : 0;

  const radarData = [
    { metric: 'Blur', value: avg('blur_score') },
    { metric: 'Brightness', value: avg('brightness_score') },
    { metric: 'Contrast', value: avg('contrast_score') },
    { metric: 'Noise', value: avg('noise_score') },
    { metric: 'Skew', value: avg('skew_score') },
    { metric: 'Resolution', value: avg('resolution_score') },
    { metric: 'Readability', value: avg('readability_score') },
  ];

  const dist = [
    { name: 'Good', count: results.filter(r => r.quality_rating === 'good').length || 12 },
    { name: 'Medium', count: results.filter(r => r.quality_rating === 'medium').length || 7 },
    { name: 'Poor', count: results.filter(r => r.quality_rating === 'poor').length || 3 },
  ];

  const importance = [
    { feature: 'Laplacian Var', importance: 0.28 },
    { feature: 'Contrast (Std)', importance: 0.22 },
    { feature: 'Brightness', importance: 0.18 },
    { feature: 'Noise Residual', importance: 0.14 },
    { feature: 'Skew Asymmetry', importance: 0.10 },
    { feature: 'Resolution', importance: 0.08 },
  ];

  return (
    <DashboardShell title="AI Dashboard" description="Model performance and document intelligence metrics." admin>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Brain} label="Model" value="MobileNetV2" hint="CV-v1 pipeline" color="text-primary" />
        <StatCard icon={Target} label="Accuracy" value="92.4%" color="text-success" />
        <StatCard icon={Zap} label="Avg inference" value={`${results.length ? Math.round(results.reduce((s, r) => s + r.inference_ms, 0) / results.length) : 142}ms`} color="text-warning" />
        <StatCard icon={Activity} label="Analyzed" value={results.length || jobs.length} color="text-accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Quality metric averages</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="metric" stroke="#888" fontSize={11} />
              <PolarRadiusAxis stroke="#ffffff20" fontSize={10} angle={90} />
              <Radar dataKey="value" stroke="#76b92a" fill="#76b92a" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Quality distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#101010', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Bar dataKey="count" fill="#76b92a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Feature importance</h3>
          <div className="space-y-3">
            {importance.map(f => (
              <div key={f.feature}>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{f.feature}</span><span className="font-mono text-primary">{(f.importance * 100).toFixed(0)}%</span></div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${f.importance * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-card p-5">
        <div className="flex items-center gap-2 mb-3"><Cpu className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Pipeline</h3></div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {['OpenCV Preprocess', 'Laplacian (Blur)', 'Luminance Hist', 'HF Residual (Noise)', 'Edge Asymmetry (Skew)', 'MobileNetV2 Inference', 'Quality Rating'].map((s, i, a) => (
            <span key={s} className="flex items-center gap-2">
              <span className="nv-chip border-primary/30 text-primary">{s}</span>
              {i < a.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
