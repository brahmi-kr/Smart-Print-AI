'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo, AnimatedGrid, Particles } from '@/components/brand';
import { Cpu, ScanLine, Bot, Printer, Boxes, Sparkles } from 'lucide-react';

const TECH = ['TensorFlow', 'CUDA', 'CNN', 'OpenCV', 'Deep Learning', 'Computer Vision'];

export default function IntroPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && sessionStorage.getItem('sp_intro_seen');
    if (seen) {
      router.replace('/landing');
      return;
    }
    const start = Date.now();
    const dur = 3000;
    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / dur) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setDone(true);
        sessionStorage.setItem('sp_intro_seen', '1');
        setTimeout(() => router.replace('/landing'), 450);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [router]);

  const skip = () => {
    sessionStorage.setItem('sp_intro_seen', '1');
    router.replace('/landing');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center">
      <AnimatedGrid />
      <Particles count={50} />

      <button
        onClick={skip}
        className="absolute top-6 right-6 z-20 nv-chip hover:border-primary/40"
      >
        Skip Intro
      </button>

      <AnimatePresence>
        {!done && (
          <motion.div
            className="relative z-10 flex flex-col items-center px-6 text-center"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Logo size={56} className="justify-center" />
            </motion.div>

            <motion.h1
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-8 font-display text-3xl md:text-5xl font-bold tracking-tight text-balance"
            >
              PRINTING REIMAGINED <span className="nv-gradient-text">WITH AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-sm md:text-base text-muted-foreground max-w-md"
            >
              GPU-accelerated document intelligence, queue optimization, and computer vision for campus printing.
            </motion.p>

            {/* Floating chips */}
            <div className="mt-10 grid grid-cols-3 gap-4 md:gap-6 max-w-xl">
              {[
                { icon: Printer, label: '3D Printer' },
                { icon: Bot, label: 'Robot Arm' },
                { icon: ScanLine, label: 'Scanner' },
                { icon: Cpu, label: 'AI Chip' },
                { icon: Boxes, label: 'Tensor Core' },
                { icon: Sparkles, label: 'Inference' },
              ].map((it, i) => (
                <motion.div
                  key={it.label}
                  className="glass-card flex flex-col items-center gap-2 px-4 py-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: [0, -8, 0], opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 4 + i * 0.3, repeat: Infinity }}
                >
                  <it.icon className="h-6 w-6 text-primary" />
                  <span className="text-[11px] text-muted-foreground">{it.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Tech ticker */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {TECH.map((t, i) => (
                <motion.span
                  key={t}
                  className="nv-chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.12 }}
                >
                  {t}
                </motion.span>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-10 w-72 max-w-full">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Initializing AI pipeline…</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
