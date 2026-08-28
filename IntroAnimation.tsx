import { useEffect, useMemo, useState } from "react";

type Stage = "closed" | "opening" | "note" | "done";

const LOVE_NOTE = `My Sanaya,

I don't think I could ever find the right words to fully capture how much you mean to me, but I want to try. From the very first time I saw you, I was captivated — your eyes are the kind of cute that makes it impossible to look away, warm and bright, like they hold a little bit of sunshine in them. Your smile is disarming, effortless, the kind that turns an ordinary day into something worth remembering.

But it isn't just your beauty that pulls me in, though you are, without question, breathtaking. It's your mind — the way you think, the way you carry yourself with such intelligence and grace, the way you challenge me to be better every single day. You are stunning inside and out, a rare combination of beauty and brilliance that I still can't quite believe is mine to love.

Sanaya, I am hopelessly, completely in love with you. Every laugh, every glance, every quiet moment together only deepens what I feel. You are my favorite person, my greatest joy, and the most beautiful soul I know.

I love you, today and always.

— Nifemi`;

const STORAGE_KEY = "sanaya-intro-seen-v2";

function FloatingHearts() {
  const hearts = useMemo(() => {
    const glyphs = ["♥", "♡", "✦", "❀"];
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: Math.round(Math.random() * 96),
      size: 12 + Math.round(Math.random() * 16),
      duration: 7 + Math.round(Math.random() * 8),
      delay: Math.round(Math.random() * 8),
      glyph: glyphs[i % glyphs.length],
    }));
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            position: "absolute",
            bottom: -40,
            left: `${h.left}%`,
            fontSize: h.size,
            color: h.id % 2 === 0 ? "#e7a0a8" : "#c5a059",
            opacity: 0.7,
            animation: `intro-heart-drift ${h.duration}s linear ${h.delay}s infinite`,
          }}
        >
          {h.glyph}
        </span>
      ))}
    </div>
  );
}

function ConfettiBurst() {
  const pieces = useMemo(() => {
    const emojis = ["♥", "♡", "✦"];
    return Array.from({ length: 26 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance - 70);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 150);
      const size = 12 + Math.round(Math.random() * 10);
      const color = i % 3 === 0 ? "#c5a059" : "#e7a0a8";
      return { id: i, tx, ty, rot, delay, size, color, emoji: emojis[i % emojis.length] };
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            fontSize: p.size,
            color: p.color,
            animation: `intro-confetti-burst 1.1s ease-out ${p.delay}ms forwards`,
            // @ts-expect-error custom properties consumed by the keyframe
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export function IntroAnimation() {
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof window === "undefined") return "closed";
    return window.sessionStorage.getItem(STORAGE_KEY) ? "done" : "closed";
  });

  useEffect(() => {
    if (stage === "done") {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  const handleOpen = () => {
    if (stage !== "closed") return;
    setStage("opening");
    window.setTimeout(() => setStage("note"), 950);
  };

  const finish = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setStage("done");
  };

  if (stage === "done") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blush via-cream to-blush">
      <button
        onClick={finish}
        className="absolute right-6 top-6 z-20 font-heading text-[11px] uppercase tracking-[0.25em] text-wine/50 transition-colors hover:text-wine"
      >
        Skip intro
      </button>

      {/* ambient glow, consistent with the homepage hero */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-24 -top-24 size-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(231,160,168,.5), transparent 70%)" }}
        />
        <div
          className="absolute -right-24 bottom-0 size-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(197,160,89,.3), transparent 70%)" }}
        />
      </div>

      <FloatingHearts />

      {(stage === "closed" || stage === "opening") && (
        <div className="relative z-10 flex flex-col items-center" style={{ perspective: "900px" }}>
          <button
            onClick={handleOpen}
            aria-label="Open the letter"
            className={`relative ${stage === "closed" ? "intro-box-bounce" : ""}`}
          >
            <div className="relative h-40 w-64 sm:h-48 sm:w-72">
              {/* envelope pocket */}
              <div className="absolute inset-0 rounded-lg border border-gold/40 bg-cream shadow-2xl" />
              {/* letter tip, peeks out once opening */}
              <div
                className={`absolute inset-x-6 top-3 h-24 rounded-md border border-gold/30 bg-white shadow-md sm:h-28 ${
                  stage === "opening" ? "intro-letter-rise" : "opacity-0"
                }`}
              />
              {/* envelope flap */}
              <div
                className={`absolute inset-x-0 top-0 h-1/2 bg-wine shadow-lg ${
                  stage === "opening" ? "intro-flap-open" : ""
                }`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                }}
              />
              {/* wax seal */}
              <div
                className={`absolute left-1/2 top-[38%] flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cream bg-gold text-lg text-cream shadow-md ${
                  stage === "opening" ? "intro-seal-crack" : ""
                }`}
              >
                ♥
              </div>
            </div>
            {stage === "opening" && <ConfettiBurst />}
          </button>

          <p className="mt-8 font-heading text-xs uppercase tracking-[0.3em] text-wine/60">
            {stage === "closed" ? "tap the letter to open it" : "opening…"}
          </p>
        </div>
      )}

      {stage === "note" && (
        <div className="intro-note-unfold relative z-10 mx-6 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/30 bg-cream px-8 py-10 text-center shadow-2xl sm:px-10">
          <p className="font-heading text-xs uppercase tracking-[0.35em] text-rose">
            happy anniversary
          </p>
          <h1 className="mt-3 font-script text-3xl text-wine sm:text-4xl">
            Nifemi &amp; Sanaya
          </h1>
          <span className="mx-auto mt-4 block h-px w-16 bg-gold/50" />

          <p className="mt-6 whitespace-pre-line text-left font-body text-lg leading-relaxed text-ink/80 sm:text-xl">
            {LOVE_NOTE}
          </p>

          <button
            onClick={finish}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 font-heading text-sm tracking-wide text-cream transition-transform hover:scale-105"
          >
            Continue to our story →
          </button>
        </div>
      )}
    </div>
  );
}
