/*
# SmartPrint AI — Core Schema

1. Purpose
   Persistent storage for SmartPrint AI: user profiles (student/admin roles),
   printers, print jobs, AI document-quality analysis results, payments,
   notifications, and printer logs.

2. New Tables
   - `profiles` — extends auth.users with role (student|admin), full_name, roll_no, department
   - `printers` — campus printers with capabilities, status, queue length
   - `print_jobs` — student-submitted print jobs with options + status + queue position
   - `ai_results` — document quality analysis (blur, brightness, contrast, noise, skew, resolution, readability, confidence, rating)
   - `payments` — invoice/receipt records for print jobs
   - `notifications` — per-user notifications
   - `printer_logs` — printer state/maintenance log entries

3. Security
   - RLS enabled on every table.
   - profiles: owner-scoped for students; admins read all.
   - printers: students read (online printers); admins full CRUD.
   - print_jobs: owner-scoped for students; admins read all + update status.
   - ai_results, payments, notifications: owner-scoped for students; admins read all.
   - printer_logs: admins full access; students read.

4. Notes
   - Owner columns default to auth.uid() so client inserts omitting user_id succeed.
   - All timestamps default to now().
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  roll_no text DEFAULT '',
  department text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  model text NOT NULL DEFAULT 'Generic LaserJet',
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('online','offline','busy','maintenance')),
  color_supported boolean NOT NULL DEFAULT true,
  duplex_supported boolean NOT NULL DEFAULT true,
  ppm numeric NOT NULL DEFAULT 30,
  max_paper_size text NOT NULL DEFAULT 'A4',
  queue_length integer NOT NULL DEFAULT 0,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  printer_id uuid REFERENCES printers(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  pages integer NOT NULL DEFAULT 1,
  copies integer NOT NULL DEFAULT 1,
  color_mode text NOT NULL DEFAULT 'bw' CHECK (color_mode IN ('color','bw')),
  duplex boolean NOT NULL DEFAULT false,
  paper_size text NOT NULL DEFAULT 'A4',
  orientation text NOT NULL DEFAULT 'portrait',
  page_range text NOT NULL DEFAULT 'all',
  priority integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','printing','completed','cancelled','ready')),
  queue_position integer NOT NULL DEFAULT 0,
  estimated_wait_minutes integer NOT NULL DEFAULT 0,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  pickup_code text DEFAULT '',
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  print_job_id uuid REFERENCES print_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  blur_score numeric NOT NULL DEFAULT 0,
  brightness_score numeric NOT NULL DEFAULT 0,
  contrast_score numeric NOT NULL DEFAULT 0,
  noise_score numeric NOT NULL DEFAULT 0,
  skew_score numeric NOT NULL DEFAULT 0,
  resolution_score numeric NOT NULL DEFAULT 0,
  readability_score numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  quality_rating text NOT NULL DEFAULT 'medium' CHECK (quality_rating IN ('good','medium','poor')),
  suggestions text[] DEFAULT '{}',
  model_name text NOT NULL DEFAULT 'MobileNetV2-CV-v1',
  inference_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  print_job_id uuid REFERENCES print_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  method text NOT NULL DEFAULT 'wallet',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  invoice_number text NOT NULL DEFAULT '',
  receipt_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS printer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  printer_id uuid REFERENCES printers(id) ON DELETE CASCADE,
  event text NOT NULL,
  details text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_print_jobs_user ON print_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON print_jobs(printer_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_results_job ON ai_results(print_job_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_logs ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- printers policies (students read online printers; admins full)
DROP POLICY IF EXISTS "printers_select" ON printers;
CREATE POLICY "printers_select" ON printers FOR SELECT
  TO authenticated USING (status = 'online' OR is_admin());

DROP POLICY IF EXISTS "printers_insert_admin" ON printers;
CREATE POLICY "printers_insert_admin" ON printers FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "printers_update_admin" ON printers;
CREATE POLICY "printers_update_admin" ON printers FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "printers_delete_admin" ON printers;
CREATE POLICY "printers_delete_admin" ON printers FOR DELETE
  TO authenticated USING (is_admin());

-- print_jobs policies (owner or admin)
DROP POLICY IF EXISTS "print_jobs_select_own_or_admin" ON print_jobs;
CREATE POLICY "print_jobs_select_own_or_admin" ON print_jobs FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "print_jobs_insert_own" ON print_jobs;
CREATE POLICY "print_jobs_insert_own" ON print_jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "print_jobs_update_own_or_admin" ON print_jobs;
CREATE POLICY "print_jobs_update_own_or_admin" ON print_jobs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_admin()) WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "print_jobs_delete_own_or_admin" ON print_jobs;
CREATE POLICY "print_jobs_delete_own_or_admin" ON print_jobs FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ai_results policies
DROP POLICY IF EXISTS "ai_results_select_own_or_admin" ON ai_results;
CREATE POLICY "ai_results_select_own_or_admin" ON ai_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "ai_results_insert_own" ON ai_results;
CREATE POLICY "ai_results_insert_own" ON ai_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- payments policies
DROP POLICY IF EXISTS "payments_select_own_or_admin" ON payments;
CREATE POLICY "payments_select_own_or_admin" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_update_own_or_admin" ON payments;
CREATE POLICY "payments_update_own_or_admin" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_admin()) WITH CHECK (auth.uid() = user_id OR is_admin());

-- notifications policies
DROP POLICY IF EXISTS "notifications_select_own_or_admin" ON notifications;
CREATE POLICY "notifications_select_own_or_admin" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- printer_logs policies (admin write, all read)
DROP POLICY IF EXISTS "printer_logs_select" ON printer_logs;
CREATE POLICY "printer_logs_select" ON printer_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "printer_logs_insert_admin" ON printer_logs;
CREATE POLICY "printer_logs_insert_admin" ON printer_logs FOR INSERT
  TO authenticated WITH CHECK (is_admin());
