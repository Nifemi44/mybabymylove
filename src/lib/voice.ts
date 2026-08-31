import { supabase } from "@/integrations/supabase/client";

export type VoiceNote = {
  id: string;
  storage_path: string;
  created_at: string;
  url: string;
};

const BUCKET = "voice-notes";

/** Fetch the most recently uploaded voice note, if any. */
export async function fetchActiveVoiceNote(): Promise<VoiceNote | null> {
  const { data, error } = await supabase
    .from("voice_notes")
    .select("id, storage_path, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
  return { ...row, url: pub.publicUrl };
}

/** Upload a new voice note, replacing whichever one was active before. Admin only. */
export async function uploadVoiceNote(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp3";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (upErr) throw upErr;

  const { data: oldRows } = await supabase.from("voice_notes").select("id, storage_path");

  const { error: insertErr } = await supabase.from("voice_notes").insert({ storage_path: path });
  if (insertErr) throw insertErr;

  if (oldRows && oldRows.length > 0) {
    await supabase.from("voice_notes").delete().in("id", oldRows.map((r) => r.id));
    await supabase.storage.from(BUCKET).remove(oldRows.map((r) => r.storage_path));
  }
}

export async function deleteVoiceNote(row: { id: string; storage_path: string }) {
  const { error } = await supabase.from("voice_notes").delete().eq("id", row.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([row.storage_path]);
}
