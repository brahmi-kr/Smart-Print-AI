'use client';

import { useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useAdminProfiles, useAdminJobs } from '@/lib/admin-hooks';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';

export default function AdminStudentsPage() {
  const { profiles, loading } = useAdminProfiles();
  const { jobs } = useAdminJobs();
  const [q, setQ] = useState('');

  const students = profiles.filter(p => p.role === 'student');
  const filtered = students.filter(s =>
    !q || s.email.toLowerCase().includes(q.toLowerCase()) || (s.full_name || '').toLowerCase().includes(q.toLowerCase()) || (s.roll_no || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <DashboardShell title="Manage Students" description="All registered students." admin>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, roll…" className="pl-9" />
        </div>
        <span className="nv-chip">{filtered.length} students</span>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students" desc="Students will appear here after they register." />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Roll</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-1 text-right">Jobs</div>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map(s => {
              const jobCount = jobs.filter(j => j.user_id === s.id).length;
              return (
                <div key={s.id} className="grid grid-cols-12 px-5 py-3 items-center text-sm">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {(s.full_name || s.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{s.full_name || 'Unnamed'}</span>
                  </div>
                  <div className="col-span-3 text-muted-foreground truncate">{s.email}</div>
                  <div className="col-span-2 text-muted-foreground">{s.roll_no || '—'}</div>
                  <div className="col-span-2 text-muted-foreground">{s.department || '—'}</div>
                  <div className="col-span-1 text-right font-mono">{jobCount}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
