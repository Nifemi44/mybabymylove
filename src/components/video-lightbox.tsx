import { useEffect } from "react";

export type LightboxVideo = { url?: string; caption?: string | null; note?: string | null };

export function VideoLightbox({
  videos,
  index,
  onClose,
  onIndexChange,
}: {
  videos: LightboxVideo[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const video = videos[index];

  // lock page scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % videos.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + videos.length) % videos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, videos.length, onClose, onIndexChange]);

  if (!video?.url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#2a0713]/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={video.caption || "Video"}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-cream">
        <span className="font-body text-xs uppercase tracking-[0.18em] opacity-70">
          {index + 1} / {videos.length}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="size-9 rounded-full bg-cream/15 text-lg text-cream transition hover:bg-cream/30"
        >
          ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <video
          key={video.url}
          src={video.url}
          controls
          autoPlay
          playsInline
          className="max-h-full max-w-full rounded-xl bg-black shadow-2xl"
        />

        {videos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous video"
              onClick={() => onIndexChange((index - 1 + videos.length) % videos.length)}
              className="absolute left-3 top-1/2 size-10 -translate-y-1/2 rounded-full bg-cream/15 text-cream transition hover:bg-cream/30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next video"
              onClick={() => onIndexChange((index + 1) % videos.length)}
              className="absolute right-3 top-1/2 size-10 -translate-y-1/2 rounded-full bg-cream/15 text-cream transition hover:bg-cream/30"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="px-6 pb-6 pt-3 text-center text-cream">
        <p className="font-body text-base italic opacity-90">{video.caption}</p>
        <p className="font-body text-xs opacity-60">{video.note}</p>
      </div>
    </div>
  );
}
