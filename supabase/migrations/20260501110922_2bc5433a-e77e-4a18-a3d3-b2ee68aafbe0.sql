-- Add sprite animation fields to creatures
ALTER TABLE public.creatures
  ADD COLUMN IF NOT EXISTS sprite_frame_size integer NOT NULL DEFAULT 64,
  ADD COLUMN IF NOT EXISTS sprite_fps integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS sprite_idle_url text,
  ADD COLUMN IF NOT EXISTS sprite_idle_frames integer,
  ADD COLUMN IF NOT EXISTS sprite_attack_url text,
  ADD COLUMN IF NOT EXISTS sprite_attack_frames integer,
  ADD COLUMN IF NOT EXISTS sprite_hit_url text,
  ADD COLUMN IF NOT EXISTS sprite_hit_frames integer,
  ADD COLUMN IF NOT EXISTS sprite_die_url text,
  ADD COLUMN IF NOT EXISTS sprite_die_frames integer;

-- Drop legacy image_url since we replace with animations
ALTER TABLE public.creatures DROP COLUMN IF EXISTS image_url;

-- Create public storage bucket for sprite sheets
INSERT INTO storage.buckets (id, name, public)
VALUES ('sprites', 'sprites', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (permissive, admin tool)
DROP POLICY IF EXISTS "Public read sprites" ON storage.objects;
CREATE POLICY "Public read sprites"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sprites');

DROP POLICY IF EXISTS "Public upload sprites" ON storage.objects;
CREATE POLICY "Public upload sprites"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sprites');

DROP POLICY IF EXISTS "Public update sprites" ON storage.objects;
CREATE POLICY "Public update sprites"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sprites');

DROP POLICY IF EXISTS "Public delete sprites" ON storage.objects;
CREATE POLICY "Public delete sprites"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sprites');
