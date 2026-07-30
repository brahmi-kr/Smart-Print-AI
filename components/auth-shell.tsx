'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import { ArrowLeft } from 'lucide-react';

export function AuthShell({
  title, subtitle, children, footer,
}: {
  title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-secondary flex-col justify-between p-12">
        <AnimatedGrid />
        <Particles count={30} />
        <div className="relative z-10">
          <Logo size={36} />
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Printing <span className="nv-gradient-text">reimagined</span> with AI.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Computer vision, ML queue prediction, and GPU acceleration for the modern campus.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[['92%', 'Accuracy'], ['3.4×', 'Faster'], ['<200ms', 'Inference']].map(([v, l]) => (
              <div key={l} className="glass-card p-4">
                <div className="font-display text-xl font-bold text-primary">{v}</div>
                <div className="text-[11px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-muted-foreground">© 2026 SmartPrint AI</div>
      </div>

      {/* Right form panel */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/landing" className="nv-chip mb-8 inline-flex">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
