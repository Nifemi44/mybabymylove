import { useCallback, useEffect, useRef, useState } from "react";

type LightboxPhoto = { url?: string; caption?: string | null; note?: string | null };

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const photo = photos[index];

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [index, reset]);

  // lock page scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const zoomAt = useCallback((nextZoom: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const next = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const k = next / z;
    const nx = px - (px - o.x) * k;
    const ny = py - (py - o.y) * k;
    setZoom(next);
    setOffset(next === 1 ? { x: 0, y: 0 } : { x: nx, y: ny });
  }, []);

  const wheelRef = useRef((e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const next = stateRef.current.zoom * Math.exp(-dy * 0.0018);
    zoomAt(next, e.clientX - rect.left, e.clientY - rect.top);
  });
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const next = stateRef.current.zoom * Math.exp(-dy * 0.0018);
    zoomAt(next, e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
      if (e.key === "+" || e.key === "=") zoomAt(stateRef.current.zoom * 1.3, 0, 0);
      if (e.key === "-") zoomAt(stateRef.current.zoom / 1.3, 0, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onIndexChange, zoomAt]);

  // pointer drag + pinch
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length >= 2) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const el = containerRef.current;
      if (pinchRef.current && el) {
        const rect = el.getBoundingClientRect();
        const cx = (a.x + b.x) / 2 - rect.left;
        const cy = (a.y + b.y) / 2 - rect.top;
        zoomAt(stateRef.current.zoom * (dist / pinchRef.current.dist), cx, cy);
      }
      pinchRef.current = { dist };
      return;
    }

    if (stateRef.current.zoom > 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
  };

  if (!photo?.url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#2a0713]/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-cream">
        <span className="font-body text-xs tracking-[0.18em] uppercase opacity-70">
          {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomAt(stateRef.current.zoom / 1.4, 0, 0)}
            className="size-9 rounded-full bg-cream/10 text-lg text-cream transition hover:bg-cream/20"
          >
            −
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              const el = containerRef.current;
              const rect = el?.getBoundingClientRect();
              zoomAt(
                stateRef.current.zoom * 1.4,
                rect ? rect.width / 2 : 0,
                rect ? rect.height / 2 : 0,
              );
            }}
            className="size-9 rounded-full bg-cream/10 text-lg text-cream transition hover:bg-cream/20"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={reset}
            className="h-9 rounded-full bg-cream/10 px-3 font-body text-xs text-cream transition hover:bg-cream/20"
          >
            reset
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="size-9 rounded-full bg-cream/15 text-lg text-cream transition hover:bg-cream/30"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          zoomAt(
            stateRef.current.zoom > 1 ? 1 : 2.5,
            e.clientX - rect.left,
            e.clientY - rect.top,
          );
        }}
        className="relative flex-1 select-none overflow-hidden"
        style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "zoom-in" }}
      >
        <img
          src={photo.url}
          alt={photo.caption || "A photo of us"}
          draggable={false}
          className="absolute inset-0 size-full object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: pinchRef.current ? "none" : "transform 80ms linear",
          }}
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 size-10 -translate-y-1/2 rounded-full bg-cream/15 text-cream transition hover:bg-cream/30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => onIndexChange((index + 1) % photos.length)}
              className="absolute right-3 top-1/2 size-10 -translate-y-1/2 rounded-full bg-cream/15 text-cream transition hover:bg-cream/30"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="px-6 pb-6 pt-3 text-center text-cream">
        <p className="font-body text-base italic opacity-90">{photo.caption}</p>
        <p className="font-body text-xs opacity-60">{photo.note}</p>
      </div>
    </div>
  );
}
