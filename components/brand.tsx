'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 48 48" width={size} height={size} className="drop-shadow-[0_0_8px_rgba(118,185,42,0.6)]">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9eff3b" />
              <stop offset="100%" stopColor="#76b92a" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#lg)" opacity="0.12" />
          <rect x="6" y="6" width="36" height="36" rx="10" fill="none" stroke="url(#lg)" strokeWidth="1.5" />
          <path d="M16 18h16M16 24h16M16 30h10" stroke="url(#lg)" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="34" cy="30" r="3" fill="url(#lg)" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-display font-bold tracking-tight text-[15px]">
          SmartPrint<span className="text-primary"> AI</span>
        </div>
      </div>
    </div>
  );
}

export function AnimatedGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 nv-grid-bg opacity-60" />
      <div className="absolute inset-0 nv-radial-glow" />
      <motion.div
        className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
}

export function Particles({ count = 40 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(i => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const dur = 6 + (i % 5) * 2;
        const delay = (i % 7) * 0.4;
        return (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/40"
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{ y: [0, -24, 0], opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}
