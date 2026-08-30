import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { EnvelopeIntro } from "@/components/envelope-intro";
import { useQuery } from "@tanstack/react-query";
import { useReveal } from "@/hooks/use-reveal";
import { fetchGalleryPhotos } from "@/lib/gallery";
import { PhotoSlideshow } from "@/components/photo-slideshow";
import { BackgroundMusic } from "@/components/background-music";
import { SurpriseCard } from "@/components/surprise-card";

import ogAsset from "@/assets/og-sanaya.jpg.asset.json";

const SITE_URL = "https://mybabymylove.lovable.app";
const OG_IMAGE = `${SITE_URL}${ogAsset.url}`;



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Sanaya — Our Love Story" },
      {
        name: "description",
        content:
          "A little website made with love for Sanaya — celebrating one year and nine months together.",
      },
      { property: "og:title", content: "For Sanaya — Our Love Story" },
      {
        property: "og:description",
        content:
          "A little website made with love for Sanaya — celebrating one year and nine months together.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mybabymylove.lovable.app/" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "For Sanaya — our love story" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://mybabymylove.lovable.app/" }],
  }),
  component: Index,
});

/** Spawns a tiny heart/sparkle burst under the cursor on every click, site-wide. */
function ClickSparkles() {
  useEffect(() => {
    const glyphs = ["♥", "♡", "✦"];
    const colors = ["#7a2e43", "#e7a0a8", "#c5a059"];

    const onClick = (e: MouseEvent) => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.textContent = glyphs[i % glyphs.length] ?? null;
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
        const distance = 28 + Math.random() * 26;
        const lx = Math.cos(angle) * distance;
        const ly = Math.sin(angle) * distance;
        el.className = "luxury-click-burst";
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.style.fontSize = `${10 + Math.round(Math.random() * 6)}px`;
        el.style.color = colors[i % colors.length] ?? "";
        el.style.setProperty("--lx", `${lx}px`);
        el.style.setProperty("--ly", `${ly}px`);
        document.body.appendChild(el);
        window.setTimeout(() => el.remove(), 750);
      }
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return null;
}

/** Wrap a block so it fades/rises in when scrolled into view. */
function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "p" | "h2" | "h3";
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

function Petals() {
  const petals = [
    { left: "8%", w: 14, h: 20, dur: 11, delay: 0 },
    { left: "22%", w: 10, h: 16, dur: 14, delay: 2 },
    { left: "38%", w: 16, h: 22, dur: 12, delay: 1 },
    { left: "54%", w: 11, h: 17, dur: 15, delay: 3 },
    { left: "68%", w: 13, h: 19, dur: 13, delay: 0.5 },
    { left: "80%", w: 12, h: 18, dur: 16, delay: 2.5 },
    { left: "90%", w: 9, h: 14, dur: 12.5, delay: 1.5 },
    { left: "47%", w: 10, h: 15, dur: 17, delay: 4 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Flowers raining down across the screen — red, pink & purple blossoms. */
function FlowerRain() {
  const flowers = useMemo(() => {
    const tints = ["#d63a52", "#f27ba6", "#a05ad6", "#e75480", "#b678e8"];
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: (i * 97) % 100,
      size: 14 + ((i * 13) % 18),
      dur: 9 + ((i * 7) % 9),
      delay: -((i * 1.7) % 12),
      tint: tints[i % tints.length],
      blossom: i % 2 === 0,
    }));
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {flowers.map((f) => (
        <span
          key={f.id}
          className="flower-fall"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.blossom ? (
            /* five-petal blossom: four petals + center */
            <span className="relative block size-full">
              {[0, 72, 144, 216, 288].map((deg) => (
                <span
                  key={deg}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: f.size * 0.52,
                    height: f.size * 0.52,
                    borderRadius: "50% 50% 50% 0",
                    background: f.tint,
                    transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                    transformOrigin: "50% 100%",
                    opacity: 0.9,
                  }}
                />
              ))}
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream"
                style={{ width: f.size * 0.28, height: f.size * 0.28 }}
              />
            </span>
          ) : (
            /* teardrop petal */
            <span
              className="block size-full"
              style={{
                background: f.tint,
                borderRadius: "70% 0 70% 70%",
                opacity: 0.9,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

const FOREVER_PROMISES = [
  {
    title: "Years, not months",
    text: "One year and nine months is only our opening chapter. I'm not here for a season, Sanaya — I'm here for the whole book. Every year, every grey hair, every wrinkle we laugh about.",
  },
  {
    title: "Growing old, staying soft",
    text: "I promise you slow mornings when we're old, your hand in mine on quiet walks, and a love that never stops flirting with you — even when we're eighty and arguing about tea.",
  },
  {
    title: "A future built for two",
    text: "A home full of warmth, dreams chased together, hard days held together. Whatever life brings, I want to face it with you beside me — my partner, my best friend, my forever.",
  },
];

const TIMELINE = [
  {
    when: "The beginning",
    label: "Chapter One",
    title: "The day we met",
    text: "It started quietly — one small conversation that somehow became the most important one of my life. I didn't know it yet, but everything was about to change.",
  },
  {
    when: "A few months in",
    label: "Chapter Two",
    title: "Falling, slowly then all at once",
    text: "Late nights, shared laughs, and the quiet realization that 'me' was becoming 'us.' Somewhere in there I stopped being able to imagine a day without you.",
  },
  {
    when: "One year",
    label: "Chapter Three",
    title: "A whole year of us",
    text: "We celebrated under soft lights, and I promised myself I'd keep choosing you — every single morning, in every little way.",
  },
  {
    when: "Today",
    label: "Chapter Four",
    title: "One year, nine months, and counting",
    text: "You're still the softest, warmest part of my world. This little page is just one more way of saying what I feel every single day.",
  },
];

const GALLERY = [
  { caption: "The first hello", note: "where it all began" },
  { caption: "Holding hands", note: "and never letting go" },
  { caption: "Our first stars", note: "under the same sky" },
  { caption: "That laugh", note: "the one I'd chase anywhere" },
  { caption: "Golden hour", note: "everything warm, everything you" },
  { caption: "Just us", note: "my favorite kind of day" },
];

function Index() {
  const [opened, setOpened] = useState(false);
  const handleOpened = useCallback(() => setOpened(true), []);
  const { data: photos = [] } = useQuery({
    queryKey: ["gallery-photos"],
    queryFn: fetchGalleryPhotos,
  });

  return (
    <>
    <div aria-hidden="true" className="luxury-gradient-bg" />
    <ClickSparkles />
    {!opened && <EnvelopeIntro onOpened={handleOpened} />}
    {opened && <FlowerRain />}
    {opened && <BackgroundMusic autoStart />}

    <div key={opened ? "opened" : "sealed"} className="min-h-screen bg-blush/95 font-body text-ink">
      {/* ---------- HERO: animated welcome ---------- */}
      <section className="relative min-h-screen overflow-hidden bg-blush/0">
        {/* ambient glow blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="a-floaty a-pulse absolute -left-24 -top-24 size-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(231,160,168,.55), transparent 70%)",
            }}
          />
          <div
            className="a-floaty2 a-pulse absolute top-1/3 -right-32 size-[28rem] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(231,160,168,.4), transparent 70%)",
            }}
          />
          <div
            className="a-pulse absolute bottom-0 left-1/4 size-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(122,46,67,.18), transparent 70%)",
            }}
          />
        </div>

        <Petals />

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* top ribbon */}
          <div className="a-fade-1 flex items-center justify-between px-8 py-6 md:px-16">
            <div className="flex items-center gap-3">
              <span className="text-xl text-rose">♥</span>
              <span className="font-heading text-sm uppercase tracking-[0.25em] text-wine/70">
                Our Love Story
              </span>
            </div>
            <span className="font-heading text-sm uppercase tracking-[0.25em] text-wine/70">
              Est. 2024
            </span>
          </div>

          {/* welcome hero — vertically centered */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-6 text-center">
          <p className="a-fade-2 font-heading text-base uppercase tracking-[0.35em] text-rose md:text-lg">
            A little website, made only for you
          </p>

          <h1
            className="a-name mt-8 font-heading leading-[0.95] text-wine"
            style={{ fontSize: "clamp(3.5rem, 13vw, 11rem)", fontWeight: 500 }}
          >
            Sanaya
          </h1>

          {/* heart flourish */}
          <div className="mt-2 flex justify-center">
            <div className="a-heart">
              <span className="text-4xl text-rose md:text-5xl">♥</span>
            </div>
          </div>

          <p className="a-fade-3 mx-auto mt-10 max-w-2xl font-body text-2xl italic leading-relaxed text-ink/80 md:text-3xl">
            My love, my light, my favorite person in the whole world — this page
            is a small window into how much you mean to me.
          </p>

          <div className="a-fade-4 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#story"
              className="luxury-clickable luxury-shadow inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 font-heading text-sm tracking-wide text-cream"
            >
              Begin our story →
            </a>
            <span className="font-body text-lg italic text-wine/70">
              1 year & 9 months, and counting
            </span>
          </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
          <span className="text-[10px] uppercase tracking-widest text-wine/50">
            scroll
          </span>
        </div>
      </section>

      {/* ---------- LOVE DECLARATION ---------- */}
      <section className="relative bg-cream/90 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose/80">
              For my
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-script text-3xl text-wine md:text-5xl">
              <span>my love</span>
              <span className="text-rose">♥</span>
              <span className="italic">my sunshine</span>
              <span className="text-rose">♥</span>
              <span>my heart</span>
              <span className="text-rose">♥</span>
              <span className="italic">my queen</span>
              <span className="text-rose">♥</span>
              <span>my home</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="mt-12 font-heading text-4xl font-semibold leading-tight text-wine md:text-5xl">
              I love you, Sanaya — more than the words on this page could ever
              hold.
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-8 max-w-[56ch] text-pretty font-body text-lg leading-relaxed text-ink/75 md:text-xl">
              You are my calm and my favorite adventure, my good morning and my
              softest reason to smile. Every day with you feels like a gift I
              get to unwrap again, and I never want to stop. Here's to us — and
              to every tomorrow I get to spend beside you.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <span className="luxury-divider mx-auto mt-10 block w-32" />
          </Reveal>
        </div>
      </section>

      {/* ---------- CONFESSION: a letter from me ---------- */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 110% at 30% 10%, #fbe6ea 0%, #f7d9df 60%, #f3cdd5 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <Reveal className="text-center">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose">
              a confession, from Nifemi
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-wine md:text-5xl">
              everything I see in you
            </h2>
          </Reveal>

          <Reveal delay={120} as="div" className="mt-12">
            <div className="luxury-shadow relative rounded-sm bg-cream/80 p-8 ring-1 ring-rose/20 sm:p-10">
              <span
                aria-hidden="true"
                className="absolute -top-4 left-8 font-script text-6xl leading-none text-rose/30"
              >
                &ldquo;
              </span>
              <p className="space-y-6 font-body text-lg leading-relaxed text-ink/80 md:text-xl">
                <span className="block">
                  Sanaya, my love — let me say this plainly, because you deserve to
                  hear it over and over. You are breathtakingly beautiful. Not just
                  the kind of beauty that turns heads, though it does, but the kind
                  that fills a room and makes everything else feel a little quieter.
                  Your eyes — those eyes — are my favorite thing in this whole world.
                  They hold so much: warmth, mischief, gentleness, and a light that
                  I could happily drown in. One look from you and I forget every
                  worry I carried into the day.
                </span>
                <span className="block">
                  And your mind, my love. You are so intelligent it humbles me. The
                  way you think, the way you notice things I would have missed, the
                  way you turn ordinary moments into something worth remembering —
                  it reminds me how lucky I am to be yours. You are beauty and
                  brilliance wrapped in one person, and somehow that person chose
                  me. I love you, Sanaya. I love your eyes, your laugh, your mind,
                  your heart. I love all of you, and I will keep loving you, loudly
                  and softly, for as long as you let me.
                </span>
              </p>
              <p className="mt-8 text-right font-script text-3xl text-wine">
                — always yours, Nifemi
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- TIMELINE: our journey ---------- */}
      <section id="story" className="relative scroll-mt-4 py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose">
              our story, so far
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-wine md:text-5xl">
              a year, nine months, and counting
            </h2>
            <p className="mt-4 font-body text-xl italic text-ink/60">
              every chapter, written with you.
            </p>
          </Reveal>

          <div className="relative mx-auto mt-16 max-w-xl">
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-3 top-1 w-px bg-rose/40"
            />
            <div className="space-y-12 pl-12">
              {TIMELINE.map((m, i) => (
                <Reveal key={i} delay={i * 80} className="relative">
                  <span
                    className={`absolute -left-12 top-1 size-3 rounded-full ring-4 ring-blush ${
                      i === TIMELINE.length - 1 ? "bg-rose" : "bg-gold"
                    }`}
                  />
                  <p className="font-heading text-xs uppercase tracking-[0.25em] text-gold">
                    {m.label} · {m.when}
                  </p>
                  <h3 className="mt-1 font-heading text-2xl font-medium text-wine">
                    {m.title}
                  </h3>
                  <p className="mt-2 max-w-[56ch] text-pretty font-body text-lg text-ink/70">
                    {m.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOREVER: long-term love ---------- */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="a-color-drift absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #d63a52 0%, #f27ba6 28%, #a05ad6 58%, #e75480 82%, #d63a52 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 90% at 50% 50%, transparent 30%, rgba(58,34,41,.35) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-cream/80">
              for the long run
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-cream md:text-6xl">
              not just today, Sanaya — forever
            </h2>
            <p className="mx-auto mt-6 max-w-[52ch] text-pretty font-body text-xl italic leading-relaxed text-cream/90 md:text-2xl">
              Anyone can love someone for a moment. I choose you for a
              lifetime — through every season, every storm, every slow and
              ordinary Tuesday.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
            {FOREVER_PROMISES.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="luxury-clickable h-full rounded-2xl bg-cream/10 p-6 ring-1 ring-cream/25 backdrop-blur-sm">
                  <span className="text-2xl text-cream">♥</span>
                  <h3 className="mt-3 font-heading text-xl font-medium text-cream">
                    {p.title}
                  </h3>
                  <p className="mt-2 font-body text-lg leading-relaxed text-cream/85">
                    {p.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-14 font-script text-3xl text-cream md:text-4xl">
              you &amp; me, always — that's the whole plan.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- PHOTO GALLERY (placeholders for later) ---------- */}
      <section className="relative bg-cream/90 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose">
              little moments we keep
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-wine md:text-5xl">
              our gallery, waiting to fill
            </h2>
            <p className="mt-4 font-body text-lg italic text-ink/55">
              these little frames are waiting for our pictures — I'll fill them
              in soon, just for us.
            </p>
          </Reveal>

          <PhotoSlideshow
            photos={
              photos.length > 0
                ? photos.map((p) => ({
                    caption: p.caption,
                    note: p.note,
                    url: p.url,
                  }))
                : GALLERY.map((g) => ({ ...g, url: "" }))
            }
          />


        </div>
      </section>

      {/* ---------- CLOSING LOVE NOTE ---------- */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 100%, #f7e3e6 0%, #fbedea 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <p className="font-heading text-3xl font-medium leading-tight text-wine md:text-4xl">
              P.S. — I love you, Sanaya. Today, tomorrow, and every day after.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 font-script text-3xl text-ink/70">
              always & forever yours
            </p>
          </Reveal>
          <Reveal delay={200}>
            <span className="luxury-divider mx-auto mt-8 block w-24" />
          </Reveal>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-rose/20 py-8 text-center">
        <p className="font-body text-lg italic text-wine/70">
          Made with all my heart, for Sanaya ♥
        </p>
        <Link
          to="/admin"
          className="mt-3 inline-block font-body text-xs uppercase tracking-[0.2em] text-ink/25 hover:text-wine/60"
        >
          owner
        </Link>

      </footer>
    </div>
    </>
  );
}
