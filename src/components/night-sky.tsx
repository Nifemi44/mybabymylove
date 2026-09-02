import { useMemo } from "react";
import { seededRandom } from "@/lib/rand";

/** A field of twinkling stars plus a couple of slow shooting stars. By default it's
 *  absolutely positioned to fill its nearest positioned ancestor (for use inside one
 *  section); pass `fixed` to make it cover the whole viewport instead. */
export function NightSky({ count = 70, fixed = false }: { count?: number; fixed?: boolean }) {
  const stars = useMemo(() => {
    // Deterministic so server and client render identically (no hydration drift).
    const rand = seededRandom(count * 7919 + 13);
    return Array.from({ length: count }).map((_, i) => {
      const big = i % 11 === 0;
      return {
        id: i,
        top: Math.round(rand() * 100),
        left: Math.round(rand() * 100),
        size: Math.round((big ? 3 + rand() * 2 : 1 + rand() * 1.6) * 1000) / 1000,
        glyph: big ? "✦" : "•",
        duration: Math.round((2 + rand() * 3) * 1000) / 1000,
        delay: Math.round(rand() * 5000) / 1000,
        color: i % 5 === 0 ? "#f4c76b" : i % 5 === 1 ? "#f0b8d9" : "#ffffff",
      };
    });
  }, [count]);


  const shootingStars = [
    { top: 12, left: -10, delay: 1.5, duration: 3.4 },
    { top: 32, left: -20, delay: 7, duration: 2.8 },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${
        fixed ? "fixed inset-0 z-[-2]" : "absolute inset-0"
      }`}
    >
      {stars.map((s) =>
        s.glyph === "✦" ? (
          <span
            key={s.id}
            className="star-twinkle absolute"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              fontSize: s.size * 6,
              color: s.color,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          >
            ✦
          </span>
        ) : (
          <span
            key={s.id}
            className="star-twinkle absolute rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ),
      )}

      {shootingStars.map((s, i) => (
        <span
          key={i}
          className="shooting-star absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
