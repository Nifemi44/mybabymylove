import { useMemo } from "react";

export function AmbientSparkles() {
  const items = useMemo(() => {
    const glyphs = ["♥", "♡", "✦", "❀"];
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      top: Math.round(Math.random() * 100),
      left: Math.round(Math.random() * 100),
      size: 10 + Math.round(Math.random() * 14),
      duration: 6 + Math.round(Math.random() * 8),
      delay: Math.round(Math.random() * 6),
      glyph: glyphs[i % glyphs.length],
      color: i % 2 === 0 ? "#ef5da8" : "#e0335c",
    }));
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {items.map((it) => (
        <span
          key={it.id}
          className="site-sparkle"
          style={{
            position: "absolute",
            top: `${it.top}%`,
            left: `${it.left}%`,
            fontSize: it.size,
            color: it.color,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
          }}
        >
          {it.glyph}
        </span>
      ))}
    </div>
  );
}
