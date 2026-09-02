import { useMemo } from "react";
import { HeartMatch } from "@/components/heart-match";
import { LoveQuiz } from "@/components/love-quiz";
import { useLoveLock } from "@/lib/love-lock";

const SECRET_NOTE = `My secret, Sanaya —

even on the days I don't say it out loud, I'm choosing you. Every plan I quietly make has you in it, somewhere. You're not just my girlfriend — you're the person I'm building a whole life around, one ordinary day at a time.

This is the truest thing I know: whatever comes, we come first. That's the secret. That's the promise.

I love you completely, and always.
— Nifemi`;

function GoldBurst() {
  const pieces = useMemo(() => {
    return Array.from({ length: 26 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 150;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance - 40);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 200);
      const size = 12 + Math.round(Math.random() * 10);
      const color = i % 2 === 0 ? "#f4c76b" : "#ef5da8";
      const glyph = ["♥", "✦", "✧"][i % 3];
      return { id: i, tx, ty, rot, delay, size, color, glyph };
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
            animation: `intro-confetti-burst 1.2s ease-out ${p.delay}ms forwards`,
            // @ts-expect-error custom properties consumed by the keyframe
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

/** Two hidden games, each worth one key. Collect both to unlock a secret note. */
export function LoveLockSection() {
  const { state, done, total, unlocked } = useLoveLock();

  return (
    <div className="mx-auto max-w-3xl">
      {/* key progress */}
      <div className="mb-10 flex items-center justify-center gap-3">
        {Object.values(state).map((got, i) => (
          <span
            key={i}
            className={`grid size-9 place-items-center rounded-full text-base transition-all duration-500 ${
              got ? "a-pulse scale-100 bg-gold text-cream shadow-md" : "scale-90 bg-white/10 text-cream/30 ring-1 ring-gold/30"
            }`}
          >
            🔑
          </span>
        ))}
        <span className="ml-2 font-heading text-xs uppercase tracking-[0.25em] text-cream/60">
          {done} of {total} keys found
        </span>
      </div>

      {!unlocked ? (
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="glass-panel rounded-2xl p-6">
            <p className="mb-4 text-center font-heading text-xs uppercase tracking-[0.25em] text-rose">
              game one · memory match
            </p>
            <HeartMatch />
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="mb-4 text-center font-heading text-xs uppercase tracking-[0.25em] text-rose">
              game two · love quiz
            </p>
            <LoveQuiz />
          </div>
        </div>
      ) : (
        <div className="relative">
          <GoldBurst />
          <div className="golden-surprise-pop glass-panel relative z-10 mx-auto max-w-lg rounded-3xl border border-gold/40 px-8 py-10 text-center">
            <span className="text-4xl">🔓</span>
            <p className="mt-4 font-heading text-xs uppercase tracking-[0.35em] text-gold">
              both keys found — the secret is yours
            </p>
            <h3 className="golden-glow-text mt-3 font-script text-3xl sm:text-4xl">
              a secret note
            </h3>
            <p className="mx-auto mt-6 max-w-md whitespace-pre-line text-left font-body text-lg leading-relaxed text-ink/80">
              {SECRET_NOTE}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
