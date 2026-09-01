import { useEffect, useState } from "react";

/** Keys for the two romantic games that unlock the secret love note page. */
export const LOVE_KEYS = {
  match: "sanaya-game-heart-match",
  quiz: "sanaya-game-love-quiz",
} as const;

export type LoveKey = (typeof LOVE_KEYS)[keyof typeof LOVE_KEYS];

const EVENT = "sanaya-love-lock-change";

export function completeGame(key: LoveKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, "1");
  window.dispatchEvent(new Event(EVENT));
}

function read(): Record<LoveKey, boolean> {
  if (typeof window === "undefined") {
    return { [LOVE_KEYS.match]: false, [LOVE_KEYS.quiz]: false };
  }
  return {
    [LOVE_KEYS.match]: window.localStorage.getItem(LOVE_KEYS.match) === "1",
    [LOVE_KEYS.quiz]: window.localStorage.getItem(LOVE_KEYS.quiz) === "1",
  };
}

/** Reactive unlock progress. SSR-safe: starts locked, syncs after hydration. */
export function useLoveLock() {
  const [state, setState] = useState<Record<LoveKey, boolean>>({
    [LOVE_KEYS.match]: false,
    [LOVE_KEYS.quiz]: false,
  });

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const done = Object.values(state).filter(Boolean).length;
  return { state, done, total: 2, unlocked: done === 2 };
}
