import { useEffect, useState } from "react";
import { completeGame, LOVE_KEYS } from "@/lib/love-lock";

/**
 * Game 1: a little memory match. Flip the hearts two at a time and find all
 * six matching pairs to earn half the key to Sanaya's secret love note.
 */
const PAIRS = ["❤️", "🌹", "💌", "💍", "🧸", "🍫"];

// Fixed shuffle so server and client render identically (no hydration drift).
const ORDER = [3, 9, 0, 6, 11, 1, 8, 4, 10, 2, 7, 5];
const DECK = ORDER.map((slot, i) => ({ id: i, emoji: PAIRS[slot % PAIRS.length]! }));

export function HeartMatch() {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const won = matched.length === DECK.length;

  useEffect(() => {
    if (won) completeGame(LOVE_KEYS.match);
  }, [won]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped as [number, number];
    const same = DECK[a]!.emoji === DECK[b]!.emoji;
    const t = window.setTimeout(
      () => {
        if (same) setMatched((m) => [...m, a, b]);
        setFlipped([]);
      },
      same ? 350 : 750,
    );
    return () => window.clearTimeout(t);
  }, [flipped]);

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    setFlipped((f) => [...f, i]);
    if (flipped.length === 1) setMoves((m) => m + 1);
  };

  const reset = () => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="grid grid-cols-4 gap-3">
        {DECK.map((card, i) => {
          const shown = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={shown ? `Card showing ${card.emoji}` : "Hidden love card"}
              className={`grid aspect-square place-items-center rounded-xl text-2xl shadow-md ring-1 transition-all duration-300 sm:text-3xl ${
                shown
                  ? "scale-105 bg-cream ring-rose/40"
                  : "bg-gradient-to-br from-rose/80 to-wine/80 ring-wine/25 hover:scale-105"
              } ${matched.includes(i) ? "opacity-70" : ""}`}
            >
              <span className={shown ? "" : "text-cream/70"}>{shown ? card.emoji : "♥"}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 font-body text-sm italic text-ink/60">
        {won ? `all matched in ${moves} tries 💗` : `${matched.length / 2} of 6 pairs found`}
      </p>

      {won ? (
        <p className="mt-2 font-script text-2xl text-wine">
          first key unlocked, my love ✨
        </p>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="mt-2 font-heading text-xs uppercase tracking-[0.25em] text-wine/50 transition-colors hover:text-wine"
        >
          shuffle again
        </button>
      )}
    </div>
  );
}
