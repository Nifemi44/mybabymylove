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

  const loadPhotos = useCallback(async () => {
    try {
      setPhotos(await fetchGalleryPhotos());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load photos.");
    }
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
  }, [checkAdmin, loadPhotos]);

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
