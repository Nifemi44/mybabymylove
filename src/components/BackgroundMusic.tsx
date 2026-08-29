import { useRef, useState } from "react";

/**
 * Background music toggle.
 *
 * IMPORTANT: no audio file is bundled here. Add your own licensed song
 * (something you own the rights to, or a royalty-free track) as:
 *   public/audio/love-song.mp3
 * The button below will play/pause that file. If the file is missing,
 * the button simply does nothing — it won't break the page.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {
        // Autoplay / missing-file errors land here silently.
      });
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/love-song.mp3" loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        className="fixed bottom-6 left-6 z-50 flex size-12 items-center justify-center rounded-full border border-gold/40 bg-cream/90 text-wine shadow-lg backdrop-blur transition-transform hover:scale-105"
      >
        <span className="text-lg">{playing ? "♫" : "♪"}</span>
      </button>
    </>
  );
}
