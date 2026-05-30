-- ============================================
-- ADMIN PANEL SETUP
-- ============================================

-- 1. Add is_editors_choice to wallpapers
ALTER TABLE wallpapers ADD COLUMN IF NOT EXISTS is_editors_choice boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_wallpapers_editors_choice
  ON wallpapers(is_editors_choice) WHERE is_editors_choice = true;

-- 2. Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Storage bucket for wallpaper uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wallpapers',
  'wallpapers',
  true,
  20971520,  -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow service role full access
CREATE POLICY "Service role full access on wallpapers bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'wallpapers' AND auth.role() = 'service_role');

-- Allow public read access to wallpaper images
CREATE POLICY "Public read access on wallpapers bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');
