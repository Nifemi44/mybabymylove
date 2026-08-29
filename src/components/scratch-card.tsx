import { useEffect, useRef, useState } from "react";

/** A sealed card that reveals a hidden message as the visitor drags across it. */
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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

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
      if (ratio > 0.55) setRevealed(true);
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
      ref={wrapRef}
      className="luxury-shadow relative mx-auto overflow-hidden rounded-2xl ring-1 ring-rose/20"
      style={{ width: "100%", maxWidth: width, height }}
    >
      <div className="absolute inset-0 grid place-items-center bg-cream px-6 text-center">
        <p className="font-script text-2xl text-wine sm:text-3xl">{message}</p>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${
          revealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
      {!revealed && progress > 0 && progress < 0.55 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-heading text-[10px] uppercase tracking-[0.2em] text-cream/90">
          keep going…
        </div>
      )}
    </div>
  );
}
