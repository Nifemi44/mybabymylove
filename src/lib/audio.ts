import { supabase } from "@/integrations/supabase/client";

export type SiteAudio = {
  id: string;
  storage_path: string;
  title: string | null;
  created_at: string;
  url: string;
};

const BUCKET = "site-audio";

/** Fetch the currently active (most recently uploaded) background track, if any. */
export async function fetchActiveAudio(): Promise<SiteAudio | null> {
  const { data, error } = await supabase
    .from("site_audio")
    .select("id, storage_path, title, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
  return { ...row, url: pub.publicUrl };
}

/** Upload a new track and make it the active one. Admin only. Removes the previous track. */
export async function uploadSiteAudio(input: { file: File; title?: string }) {
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "mp3";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { contentType: input.file.type || "audio/mpeg", upsert: false });
  if (upErr) throw upErr;

  // Grab the old rows so we can clean their files up after the new one is saved.
  const { data: oldRows } = await supabase.from("site_audio").select("id, storage_path");

  const { error: insertErr } = await supabase
    .from("site_audio")
    .insert({ storage_path: path, title: input.title ?? input.file.name });
  if (insertErr) throw insertErr;

  if (oldRows && oldRows.length > 0) {
    await supabase
      .from("site_audio")
      .delete()
      .in("id", oldRows.map((r) => r.id));
    await supabase.storage.from(BUCKET).remove(oldRows.map((r) => r.storage_path));
  }
}

export async function deleteSiteAudio(row: { id: string; storage_path: string }) {
  const { error } = await supabase.from("site_audio").delete().eq("id", row.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([row.storage_path]);
}
