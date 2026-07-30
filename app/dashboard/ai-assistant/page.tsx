'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Brain, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type Msg = { role: 'user' | 'ai'; text: string };

const KB: { q: RegExp; a: string }[] = [
  { q: /best printer|recommend/i, a: 'Based on current load, the CS Block Printer A (Lab 101) has the shortest queue and 45 PPM — best for fast pickup.' },
  { q: /wait|queue time|how long/i, a: 'Estimated wait depends on queue length, your page count, and printer speed. Upload your document and I will predict it for you.' },
  { q: /price|cost|how much/i, a: 'B/W is ₹1.0 per sheet, Color is ₹3.5 per sheet. Duplex halves the sheet count. Priority adds ₹10.' },
  { q: /quality|blur|scan/i, a: 'Run AI analysis on upload. I score blur, brightness, contrast, noise, skew, and readability using a MobileNetV2-inspired CV pipeline.' },
  { q: /pickup|qr|code/i, a: 'Each job gets a 6-character pickup code and QR. Show it at the printer to release your document.' },
  { q: /cancel/i, a: 'You can cancel a queued job from the Queue page. Printing or completed jobs cannot be cancelled.' },
];

export default function AIAssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', text: 'Hi! I am your SmartPrint AI assistant. Ask me about printers, wait times, pricing, or document quality.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const hit = KB.find(k => k.q.test(text));
      const answer = hit ? hit.a : 'I can help with printer recommendations, wait-time predictions, pricing, document quality, and pickup codes. Try uploading a document for a full analysis.';
      setMsgs(m => [...m, { role: 'ai', text: answer }]);
      setTyping(false);
    }, 700);
  };

  const suggestions = ['Which printer is best?', 'How much will my print cost?', 'How long is the wait?'];

  return (
    <DashboardShell title="AI Assistant" description="Ask about printers, wait times, pricing, and quality.">
      <div className="glass-card flex flex-col h-[70vh] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><Brain className="h-5 w-5" /></div>
          <div>
            <div className="font-semibold text-sm">SmartPrint Assistant</div>
            <div className="text-xs text-success flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white/[0.04] border border-white/5'}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/[0.04] border border-white/5 rounded-2xl px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2 mb-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} className="nv-chip hover:border-primary/40 text-xs"><Sparkles className="h-3 w-3" /> {s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything about printing…"
              className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <Button onClick={send} className="nv-btn-primary"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
