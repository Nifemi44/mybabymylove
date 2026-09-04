import { useState } from "react";
import { VideoLightbox } from "@/components/video-lightbox";

export type GalleryVideoItem = {
  url: string;
  caption?: string | null;
  note?: string | null;
};

export function VideoGallery({ videos }: { videos: GalleryVideoItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (videos.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-dashed border-cream/25 bg-cream/5 p-10 text-center">
        <p className="font-body text-lg italic text-cream/60">
          our little videos will live here soon ♥
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <button
            key={v.url || i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Play video: ${v.caption || `video ${i + 1}`}`}
            className="group overflow-hidden rounded-2xl bg-cream/95 p-3 text-left shadow-lg ring-1 ring-rose/20 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <video
                src={v.url}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid size-14 place-items-center rounded-full bg-wine/80 text-2xl text-cream transition group-hover:scale-110">
                  ▶
                </span>
              </span>
            </div>
            <p className="mt-3 font-body text-base italic text-ink">{v.caption}</p>
            {v.note ? <p className="font-body text-xs text-ink/60">{v.note}</p> : null}
          </button>
        ))}
      </div>

      {open !== null && (
        <VideoLightbox
          videos={videos}
          index={open}
          onClose={() => setOpen(null)}
          onIndexChange={setOpen}
        />
      )}
    </>
  );
}
