import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — For Sanaya" },
      {
        name: "description",
        content: "Private sign-in to manage the photos on our anniversary page.",
      },
      { property: "og:title", content: "Sign in — For Sanaya" },
      {
        property: "og:description",
        content: "Private sign-in to manage the photos on our anniversary page.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mybabymylove.lovable.app/auth" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://mybabymylove.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMessage("Account created. If email confirmation is on, check your inbox.");
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMessage("Google sign-in failed. Try email instead.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-blush px-6 py-16 font-body text-ink">
      <div className="w-full max-w-md rounded-2xl bg-cream/90 p-8 shadow-sm ring-1 ring-rose/20">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">private</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-wine">
          Sign in to add our photos
        </h1>
        <p className="mt-2 font-body text-lg italic text-ink/60">
          Only you need this page — everyone else just sees the love letter.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="font-heading text-xs uppercase tracking-[0.2em] text-wine/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2 text-base outline-none focus:border-rose"
            />
          </div>
          <div>
            <label htmlFor="password" className="font-heading text-xs uppercase tracking-[0.2em] text-wine/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose/30 bg-white/70 px-3 py-2 text-base outline-none focus:border-rose"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-wine px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-cream transition hover:bg-wine/90 disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mt-3 w-full rounded-full border border-wine/25 px-6 py-3 font-heading text-sm uppercase tracking-[0.2em] text-wine transition hover:bg-white/60 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <button
          type="button"
          className="mt-5 w-full font-body text-base italic text-ink/60 underline underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "First time? Create your account" : "Already have an account? Sign in"}
        </button>

        {message && <p className="mt-4 font-body text-base text-wine">{message}</p>}
      </div>
    </main>
  );
}
