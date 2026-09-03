import { useEffect, useState } from "react";
import { PhotoLightbox } from "@/components/photo-lightbox";

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
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // If the photo list changes (e.g. loads in after the initial render),
  // make sure the current index is still valid instead of showing a blank frame.
  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [photos.length, index]);

  useEffect(() => {
    if (photos.length <= 1 || lightboxOpen) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [photos.length, interval, lightboxOpen]);

  if (photos.length === 0) return null;

  return (
    <div className="mx-auto mt-10 w-full max-w-[min(92vw,34rem)] px-1 sm:mt-14 sm:max-w-xl lg:max-w-2xl">
      <div className="relative rounded-lg bg-white/70 p-2 pb-4 ring-1 ring-black/5 shadow-[0_20px_60px_-25px_rgba(90,20,40,.45)] sm:p-3 sm:pb-5">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-blush/60 sm:aspect-square lg:aspect-[4/3]">
          {photos.map((p, i) => {
            const showPlaceholder = !p.url || failed[i];
            return (
              <div
                key={p.url || `${p.caption ?? "photo"}-${i}`}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden={i !== index}
              >
                {!showPlaceholder ? (
                  <img
                    src={p.url}
                    alt={p.caption || "A photo of us"}
                    loading={i === index ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                    className="size-full object-cover object-center"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-blush/60">
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-rose/70">
                      our photo
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {photos[index]?.url && !failed[index] && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="View photo full screen"
              className="group absolute inset-0 cursor-zoom-in"
            >
              <span className="absolute bottom-2 right-2 rounded-full bg-wine/70 px-3 py-1 font-body text-[11px] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                tap to zoom
              </span>
            </button>
          )}
        </div>

        <p className="mt-3 min-h-[1.5rem] break-words px-2 text-center font-body text-base italic text-ink/70 sm:mt-4 sm:text-lg">
          {photos[index]?.caption}
        </p>
        <p className="break-words px-2 text-center font-body text-xs text-ink/40 sm:text-sm">
          {photos[index]?.note}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 shrink-0 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-rose" : "w-2 bg-rose/30 hover:bg-rose/60"
            }`}
          />
        ))}
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
