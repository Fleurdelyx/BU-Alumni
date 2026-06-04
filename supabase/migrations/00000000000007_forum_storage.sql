-- Create forum-images storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'forum-images');

-- Allow anyone to view images
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'forum-images');

-- Allow authors to delete their own images
CREATE POLICY "Allow authors to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'forum-images' AND owner = auth.uid());
