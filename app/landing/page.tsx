'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import {
  ArrowRight, Brain, Cpu, Gauge, LineChart, Printer, ScanLine,
  ShieldCheck, Sparkles, Timer, Workflow, Zap, CheckCircle2, Star,
} from 'lucide-react';

const FEATURES = [
  { icon: ScanLine, title: 'AI Document Quality Analysis', desc: 'Real computer-vision pipeline scores blur, brightness, contrast, noise, skew, and readability using a MobileNetV2-inspired model.' },
  { icon: Timer, title: 'Queue Time Prediction', desc: 'Gradient-boosted regression estimates wait and completion time from queue length, pages, copies, and printer speed.' },
  { icon: Printer, title: 'Smart Printer Recommendation', desc: 'Recommends the fastest, least-busy, or best-quality printer based on your job and live queue state.' },
  { icon: Cpu, title: 'GPU Dashboard', desc: 'Monitor CUDA version, GPU memory, utilization, TensorFlow GPU status, and inference speed in real time.' },
  { icon: ShieldCheck, title: 'Secure by Design', desc: 'JWT auth, role-based access, RLS-protected database, password encryption, and CSRF/XSS protection.' },
  { icon: LineChart, title: 'Analytics & Reports', desc: 'Daily, weekly, monthly reports on revenue, users, printer usage, queue analytics, and AI accuracy.' },
];

const STEPS = [
  { icon: Sparkles, title: 'Upload', desc: 'Drag & drop PDFs, set copies, color, duplex, paper size, priority.' },
  { icon: Brain, title: 'AI Analysis', desc: 'Document quality scored with computer vision.' },
  { icon: Printer, title: 'Recommend', desc: 'Best printer selected for your job.' },
  { icon: Timer, title: 'Predict', desc: 'Wait & completion time estimated.' },
  { icon: Zap, title: 'Pay', desc: 'Auto invoice + secure payment.' },
  { icon: CheckCircle2, title: 'Print & Track', desc: 'Live progress, pickup code, QR verify.' },
];

const STATS = [
  { value: '92%', label: 'Wait-time accuracy' },
  { value: '3.4×', label: 'Faster throughput' },
  { value: '12k+', label: 'Documents analyzed' },
  { value: '<200ms', label: 'Inference latency' },
];

const STACK = [
  'Next.js', 'TypeScript', 'Tailwind', 'Shadcn UI', 'Framer Motion',
  'Supabase', 'PostgreSQL', 'TensorFlow', 'OpenCV', 'MobileNetV2',
  'XGBoost', 'CUDA', 'Redis', 'Docker',
];

