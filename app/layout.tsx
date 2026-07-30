import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SmartPrint AI — Intelligent Smart Printing & Queue Optimization',
  description:
    'AI-powered smart printing and queue optimization system for universities. Real computer-vision document quality analysis, ML queue prediction, and GPU-accelerated printing workflows.',
  keywords: ['SmartPrint AI', 'AI printing', 'queue optimization', 'computer vision', 'university printing'],
  viewport: { width: 'device-width', initialScale: 1 },
  openGraph: {
    title: 'SmartPrint AI',
    description: 'Printing reimagined with AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster theme="dark" richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
