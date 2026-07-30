'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase';

export type Printer = {
  id: string; name: string; location: string; model: string;
  status: 'online' | 'offline' | 'busy' | 'maintenance';
  color_supported: boolean; duplex_supported: boolean;
  ppm: number; max_paper_size: string; queue_length: number;
};

export type PrintJob = {
  id: string; user_id: string; printer_id: string | null;
  file_name: string; file_size: number; pages: number; copies: number;
  color_mode: 'color' | 'bw'; duplex: boolean; paper_size: string;
  orientation: string; page_range: string; priority: number;
  status: 'queued' | 'printing' | 'completed' | 'cancelled' | 'ready';
  queue_position: number; estimated_wait_minutes: number;
  total_price: number; pickup_code: string; progress: number;
  created_at: string; completed_at: string | null;
};

export type Payment = {
  id: string; print_job_id: string; amount: number;
  currency: string; method: string; status: 'pending' | 'paid' | 'failed' | 'refunded';
  invoice_number: string; receipt_number: string; created_at: string;
};

export type Notification = {
  id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error';
  read: boolean; created_at: string;
};

export type AIResultRow = {
  id: string; print_job_id: string;
  blur_score: number; brightness_score: number; contrast_score: number;
  noise_score: number; skew_score: number; resolution_score: number;
  readability_score: number; confidence: number;
  quality_rating: 'good' | 'medium' | 'poor';
  suggestions: string[]; model_name: string; inference_ms: number;
  created_at: string;
};

export function usePrinters() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('printers').select('*').order('name');
    if (!error && data) setPrinters(data as Printer[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { printers, loading, reload: load };
}

export function useMyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setJobs(data as PrintJob[]);
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  return { jobs, loading, reload: load };
}

export function useMyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setPayments(data as Payment[]);
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  return { payments, loading, reload: load };
}

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data as Notification[]);
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  return { items, loading, reload: load };
}

export function useMyAIResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<AIResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ai_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setResults(data as AIResultRow[]);
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  return { results, loading, reload: load };
}
