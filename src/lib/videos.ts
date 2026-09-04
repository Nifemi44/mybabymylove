import { supabase } from "@/integrations/supabase/client";

export type GalleryVideo = {
  id: string;
  video_path: string;
  caption: string;
  note: string;
  position: number;
  url: string;
};

const BUCKET = "videos";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

/** Fetch all gallery videos with fresh signed playback URLs. */
export async function fetchGalleryVideos(): Promise<GalleryVideo[]> {
  const { data, error } = await supabase
    .from("gallery_videos")
    .select("id, video_path, caption, note, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((r) => r.video_path),
      SIGNED_URL_TTL,
    );
  if (signErr) throw signErr;

  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  return rows.map((r) => ({ ...r, url: urlByPath.get(r.video_path) ?? "" }));
}

/** Upload a video file and create its row. Admin only. */
export async function uploadGalleryVideo(input: {
  file: File;
  caption: string;
  note: string;
  position: number;
}) {
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, {
      contentType: input.file.type || "video/mp4",
      upsert: false,
    });
  if (upErr) throw upErr;

  const { error } = await supabase.from("gallery_videos").insert({
    video_path: path,
    caption: input.caption,
    note: input.note,
    position: input.position,
  });
  if (error) throw error;
}

export async function deleteGalleryVideo(video: { id: string; video_path: string }) {
  const { error } = await supabase.from("gallery_videos").delete().eq("id", video.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([video.video_path]);
}

export async function updateGalleryVideo(
  id: string,
  fields: { caption?: string; note?: string; position?: number },
) {
  const { error } = await supabase.from("gallery_videos").update(fields).eq("id", id);
  if (error) throw error;
}
