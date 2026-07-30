'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

export type AdminPrinter = {
  id: string; name: string; location: string; model: string;
  status: 'online' | 'offline' | 'busy' | 'maintenance';
  color_supported: boolean; duplex_supported: boolean;
  ppm: number; max_paper_size: string; queue_length: number;
};

export type AdminJob = {
  id: string; user_id: string; printer_id: string | null;
  file_name: string; pages: number; copies: number;
  color_mode: 'color' | 'bw'; status: string; queue_position: number;
  estimated_wait_minutes: number; total_price: number; progress: number;
  created_at: string;
};

export type AdminProfile = {
  id: string; email: string; full_name: string; role: string;
  roll_no: string; department: string; created_at: string;
};

export type AdminPayment = {
  id: string; amount: number; status: string; invoice_number: string;
  method: string; created_at: string; print_job_id: string;
};

export type AdminLog = {
  id: string; printer_id: string | null; event: string; details: string;
  created_at: string;
};

export function useAdminPrinters() {
  const [printers, setPrinters] = useState<AdminPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('printers').select('*').order('name');
    if (!error && data) setPrinters(data as AdminPrinter[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { printers, loading, reload: load };
}

export function useAdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('print_jobs').select('*').order('created_at', { ascending: false }).limit(200);
    if (!error && data) setJobs(data as AdminJob[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { jobs, loading, reload: load };
}

export function useAdminProfiles() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setProfiles(data as AdminProfile[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { profiles, loading, reload: load };
}

export function useAdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200);
    if (!error && data) setPayments(data as AdminPayment[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { payments, loading, reload: load };
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('printer_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (!error && data) setLogs(data as AdminLog[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { logs, loading, reload: load };
}
