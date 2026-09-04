CREATE TABLE public.gallery_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_path text NOT NULL,
  caption text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_videos TO authenticated;
GRANT ALL ON public.gallery_videos TO service_role;
ALTER TABLE public.gallery_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view videos" ON public.gallery_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert videos" ON public.gallery_videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update videos" ON public.gallery_videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete videos" ON public.gallery_videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read video files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'videos');
CREATE POLICY "admin upload video files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update video files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete video files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));