import { useMemo, useState } from "react";

type Stage = "sealed" | "puzzle" | "revealed";

const CORRECT = "Timileyin";
const OPTIONS_BASE = ["Ayo", "Femi", "Timi", "Timileyin"];

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

const LETTER_COLORS = ["#ef5da8", "#f4c76b", "#a05ad6", "#e0335c", "#e7a0a8", "#c5a059"];

/** Huge confetti burst filling the whole overlay. */
function MegaBurst() {
  const pieces = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 260;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance - 60);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 400);
      const size = 14 + Math.round(Math.random() * 16);
      const glyphs = ["♥", "✦", "✧", "★", "💕"];
      const color = LETTER_COLORS[i % LETTER_COLORS.length];
      return { id: i, tx, ty, rot, delay, size, color, glyph: glyphs[i % glyphs.length] };
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
            animation: `intro-confetti-burst 1.6s ease-out ${p.delay}ms forwards`,
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

/** Big, bouncy, multi-colored "I LOVE YOU", one letter at a time. */
function BigILoveYou() {
  const text = "I LOVE YOU";
  let colorIndex = 0;

  return (
    <h2 className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 px-4">
      {text.split("").map((ch, i) => {
        if (ch === " ") return <span key={i} className="w-3 sm:w-6" />;
        const color = LETTER_COLORS[colorIndex % LETTER_COLORS.length];
        colorIndex += 1;
        return (
          <span
            key={i}
            className="big-letter-pop inline-block font-heading font-black"
            style={{
              color,
              fontSize: "clamp(2.4rem, 11vw, 7rem)",
              textShadow: `0 4px 0 rgba(58,34,41,0.15), 0 0 24px ${color}66`,
              animationDelay: `${i * 90}ms`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </h2>
  );
}

export function SecondNameSurprise() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [wrong, setWrong] = useState<string | null>(null);
  const options = useMemo(() => shuffled(OPTIONS_BASE), [stage === "puzzle"]);

  function pick(option: string) {
    if (option === CORRECT) {
      setStage("revealed");
      return;
    }
    setWrong(option);
    window.setTimeout(() => setWrong(null), 500);
  }

  return (
    <div className="mx-auto max-w-md">
      {stage === "sealed" && (
        <button
          type="button"
          onClick={() => setStage("puzzle")}
          className="glass-panel teddy-hop w-full rounded-2xl px-8 py-10 text-center transition-transform hover:scale-[1.02]"
        >
          <span className="text-4xl">💌</span>
          <p className="mt-4 font-heading text-xs uppercase tracking-[0.3em] text-gold">
            a sealed surprise
          </p>
          <p className="mt-2 font-script text-2xl text-cream sm:text-3xl">
            tap to unlock it
          </p>
        </button>
      )}

      {stage === "puzzle" && (
        <div className="glass-panel rounded-2xl px-6 py-9 text-center sm:px-8">
          <span className="text-3xl">🔐</span>
          <p className="mt-3 font-heading text-xs uppercase tracking-[0.3em] text-gold">
            prove it's really you
          </p>
          <h3 className="mt-2 font-script text-2xl text-cream sm:text-3xl">
            what's my second name?
          </h3>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className={`luxury-clickable rounded-xl bg-wine px-4 py-3 font-heading text-sm text-cream ${
                  wrong === opt ? "puzzle-shake" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {wrong && (
            <p className="mt-4 font-body text-sm italic text-cream/60">
              not quite — try again ♥
            </p>
          )}
        </div>
      )}

      {stage === "revealed" && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-ink/60 backdrop-blur-sm">
          <div aria-hidden="true" className="golden-surprise-bg absolute inset-0" />
          <MegaBurst />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <button
              onClick={() => setStage("sealed")}
              aria-label="Close"
              className="absolute -top-14 right-0 text-2xl text-cream/70 hover:text-cream"
            >
              ✕
            </button>

            <BigILoveYou />

            <p className="mt-8 font-script text-2xl text-cream sm:text-3xl">
              you found the right name, Sanaya —
            </p>
            <p className="mt-2 max-w-md font-body text-lg italic text-cream/85">
              and you already have the whole heart that goes with it. Yours, Timileyin ♥
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
