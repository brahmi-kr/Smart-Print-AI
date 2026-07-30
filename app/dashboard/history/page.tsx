'use client';

import { useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useMyJobs, useMyAIResults } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { History, Filter, FileText, Brain } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HistoryPage() {
  const { jobs } = useMyJobs();
  const { results } = useMyAIResults();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
  const aiFor = (jobId: string) => results.find(r => r.print_job_id === jobId);

  return (
    <DashboardShell title="History" description="All your past print jobs and AI analysis.">
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{filtered.length} jobs</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="printing">Printing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No history yet" desc="Your completed jobs will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map(j => {
            const ai = aiFor(j.id);
            return (
              <div key={j.id} className="glass-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{j.file_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(j.created_at).toLocaleString()} · {j.pages}p × {j.copies} · {j.color_mode === 'color' ? 'Color' : 'B/W'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary">₹{Number(j.total_price).toFixed(2)}</span>
                    <span className={`nv-chip capitalize ${j.status === 'completed' || j.status === 'ready' ? 'border-success/40 text-success' : j.status === 'cancelled' ? 'border-destructive/40 text-destructive' : ''}`}>{j.status}</span>
                  </div>
                </div>
                {ai && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-primary"><Brain className="h-3.5 w-3.5" /> AI: {ai.quality_rating.toUpperCase()}</span>
                    <span className="text-muted-foreground">Confidence {ai.confidence}%</span>
                    <span className="text-muted-foreground">Readability {ai.readability_score}/100</span>
                    <span className="text-muted-foreground font-mono">{ai.inference_ms}ms</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
