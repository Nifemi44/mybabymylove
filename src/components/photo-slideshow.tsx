import { useEffect, useState } from "react";

export type SlidePhoto = {
  caption?: string | null;
  note?: string | null;
  url?: string;
};

export function PhotoSlideshow({
  photos,
  interval = 4200,
}: {
  photos: SlidePhoto[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [photos.length, interval]);

  if (photos.length === 0) return null;

  return (
    <div className="mx-auto mt-14 max-w-2xl">
      <div className="relative bg-white/70 p-3 pb-5 ring-1 ring-black/5 shadow-[0_20px_60px_-25px_rgba(90,20,40,.45)]">
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-blush/60">
          {photos.map((p, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              {p.url ? (
                <img
                  src={p.url}
                  alt={p.caption || "A photo of us"}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center bg-blush/60">
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-rose/70">
                    our photo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-center font-body text-lg italic text-ink/70">
          {photos[index]?.caption}
        </p>
        <p className="text-center font-body text-sm text-ink/40">
          {photos[index]?.note}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-rose" : "w-2 bg-rose/30 hover:bg-rose/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
