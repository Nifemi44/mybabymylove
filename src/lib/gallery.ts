import { supabase } from "@/integrations/supabase/client";

export type GalleryPhoto = {
  id: string;
  image_path: string;
  caption: string;
  note: string;
  position: number;
  url: string;
};

const BUCKET = "gallery";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

/** Fetch all gallery photos with fresh signed image URLs. */
export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, image_path, caption, note, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((r) => r.image_path),
      SIGNED_URL_TTL,
    );
  if (signErr) throw signErr;

  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  return rows.map((r) => ({ ...r, url: urlByPath.get(r.image_path) ?? "" }));
}

/** Upload a file to the gallery bucket and create its row. Admin only. */
export async function uploadGalleryPhoto(input: {
  file: File;
  caption: string;
  note: string;
  position: number;
}) {
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (upErr) throw upErr;

  const { error } = await supabase.from("gallery_photos").insert({
    image_path: path,
    caption: input.caption,
    note: input.note,
    position: input.position,
  });
  if (error) throw error;
}

export async function deleteGalleryPhoto(photo: { id: string; image_path: string }) {
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([photo.image_path]);
}

export async function updateGalleryPhoto(
  id: string,
  fields: { caption?: string; note?: string; position?: number },
) {
  const { error } = await supabase.from("gallery_photos").update(fields).eq("id", id);
  if (error) throw error;
}
