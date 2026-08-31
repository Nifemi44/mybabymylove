import { useEffect, useMemo, useRef, useState } from "react";

const NAME = "NIFEMI".split("");
const ROUND_MS = 5000;

type Tile = { id: number; letter: string; used: boolean };

function shuffledTiles(): Tile[] {
  const tiles = NAME.map((letter, id) => ({ id, letter, used: false }));
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

/** A little letter puzzle, against a 5-second clock: spell "Nifemi" before time runs out. */
export function NamePuzzle() {
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => shuffledTiles());
  const [filled, setFilled] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const intervalRef = useRef<number | null>(null);

  // Start (and restart, per round) the 5-second countdown.
  useEffect(() => {
    setTimeLeft(ROUND_MS);
    setTimedOut(false);
    const startedAt = Date.now();

    intervalRef.current = window.setInterval(() => {
      const remaining = ROUND_MS - (Date.now() - startedAt);
      if (remaining <= 0) {
        setTimeLeft(0);
        setTimedOut(true);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [round]);

  const bursts = useMemo(() => {
    return Array.from({ length: 26 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 150;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance - 40);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 200);
      const size = 12 + Math.round(Math.random() * 10);
      const color = i % 2 === 0 ? "#f4c76b" : "#e7a0a8";
      const glyph = ["♥", "✦", "✧"][i % 3];
      return { id: i, tx, ty, rot, delay, size, color, glyph };
    });
  }, [solved]);

  function tap(tile: Tile) {
    if (tile.used || solved || timedOut) return;
    const nextIndex = filled.length;
    const expected = NAME[nextIndex];

    if (tile.letter !== expected) {
      setShakeId(tile.id);
      window.setTimeout(() => setShakeId(null), 400);
      return;
    }

    const nextFilled = [...filled, tile.letter];
    setFilled(nextFilled);
    setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));

    if (nextFilled.length === NAME.length) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.setTimeout(() => setSolved(true), 250);
    }
  }

  function playAgain() {
    setTiles(shuffledTiles());
    setFilled([]);
    setSolved(false);
    setRound((r) => r + 1);
  }

  const secondsLeft = Math.ceil(timeLeft / 1000);
  const pctLeft = Math.max(0, (timeLeft / ROUND_MS) * 100);
  const urgent = timeLeft <= 2000 && !solved && !timedOut;

  return (
    <div className="luxury-shadow relative mx-auto max-w-md overflow-hidden rounded-2xl bg-cream/85 p-8 text-center ring-1 ring-rose/20">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">a little puzzle</p>
      <h3 className="mt-2 font-heading text-2xl font-semibold text-wine">
        can you spell his name in 5 seconds?
      </h3>

      {!solved ? (
        <>
          {/* countdown */}
          <div className="mx-auto mt-6 flex max-w-[220px] items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full rounded-full bg-rose transition-[width] duration-100 ease-linear"
                style={{
                  width: `${pctLeft}%`,
                  backgroundColor: urgent ? "#7a2e43" : undefined,
                }}
              />
            </div>
            <span
              className={`font-heading text-lg font-semibold tabular-nums ${
                urgent ? "timer-pulse text-wine" : "text-rose"
              }`}
            >
              {timedOut ? 0 : secondsLeft}s
            </span>
          </div>

          {/* answer slots */}
          <div className="mt-7 flex justify-center gap-2">
            {NAME.map((letter, i) => (
              <div
                key={i}
                className="grid size-11 place-items-center rounded-lg border-2 border-dashed border-gold/40 bg-white/60 font-heading text-xl font-semibold text-wine sm:size-12"
              >
                {filled[i] ?? ""}
              </div>
            ))}
          </div>

          {timedOut ? (
            <div className="mt-8">
              <p className="font-body text-lg italic text-ink/70">
                Time's up! Take another shot ♥
              </p>
              <button
                onClick={playAgain}
                className="luxury-clickable mt-4 rounded-full bg-wine px-6 py-2.5 font-heading text-sm uppercase tracking-[0.2em] text-cream"
              >
                try again
              </button>
            </div>
          ) : (
            <>
              {/* letter pool */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {tiles.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => tap(tile)}
                    disabled={tile.used}
                    className={`grid size-12 place-items-center rounded-xl bg-wine font-heading text-xl font-semibold text-cream shadow-md transition-all duration-300 sm:size-14 ${
                      tile.used
                        ? "pointer-events-none scale-90 opacity-0"
                        : "luxury-clickable opacity-100"
                    } ${shakeId === tile.id ? "puzzle-shake" : ""}`}
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>

              <p className="mt-6 font-body text-sm italic text-ink/50">
                tap the letters in order, quick! ♥
              </p>
            </>
          )}
        </>
      ) : (
        <div className="relative mt-4">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {bursts.map((b) => (
              <span
                key={b.id}
                style={{
                  position: "absolute",
                  fontSize: b.size,
                  color: b.color,
                  animation: `intro-confetti-burst 1.2s ease-out ${b.delay}ms forwards`,
                  // @ts-expect-error custom properties consumed by the keyframe
                  "--tx": `${b.tx}px`,
                  "--ty": `${b.ty}px`,
                  "--rot": `${b.rot}deg`,
                }}
              >
                {b.glyph}
              </span>
            ))}
          </div>

          <div className="golden-surprise-pop relative z-10 py-4">
            <span className="text-4xl">🧸</span>
            <h4 className="golden-glow-text mt-3 font-script text-4xl">Nifemi</h4>
            <p className="mx-auto mt-3 font-heading text-sm uppercase tracking-[0.2em] text-gold">
              spelled with {secondsLeft}s to spare ⚡
            </p>
            <p className="mx-auto mt-4 max-w-sm font-body text-lg leading-relaxed text-ink/75">
              The one who's endlessly, hopelessly, happily yours. You spelled his
              name — now you have his whole heart too.
            </p>
            <button
              onClick={playAgain}
              className="luxury-clickable mt-6 rounded-full bg-wine px-6 py-2.5 font-heading text-sm uppercase tracking-[0.2em] text-cream"
            >
              play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
