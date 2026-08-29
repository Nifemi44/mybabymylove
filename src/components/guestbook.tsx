import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Entry = { id: string; name: string; message: string; created_at: string };

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setEntries(data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setBusy(true);
    setNote(null);
    const { error } = await supabase
      .from("guestbook_entries")
      .insert({ name: name.trim(), message: message.trim() });
    if (error) {
      setNote("Couldn't post that — try again in a moment.");
    } else {
      setName("");
      setMessage("");
      setNote("Thank you for the sweet words ♥");
      await load();
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={onSubmit}
        className="luxury-shadow rounded-2xl bg-cream/85 p-6 ring-1 ring-rose/20 sm:p-8"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          required
          className="w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2 font-body"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a sweet message…"
          maxLength={500}
          rows={3}
          required
          className="mt-3 w-full resize-none rounded-lg border border-rose/30 bg-white/70 px-3 py-2 font-body"
        />
        <button
          type="submit"
          disabled={busy}
          className="luxury-clickable mt-4 rounded-full bg-wine px-6 py-2.5 font-heading text-sm uppercase tracking-[0.2em] text-cream disabled:opacity-60"
        >
          {busy ? "Posting…" : "Sign the guestbook"}
        </button>
        {note && <p className="mt-3 font-body text-sm text-wine">{note}</p>}
      </form>

      {entries.length > 0 && (
        <div className="mt-8 space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl bg-white/60 px-5 py-4 ring-1 ring-rose/10"
            >
              <p className="font-body text-lg italic text-ink/80">"{entry.message}"</p>
              <p className="mt-2 font-heading text-xs uppercase tracking-[0.2em] text-rose/70">
                — {entry.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