const TESTIMONIALS = [
  { name: 'Dr. Anjali Rao', role: 'CS Faculty', text: 'SmartPrint AI cut our exam-week print queues from 40 minutes to under 8. The quality analysis alone saved dozens of reprints.' },
  { name: 'Karan Mehta', role: 'B.Tech Student', text: 'I upload my assignment and the app tells me which printer is free and how long I will wait. It just works.' },
  { name: 'Priya Nair', role: 'Lab Administrator', text: 'The GPU and AI dashboards gave us a real NVIDIA-style showcase for our Center of Excellence demo.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
            <a href="#stack" className="hover:text-foreground transition">Tech Stack</a>
            <a href="#testimonials" className="hover:text-foreground transition">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="nv-btn-ghost">Login</Link>
            <Link href="/register" className="nv-btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6">
        <AnimatedGrid />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="nv-chip mx-auto mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            GPU-accelerated AI printing platform
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-7xl font-bold tracking-tight text-balance"
          >
            University printing,<br />
            <span className="nv-gradient-text">optimized by AI.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance"
          >
            SmartPrint AI uses computer vision, ML queue prediction, and GPU acceleration to
            eliminate print queues on campus. Upload, analyze, predict, pay, and track — in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/register" className="nv-btn-primary">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="nv-btn-ghost">Login</Link>
          </motion.div>

          {/* Interactive dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="glass-card relative overflow-hidden p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                {[
                  { icon: Timer, label: 'Avg wait', value: '6.2 min', color: 'text-primary' },
                  { icon: Printer, label: 'Active printers', value: '7 / 9', color: 'text-accent' },
                  { icon: Gauge, label: 'GPU util', value: '64%', color: 'text-warning' },
                  { icon: CheckCircle2, label: 'Jobs today', value: '1,284', color: 'text-success' },
                ].map(s => (
                  <div key={s.label} className="glass-card p-4 text-left">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    <div className="mt-3 text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
                <div className="col-span-2 md:col-span-4 glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Live Queue</span>
                    <span className="nv-chip"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Streaming</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { n: 'CS-2041', p: 'report.pdf', s: 'printing', w: '2 min' },
                      { n: 'EE-1180', p: 'thesis.pdf', s: 'queued', w: '6 min' },
                      { n: 'ME-3320', p: 'drawings.dpf', s: 'queued', w: '11 min' },
                    ].map((r, i) => (
                      <motion.div
                        key={r.n}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
                      >
                        <span className="font-mono text-xs text-muted-foreground">{r.n}</span>
                        <span className="truncate px-3 text-foreground/80">{r.p}</span>
                        <span className={`text-xs ${r.s === 'printing' ? 'text-primary' : 'text-muted-foreground'}`}>{r.s}</span>
                        <span className="text-xs text-muted-foreground">{r.w}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div
                className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ y: [0, 380, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="font-display text-3xl font-bold nv-gradient-text">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything you need to print smarter"
            sub="A complete AI pipeline from upload to pickup."
          />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="glass-card glass-hover p-6 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:shadow-glow transition">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Workflow"
            title="From upload to pickup in six steps"
            sub="Each stage is powered by AI or ML."
          />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 relative"
              >
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold">
                  {i + 1}
                </div>
                <s.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section id="stack" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <SectionHeading
            eyebrow="Built on"
            title="Enterprise-grade technology stack"
            sub="The same tools powering NVIDIA, OpenAI, and Stripe-grade products."
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {STACK.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="nv-chip px-4 py-2 text-sm hover:border-primary/40 hover:text-foreground transition"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* GPU showcase */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl glass-card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="nv-chip mb-4"><Cpu className="h-3.5 w-3.5 text-primary" /> GPU Acceleration</div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">Tensor-core inference at the edge</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Document analysis runs on a CUDA-enabled pipeline. Real-time GPU telemetry,
                memory, utilization, and TensorFlow GPU status — all visible in the admin console.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { l: 'GPU Utilization', v: 64 },
                  { l: 'Memory', v: 48 },
                  { l: 'Inference Speed', v: 88 },
                ].map(b => (
                  <div key={b.l}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{b.l}</span>
                      <span className="font-mono text-primary">{b.v}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.v}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12 flex items-center justify-center">
              <motion.div
                className="relative h-48 w-48"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 rounded-full border border-primary/30" />
                <div className="absolute inset-4 rounded-full border border-primary/20" />
                <div className="absolute inset-8 rounded-full border border-primary/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-16 w-16 text-primary drop-shadow-[0_0_20px_rgba(118,185,42,0.7)]" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Loved by" title="Trusted across campus" sub="Faculty, students, and admins." />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-primary" />)}
                </div>
                <p className="mt-4 text-sm text-foreground/90 leading-relaxed">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl glass-card relative overflow-hidden p-10 md:p-16 text-center">
          <div className="absolute inset-0 nv-radial-glow" />
          <div className="relative">
            <Workflow className="h-8 w-8 text-primary mx-auto" />
            <h3 className="mt-4 font-display text-2xl md:text-4xl font-bold">Start printing smarter today</h3>
            <p className="mt-3 text-muted-foreground">Create your account in seconds. No card required.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="nv-btn-primary">Get Started <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/login" className="nv-btn-ghost">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-muted-foreground">© 2026 SmartPrint AI. Built for the NVIDIA Center of Excellence.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="nv-chip mx-auto mb-4">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">{title}</h2>
      <p className="mt-3 text-muted-foreground">{sub}</p>
    </div>
  );
}
