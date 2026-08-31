import { useEffect, useRef } from "react";

/** A soft trail of tiny hearts/sparkles that follows the cursor across the whole site. */
export function CursorTrail() {
  const lastSpawn = useRef(0);

  useEffect(() => {
    // Skip on touch-only devices — a finger dragging a heart trail everywhere is noisy, not romantic.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const glyphs = ["♥", "♡", "✦"];
    const colors = ["#7a2e43", "#e7a0a8", "#c5a059"];

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < 60) return; // throttle
      lastSpawn.current = now;

      const el = document.createElement("span");
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.position = "fixed";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.fontSize = `${8 + Math.round(Math.random() * 6)}px`;
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
      el.style.pointerEvents = "none";
      el.style.zIndex = "9998";
      el.style.transform = "translate(-50%, -50%)";
      el.style.transition = "opacity 900ms ease, transform 900ms ease";
      el.style.opacity = "0.8";
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%, -140%) scale(0.6)";
      });

      window.setTimeout(() => el.remove(), 950);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
