'use client';

import { useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useAdminPrinters } from '@/lib/admin-hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Printer, Plus, Loader2, Power, Trash2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLOR: Record<string, string> = {
  online: 'border-success/40 text-success',
  busy: 'border-warning/40 text-warning',
  offline: 'border-white/10 text-muted-foreground',
  maintenance: 'border-destructive/40 text-destructive',
};

export default function AdminPrintersPage() {
  const { printers, loading, reload } = useAdminPrinters();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', location: '', model: '', ppm: '30', max_paper_size: 'A4',
    color_supported: true, duplex_supported: true,
  });

  const add = async () => {
    if (!form.name || !form.location) { toast.error('Name and location required'); return; }
    setSaving(true);
    const { error } = await supabase.from('printers').insert({
      name: form.name, location: form.location, model: form.model || 'Generic',
      ppm: +form.ppm || 30, max_paper_size: form.max_paper_size,
      color_supported: form.color_supported, duplex_supported: form.duplex_supported,
      status: 'online', queue_length: 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Printer added');
    setShowAdd(false);
    setForm({ name: '', location: '', model: '', ppm: '30', max_paper_size: 'A4', color_supported: true, duplex_supported: true });
    reload();
  };

  const cycleStatus = async (id: string, current: string) => {
    const next: Record<string, string> = { online: 'busy', busy: 'offline', offline: 'maintenance', maintenance: 'online' };
    const ns = next[current];
    await supabase.from('printers').update({ status: ns }).eq('id', id);
    await supabase.from('printer_logs').insert({ printer_id: id, event: 'status_change', details: `${current} → ${ns}` });
    reload();
  };

  const remove = async (id: string) => {
    await supabase.from('printers').delete().eq('id', id);
    toast.success('Printer removed');
    reload();
  };

  return (
    <DashboardShell title="Manage Printers" description="Add, monitor, and maintain campus printers." admin>
      <div className="flex justify-between items-center mb-4">
        <span className="nv-chip">{printers.length} printers · {printers.filter(p => p.status === 'online').length} online</span>
        <Button onClick={() => setShowAdd(s => !s)} className="nv-btn-primary"><Plus className="h-4 w-4" /> Add printer</Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold mb-4">New printer</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" placeholder="Library LaserJet" /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-1.5" placeholder="Library Floor 1" /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="mt-1.5" placeholder="HP LaserJet Pro" /></div>
                <div><Label>Speed (PPM)</Label><Input type="number" value={form.ppm} onChange={e => setForm({ ...form, ppm: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Max paper</Label><Select value={form.max_paper_size} onValueChange={v => setForm({ ...form, max_paper_size: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="A3">A3</SelectItem><SelectItem value="Letter">Letter</SelectItem></SelectContent></Select></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><Switch checked={form.color_supported} onCheckedChange={c => setForm({ ...form, color_supported: c })} /><span className="text-sm">Color</span></div>
                  <div className="flex items-center gap-2"><Switch checked={form.duplex_supported} onCheckedChange={c => setForm({ ...form, duplex_supported: c })} /><span className="text-sm">Duplex</span></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={add} disabled={saving} className="nv-btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save printer'}</Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Loading…</div>
      ) : printers.length === 0 ? (
        <EmptyState icon={Printer} title="No printers" desc="Add your first campus printer." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map(p => (
            <div key={p.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.location}</div>
                </div>
                <span className={`nv-chip capitalize ${STATUS_COLOR[p.status]}`}>{p.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2"><div className="text-muted-foreground">Model</div><div className="font-medium">{p.model}</div></div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2"><div className="text-muted-foreground">Speed</div><div className="font-medium">{p.ppm} PPM</div></div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2"><div className="text-muted-foreground">Queue</div><div className="font-medium text-primary">{p.queue_length}</div></div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2"><div className="text-muted-foreground">Paper</div><div className="font-medium">{p.max_paper_size}</div></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => cycleStatus(p.id, p.status)}><Power className="h-3.5 w-3.5" /> Cycle status</Button>
                <Button size="sm" variant="outline" onClick={() => cycleStatus(p.id, 'maintenance')}><Wrench className="h-3.5 w-3.5" /> Maintain</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
