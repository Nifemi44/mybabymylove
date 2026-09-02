import { useEffect, useMemo, useRef, useState } from "react";
import { seededRandom } from "@/lib/rand";

/** Small decorative flowers drifting gently around the card. */
function FloatingFlowers() {
  const flowers = useMemo(() => {
    const glyphs = ["🌸", "🌷", "💮", "🌺"];
    // Deterministic so SSR and hydration agree.
    const rand = seededRandom(4242);
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      glyph: glyphs[i % glyphs.length],
      left: Math.round(rand() * 90) + 5,
      top: Math.round(rand() * 80) + 5,
      size: 14 + Math.round(rand() * 10),
      duration: 6 + Math.round(rand() * 5),
      delay: Math.round(rand() * 3000) / 1000,
    }));
  }, []);


  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {flowers.map((f) => (
        <span
          key={f.id}
          className="scratch-flower-float absolute"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            fontSize: f.size,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.glyph}
        </span>
      ))}
    </div>
  );
}

/** A soft golden/pink glow-and-sparkle burst that plays right before the message reveals. */
function GlowBurst() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 110;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 150);
      const size = 10 + Math.round(Math.random() * 8);
      const color = i % 2 === 0 ? "#f4c76b" : "#ef5da8";
      const glyph = ["✦", "♥", "✧"][i % 3];
      return { id: i, tx, ty, rot, delay, size, color, glyph };
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="scratch-glow-pulse absolute size-24 rounded-full" />
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            fontSize: s.size,
            color: s.color,
            animation: `intro-confetti-burst 0.9s ease-out ${s.delay}ms forwards`,
            // @ts-expect-error custom properties consumed by the keyframe
            "--tx": `${s.tx}px`,
            "--ty": `${s.ty}px`,
            "--rot": `${s.rot}deg`,
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}

/** A glassmorphic sealed card that reveals a hidden message as the visitor drags across it. */
export function ScratchCard({
  message,
  width = 420,
  height = 220,
}: {
  message: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [celebrating, setCelebrating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#c5a059");
      grad.addColorStop(0.5, "#e7a0a8");
      grad.addColorStop(1, "#7a2e43");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255,249,244,0.85)";
      ctx.font = "600 15px Fraunces, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("scratch here ♥", canvas.width / 2, canvas.height / 2);
    };
    draw();

    const scratchAt = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkProgress = () => {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      const total = data.length / 4;
      for (let i = 3; i < data.length; i += 4 * 20) {
        if (data[i] === 0) cleared++;
      }
      const ratio = cleared / (total / 20);
      setProgress(ratio);

      if (ratio > 0.55 && !triggered.current) {
        triggered.current = true;
        // Build up a glow-and-sparkle moment before the message actually appears.
        setCelebrating(true);
        window.setTimeout(() => {
          setRevealed(true);
        }, 700);
      }
    };

    const posFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      drawing.current = true;
      const { x, y } = posFromEvent(e);
      scratchAt(x, y);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const { x, y } = posFromEvent(e);
      scratchAt(x, y);
      checkProgress();
    };
    const onUp = () => {
      drawing.current = false;
      checkProgress();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      className="glass-panel relative mx-auto overflow-hidden rounded-2xl"
      style={{ width: "100%", maxWidth: width, height }}
    >
      <FloatingFlowers />

      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <p
          className={`font-script text-2xl text-wine transition-all duration-500 sm:text-3xl ${
            revealed ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          {message}
        </p>
      </div>

      {celebrating && !revealed && <GlowBurst />}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${
          celebrating ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
      {!celebrating && progress > 0 && progress < 0.55 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-heading text-[10px] uppercase tracking-[0.2em] text-cream/90">
          keep going…
        </div>
      )}
    </div>
  );
}
