'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/brand';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Upload, ListChecks, History, CreditCard,
  Bell, Settings, User, LogOut, Menu, X, Cpu, Brain, Printer,
  Users, BarChart3, Wrench, ScrollText, ShieldCheck, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STUDENT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/upload', label: 'Upload', icon: Upload },
  { href: '/dashboard/queue', label: 'Queue', icon: ListChecks },
  { href: '/dashboard/tracking', label: 'Tracking', icon: Sparkles },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: Brain },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/printers', label: 'Printers', icon: Printer },
  { href: '/admin/queue', label: 'Queue', icon: ListChecks },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/gpu', label: 'GPU Dashboard', icon: Cpu },
  { href: '/admin/ai', label: 'AI Dashboard', icon: Brain },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/admin/logs', label: 'System Logs', icon: ScrollText },
];

export function DashboardShell({
  children, title, description, admin = false,
}: {
  children: React.ReactNode; title: string; description?: string; admin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { items: notifs } = useNotifications();
  const [open, setOpen] = useState(false);
  const nav = admin ? ADMIN_NAV : STUDENT_NAV;

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (admin && profile?.role !== 'admin') router.replace('/dashboard');
    else if (!admin && profile?.role === 'admin' && pathname.startsWith('/dashboard')) {
      // allow admins to view student dashboard too
    }
  }, [loading, user, profile, admin, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const unread = notifs.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/landing');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-secondary/60 backdrop-blur-xl transition-transform md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
          <Link href={admin ? '/admin' : '/dashboard'}><Logo size={26} /></Link>
          <button className="md:hidden text-muted-foreground" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)] no-scrollbar">
          {nav.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                  active ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]',
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.href.includes('notifications') && unread > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{unread}</span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
            {admin ? (
              <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                <ShieldCheck className="h-4 w-4" /> Student View
              </Link>
            ) : (
              profile?.role === 'admin' && (
                <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                  <ShieldCheck className="h-4 w-4" /> Admin Console
                </Link>
              )
            )}
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-white/[0.03]">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-background/70 backdrop-blur-xl px-5">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">{title}</h1>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={admin ? '/admin/notifications' : '/dashboard/notifications'} className="relative nv-chip hover:border-primary/40">
              <Bell className="h-3.5 w-3.5" />
              {unread > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
            </Link>
            <Link href={admin ? '/admin' : '/dashboard/profile'} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{profile?.role || 'student'}</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  icon: Icon, label, value, hint, color = 'text-primary',
}: {
  icon: any; label: string; value: string | number; hint?: string; color?: string;
}) {
  return (
    <div className="glass-card glass-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold">{value}</div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }: { icon: any; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{desc}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
