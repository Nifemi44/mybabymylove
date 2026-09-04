import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteGalleryPhoto,
  fetchGalleryPhotos,
  updateGalleryPhoto,
  uploadGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery";
import { deleteSiteAudio, fetchActiveAudio, uploadSiteAudio, type SiteAudio } from "@/lib/audio";
import { deleteVoiceNote, fetchActiveVoiceNote, uploadVoiceNote, type VoiceNote } from "@/lib/voice";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Manage photos — For Sanaya" },
      {
        name: "description",
        content: "Upload and manage the photos shown in our anniversary gallery.",
      },
      { property: "og:title", content: "Manage photos — For Sanaya" },
      {
        property: "og:description",
        content: "Upload and manage the photos shown in our anniversary gallery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mybabymylove.lovable.app/admin" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://mybabymylove.lovable.app/admin" }],
  }),
  component: AdminPage,
});

type GuestbookEntry = { id: string; name: string; message: string; created_at: string };

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [activeAudio, setActiveAudio] = useState<SiteAudio | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const [activeVoice, setActiveVoice] = useState<VoiceNote | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);

  const [relationshipStart, setRelationshipStart] = useState("");
  const [dateBusy, setDateBusy] = useState(false);
  const [dateMessage, setDateMessage] = useState<string | null>(null);

  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [guestbookBusy, setGuestbookBusy] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      setPhotos(await fetchGalleryPhotos());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load photos.");
    }
  }, []);

  const loadAudio = useCallback(async () => {
    try {
      setActiveAudio(await fetchActiveAudio());
    } catch (err) {
      setAudioMessage(err instanceof Error ? err.message : "Could not load music.");
    }
  }, []);

  const loadVoice = useCallback(async () => {
    try {
      setActiveVoice(await fetchActiveVoiceNote());
    } catch (err) {
      setVoiceMessage(err instanceof Error ? err.message : "Could not load voice note.");
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("relationship_start")
      .eq("id", true)
      .maybeSingle();
    if (data?.relationship_start) {
      // Trim to yyyy-MM-ddTHH:mm for the datetime-local input.
      setRelationshipStart(new Date(data.relationship_start).toISOString().slice(0, 16));
    }
  }, []);

  const loadGuestbook = useCallback(async () => {
    const { data } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false });
    setGuestbook(data ?? []);
  }, []);

  const checkAdmin = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    setIsAdmin((roles?.length ?? 0) > 0);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    void checkAdmin();
    void loadPhotos();
    void loadAudio();
    void loadVoice();
    void loadSettings();
    void loadGuestbook();
  }, [checkAdmin, loadPhotos, loadAudio, loadVoice, loadSettings, loadGuestbook]);

  async function onClaim() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.rpc("claim_owner");
    if (error) setMessage(error.message);
    else if (data === true) {
      setIsAdmin(true);
      setMessage("You're the owner of this page now.");
    } else setMessage("An owner already exists for this page.");
    setBusy(false);
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      await uploadGalleryPhoto({
        file,
        caption,
        note,
        position: photos.length,
      });
      setFile(null);
      setCaption("");
      setNote("");
      (document.getElementById("photo-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("photo-input") as HTMLInputElement).value = "");
      await loadPhotos();
      setMessage("Photo added ♥");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(photo: GalleryPhoto) {
    setBusy(true);
    try {
      await deleteGalleryPhoto(photo);
      await loadPhotos();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveText(photo: GalleryPhoto, fields: { caption: string; note: string }) {
    try {
      await updateGalleryPhoto(photo.id, fields);
      await loadPhotos();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function onUploadAudio(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile) return;
    setAudioBusy(true);
    setAudioMessage(null);
    try {
      await uploadSiteAudio({ file: audioFile, title: audioFile.name });
      setAudioFile(null);
      (document.getElementById("audio-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("audio-input") as HTMLInputElement).value = "");
      await loadAudio();
      setAudioMessage("Background music updated ♥ — it will now autoplay for visitors.");
    } catch (err) {
      setAudioMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAudioBusy(false);
    }
  }

  async function onDeleteAudio() {
    if (!activeAudio) return;
    setAudioBusy(true);
    try {
      await deleteSiteAudio(activeAudio);
      await loadAudio();
      setAudioMessage("Background music removed.");
    } catch (err) {
      setAudioMessage(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setAudioBusy(false);
    }
  }

  async function onUploadVoice(e: React.FormEvent) {
    e.preventDefault();
    if (!voiceFile) return;
    setVoiceBusy(true);
    setVoiceMessage(null);
    try {
      await uploadVoiceNote(voiceFile);
      setVoiceFile(null);
      (document.getElementById("voice-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("voice-input") as HTMLInputElement).value = "");
      await loadVoice();
      setVoiceMessage("Voice note updated ♥ — the teddy bear surprise will now play it.");
    } catch (err) {
      setVoiceMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setVoiceBusy(false);
    }
  }

  async function onDeleteVoice() {
    if (!activeVoice) return;
    setVoiceBusy(true);
    try {
      await deleteVoiceNote(activeVoice);
      await loadVoice();
      setVoiceMessage("Voice note removed.");
    } catch (err) {
      setVoiceMessage(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setVoiceBusy(false);
    }
  }

  async function onSaveDate(e: React.FormEvent) {
    e.preventDefault();
    if (!relationshipStart) return;
    setDateBusy(true);
    setDateMessage(null);
    const { error } = await supabase
      .from("site_settings")
      .update({ relationship_start: new Date(relationshipStart).toISOString() })
      .eq("id", true);
    if (error) setDateMessage(error.message);
    else setDateMessage("Saved ♥ — the live counter on the homepage will use this from now on.");
    setDateBusy(false);
  }

  async function onDeleteGuestbookEntry(id: string) {
    setGuestbookBusy(id);
    await supabase.from("guestbook_entries").delete().eq("id", id);
    await loadGuestbook();
    setGuestbookBusy(null);
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-blush font-body text-ink">
        <p className="font-body text-lg italic text-ink/60">loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blush px-6 py-14 font-body text-ink">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">our gallery</p>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-wine">Manage photos</h1>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-full border border-wine/25 px-4 py-2 font-heading text-xs uppercase tracking-[0.2em] text-wine"
          >
            Sign out
          </button>
        </div>

        {!isAdmin && (
          <div className="mt-8 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20">
            <p className="font-body text-lg text-ink/70">
              This account can't edit the gallery yet. If this page is yours, claim it once — after
              that, no one else can.
            </p>
            <button
              onClick={onClaim}
              disabled={busy}
              className="mt-4 rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
            >
              Claim this page
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20">
            <h2 className="font-heading text-xl font-semibold text-wine">Relationship start</h2>
            <p className="mt-1 font-body text-sm text-ink/55">
              Powers the live ticking counter on the homepage — days, hours, minutes, seconds
              together, counted in real time.
            </p>
            <form onSubmit={onSaveDate} className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="datetime-local"
                value={relationshipStart}
                onChange={(e) => setRelationshipStart(e.target.value)}
                required
                className="rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
              />
              <button
                type="submit"
                disabled={dateBusy || !relationshipStart}
                className="rounded-full bg-wine px-5 py-2.5 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
              >
                {dateBusy ? "Saving…" : "Save date"}
              </button>
            </form>
            {dateMessage && <p className="mt-3 font-body text-base text-wine">{dateMessage}</p>}
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20">
            <h2 className="font-heading text-xl font-semibold text-wine">Background music</h2>
            <p className="mt-1 font-body text-sm text-ink/55">
              Whatever you upload here plays automatically for every visitor, as soon as they open
              the site. Uploading a new track replaces the old one.
            </p>

            {activeAudio && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                <span className="truncate font-body text-base text-ink/80">
                  ♪ {activeAudio.title || "Current track"}
                </span>
                <button
                  onClick={onDeleteAudio}
                  disabled={audioBusy}
                  className="shrink-0 rounded-full border border-wine/25 px-3 py-1.5 font-heading text-xs uppercase tracking-[0.2em] text-wine/70 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            )}

            <form onSubmit={onUploadAudio} className="mt-4">
              <input
                id="audio-input"
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                className="block w-full font-body text-base"
              />
              <button
                type="submit"
                disabled={audioBusy || !audioFile}
                className="mt-4 rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
              >
                {audioBusy ? "Uploading…" : activeAudio ? "Replace track" : "Upload track"}
              </button>
            </form>

            {audioMessage && (
              <p className="mt-4 font-body text-base text-wine">{audioMessage}</p>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20">
            <h2 className="font-heading text-xl font-semibold text-wine">Voice note 🧸</h2>
            <p className="mt-1 font-body text-sm text-ink/55">
              Record yourself saying something sweet and upload it here. It plays inside the golden
              "I love you" surprise when the teddy bear on the site is tapped.
            </p>

            {activeVoice && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                <audio controls src={activeVoice.url} className="h-10 max-w-[70%]" />
                <button
                  onClick={onDeleteVoice}
                  disabled={voiceBusy}
                  className="shrink-0 rounded-full border border-wine/25 px-3 py-1.5 font-heading text-xs uppercase tracking-[0.2em] text-wine/70 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            )}

            <form onSubmit={onUploadVoice} className="mt-4">
              <input
                id="voice-input"
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setVoiceFile(e.target.files?.[0] ?? null)}
                className="block w-full font-body text-base"
              />
              <button
                type="submit"
                disabled={voiceBusy || !voiceFile}
                className="mt-4 rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
              >
                {voiceBusy ? "Uploading…" : activeVoice ? "Replace voice note" : "Upload voice note"}
              </button>
            </form>

            {voiceMessage && (
              <p className="mt-4 font-body text-base text-wine">{voiceMessage}</p>
            )}
          </div>
        )}

        {isAdmin && (
          <form onSubmit={onUpload} className="mt-8 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20">
            <h2 className="font-heading text-xl font-semibold text-wine">Add a photo</h2>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-4 block w-full font-body text-base"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (e.g. The first hello)"
              className="mt-4 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Little note (e.g. where it all began)"
              className="mt-3 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
            />
            <button
              type="submit"
              disabled={busy || !file}
              className="mt-5 rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
            >
              {busy ? "Uploading…" : "Upload photo"}
            </button>
          </form>
        )}

        {message && <p className="mt-5 font-body text-base text-wine">{message}</p>}

        <div className="mt-10 space-y-5">
          {photos.length === 0 && (
            <p className="font-body text-lg italic text-ink/55">
              No photos yet — the gallery still shows the placeholder frames.
            </p>
          )}
          {photos.map((p) => (
            <PhotoRow
              key={p.id}
              photo={p}
              editable={isAdmin}
              onDelete={() => onDelete(p)}
              onSave={(fields) => onSaveText(p, fields)}
            />
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-heading text-2xl font-semibold text-wine">Our videos</h2>

          {isAdmin && (
            <form
              onSubmit={onUploadVideo}
              className="mt-5 rounded-2xl bg-cream/90 p-6 ring-1 ring-rose/20"
            >
              <h3 className="font-heading text-xl font-semibold text-wine">Add a video</h3>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                required
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="mt-4 block w-full font-body text-base"
              />
              <input
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
                placeholder="Caption (e.g. Dancing in the kitchen)"
                className="mt-4 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
              />
              <input
                value={videoNote}
                onChange={(e) => setVideoNote(e.target.value)}
                placeholder="Little note (e.g. you were laughing the whole time)"
                className="mt-3 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
              />
              <button
                type="submit"
                disabled={videoBusy || !videoFile}
                className="mt-5 rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
              >
                {videoBusy ? "Uploading…" : "Upload video"}
              </button>
            </form>
          )}

          {videoMessage && <p className="mt-5 font-body text-base text-wine">{videoMessage}</p>}

          <div className="mt-8 space-y-5">
            {videos.length === 0 && (
              <p className="font-body text-lg italic text-ink/55">
                No videos yet — the video section stays empty until you add one.
              </p>
            )}
            {videos.map((v) => (
              <VideoRow
                key={v.id}
                video={v}
                editable={isAdmin}
                onDelete={() => onDeleteVideo(v)}
                onSave={(fields) => onSaveVideoText(v, fields)}
              />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function PhotoRow({
  photo,
  editable,
  onDelete,
  onSave,
}: {
  photo: GalleryPhoto;
  editable: boolean;
  onDelete: () => void;
  onSave: (fields: { caption: string; note: string }) => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [note, setNote] = useState(photo.note);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-cream/90 p-4 ring-1 ring-rose/20 sm:flex-row sm:items-center">
      <img
        src={photo.url}
        alt={photo.caption || "Gallery photo"}
        loading="lazy"
        className="size-24 shrink-0 rounded-lg object-cover"
      />
      <div className="flex-1 space-y-2">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={!editable}
          className="w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!editable}
          className="w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2"
        />
      </div>
      {editable && (
        <div className="flex gap-2">
          <button
            onClick={() => onSave({ caption, note })}
            className="rounded-full border border-wine/25 px-4 py-2 font-heading text-xs uppercase tracking-[0.2em] text-wine"
          >
            Save
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-wine/25 px-4 py-2 font-heading text-xs uppercase tracking-[0.2em] text-wine/70"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
