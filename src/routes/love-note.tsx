import { createFileRoute, Link } from "@tanstack/react-router";
import { useLoveLock, LOVE_KEYS } from "@/lib/love-lock";

const SITE_URL = "https://mybabymylove.lovable.app";

export const Route = createFileRoute("/love-note")({
  head: () => ({
    meta: [
      { title: "Sanaya's Secret Love Note" },
      {
        name: "description",
        content:
          "A hidden love letter for Sanaya, unlocked by playing two little romantic games.",
      },
      { property: "og:title", content: "Sanaya's Secret Love Note" },
      {
        property: "og:description",
        content:
          "A hidden love letter for Sanaya, unlocked by playing two little romantic games.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/love-note` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/love-note` }],
  }),
  component: LoveNotePage,
});

const SECRET_NOTE = `My Sanaya,

If you're reading this, it means you played my little games and found your way in — which is exactly how you found your way into my life: patiently, sweetly, and completely.

There are things I never get to say properly out loud. So here they are. You are the softest part of my day. When everything else is loud, you are the quiet I run to. I love the way you laugh before the joke lands. I love how your eyes go bright when you talk about something you care about. I love that you are brilliant and never make anyone feel small for it.

One year and nine months, and I still get nervous in the best way when your name lights up my phone.

Whatever comes — long days, long distances, ordinary Tuesdays — I am choosing you in all of them. Not just today. Not just on anniversaries. Always.

You are my favourite person in every room, in every year, in every version of this life.

I love you, today and always.

— Nifemi`;

function LoveNotePage() {
  const { state, done, total, unlocked } = useLoveLock();

  return (
    <main className="relative min-h-screen py-24 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          to="/"
          className="font-heading text-xs uppercase tracking-[0.3em] text-wine/50 transition-colors hover:text-wine"
        >
          ← back to our story
        </Link>

        {unlocked ? (
          <article className="mt-8 rounded-2xl bg-cream/90 px-8 py-12 shadow-xl ring-1 ring-rose/25 sm:px-12">
            <p className="text-center font-heading text-xs uppercase tracking-[0.35em] text-rose">
              unlocked with love
            </p>
            <h1 className="mt-4 text-center font-script text-4xl text-wine sm:text-5xl">
              A secret note for Sanaya
            </h1>
            <span className="mx-auto mt-6 block h-px w-20 bg-rose/40" />
            <p className="mt-8 whitespace-pre-line font-body text-lg leading-relaxed text-ink/80 sm:text-xl">
              {SECRET_NOTE}
            </p>
            <p className="mt-10 text-center text-2xl">❤️ 💌 🌹</p>
          </article>
        ) : (
          <section className="mt-8 rounded-2xl bg-cream/85 px-8 py-12 text-center shadow-xl ring-1 ring-rose/25">
            <p className="font-heading text-xs uppercase tracking-[0.35em] text-rose">
              still sealed
            </p>
            <h1 className="mt-4 font-script text-4xl text-wine sm:text-5xl">
              This note is locked, my love
            </h1>
            <p className="mt-5 font-body text-lg italic text-ink/70">
              Win both little games back on our page and this letter opens itself for you.
            </p>

            <ul className="mx-auto mt-8 max-w-xs space-y-3 text-left">
              <li className="flex items-center gap-3 font-body text-base text-ink/75">
                <span className="text-xl">{state[LOVE_KEYS.match] ? "💗" : "🔒"}</span>
                Heart match — find all six pairs
              </li>
              <li className="flex items-center gap-3 font-body text-base text-ink/75">
                <span className="text-xl">{state[LOVE_KEYS.quiz] ? "💗" : "🔒"}</span>
                Our little quiz — four out of four
              </li>
            </ul>

            <p className="mt-6 font-heading text-xs uppercase tracking-[0.3em] text-wine/50">
              {done} of {total} keys found
            </p>

            <Link
              to="/"
              hash="games"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 font-heading text-sm tracking-wide text-cream transition-transform hover:scale-105"
            >
              Go play the games →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
