import { useEffect, useRef, useState } from "react";
import { fetchActiveAudio } from "@/lib/audio";
import { createRomanticScore } from "@/lib/romantic-synth";

/**
 * Plays whichever track the admin has most recently uploaded (via /admin).
 * Autoplays as soon as it's mounted; if the browser blocks unmuted autoplay
 * (all browsers do this until the visitor interacts with the page), it
 * quietly starts on the very first click/tap/scroll/keypress instead — the
 * toggle button still shows "playing" as the default, intended state.
 */
export function BackgroundMusic({ autoStart = false }: { autoStart?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const wantsPlaying = useRef(autoStart);

  // Load whichever track is currently active.
  useEffect(() => {
    let cancelled = false;
    fetchActiveAudio()
      .then((track) => {
        if (!cancelled && track) setSrc(track.url);
      })
      .catch(() => {
        // No track uploaded yet, or a fetch error — fail silently, no music.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Try to autoplay once a track is loaded; fall back to first user gesture.
  useEffect(() => {
    if (!autoStart || !src) return;
    const audio = audioRef.current;
    if (!audio) return;

    let done = false;
    const tryPlay = () => {
      if (done) return;
      audio
        .play()
        .then(() => {
          done = true;
          setPlaying(true);
          cleanup();
        })
        .catch(() => {
          // Blocked — wait for a real user gesture, then try again.
        });
    };

    const events: (keyof WindowEventMap)[] = ["click", "touchstart", "keydown", "scroll"];
    const onGesture = () => tryPlay();
    const cleanup = () => {
      events.forEach((ev) => window.removeEventListener(ev, onGesture));
    };

    tryPlay();
    events.forEach((ev) => window.addEventListener(ev, onGesture, { once: true, passive: true }));

    return cleanup;
  }, [autoStart, src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      wantsPlaying.current = false;
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
      wantsPlaying.current = true;
    }
  };

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        className="fixed bottom-5 right-5 z-50 grid size-12 place-items-center rounded-full bg-wine/85 text-cream shadow-lg backdrop-blur transition-transform duration-300 hover:scale-110"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        )}
      </button>
    </>
  );
}
