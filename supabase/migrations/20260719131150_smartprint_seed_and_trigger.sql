/*
# Seed printers + auto-profile trigger

1. Seed printers
   Insert a set of campus printers across locations with realistic capabilities.
2. Trigger
   Auto-create a profile row when a new auth.users row is inserted.
3. Function
   handle_new_user — inserts profile with email + default role 'student'.
*/

INSERT INTO printers (name, location, model, status, color_supported, duplex_supported, ppm, max_paper_size, queue_length)
VALUES
  ('Library LaserJet Pro', 'Central Library — Floor 1', 'HP LaserJet Pro M404', 'online', false, true, 38, 'A4', 3),
  ('Library ColorJet', 'Central Library — Floor 2', 'HP Color LaserJet Pro M454', 'online', true, true, 25, 'A4', 5),
  ('CS Block Printer A', 'CS Block — Lab 101', 'Canon imageCLASS LBP226dw', 'online', false, true, 45, 'A4', 1),
  ('CS Block Printer B', 'CS Block — Lab 102', 'Canon imageCLASS LBP226dw', 'busy', false, true, 45, 'A4', 8),
  ('ECE Block Printer', 'ECE Block — Hall 2', 'Brother HL-L2350DW', 'online', false, false, 32, 'A4', 2),
  ('Admin High-Speed', 'Admin Block — Room 10', 'Kyocera ECOSYS P3155dn', 'online', false, true, 55, 'A3', 0),
  ('Hostel Printer North', 'North Hostel — Lobby', 'Epson EcoTank L3250', 'online', true, false, 10, 'A4', 6),
  ('Hostel Printer South', 'South Hostel — Lobby', 'Epson EcoTank L3251', 'offline', true, false, 10, 'A4', 0),
  ('Exam Cell Secure', 'Exam Cell — Restricted', 'Ricoh SP 230DNw', 'maintenance', false, true, 30, 'A4', 0)
ON CONFLICT DO NOTHING;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
