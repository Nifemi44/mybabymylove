import { useEffect, useMemo, useRef, useState } from "react";
import { fetchActiveVoiceNote } from "@/lib/voice";
import { duckBackgroundAudio, restoreBackgroundAudio } from "@/lib/background-audio-bus";

const SPOTS = [
  "bottom-6 left-6",
  "top-24 left-6",
  "bottom-28 right-6",
  "top-1/2 left-4 -translate-y-1/2",
] as const;

const HINT_SEEN_KEY = "sanaya-teddy-hint-hops";
const MAX_HINT_HOPS = 3;

/** Golden sparkle burst used behind the "I love you" reveal. */
function GoldenBurst() {
  const pieces = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 180;
      const tx = Math.round(Math.cos(angle) * distance);
      const ty = Math.round(Math.sin(angle) * distance);
      const rot = Math.round(Math.random() * 360);
      const delay = Math.round(Math.random() * 250);
      const size = 10 + Math.round(Math.random() * 14);
      const glyphs = ["✦", "♥", "✧", "★"];
      return {
        id: i,
        tx,
        ty,
        rot,
        delay,
        size,
        glyph: glyphs[i % glyphs.length],
      };
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            fontSize: p.size,
            color: "#f4c76b",
            textShadow: "0 0 10px rgba(244,199,107,0.9)",
            animation: `intro-confetti-burst 1.4s ease-out ${p.delay}ms forwards`,
            // @ts-expect-error custom properties consumed by the keyframe
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

/** True once the hint bubble has been shown its maximum number of times this session. */
function hintExhausted() {
  if (typeof window === "undefined") return true;
  const count = Number(window.sessionStorage.getItem(HINT_SEEN_KEY) ?? "0");
  return count >= MAX_HINT_HOPS;
}

function bumpHintCount() {
  const count = Number(window.sessionStorage.getItem(HINT_SEEN_KEY) ?? "0");
  window.sessionStorage.setItem(HINT_SEEN_KEY, String(count + 1));
}

/**
 * A little teddy bear that hops between corners of the site and, when tapped,
 * bursts into a golden "I love you" surprise with a hidden voice note.
 */
export function TeddySurprise() {
  const [spotIndex, setSpotIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Whisper a hint the first couple of times the bear appears/hops, then stop for the session.
  useEffect(() => {
    if (open || hintExhausted()) return;
    setShowHint(true);
    bumpHintCount();
    const id = window.setTimeout(() => setShowHint(false), 4200);
    return () => window.clearTimeout(id);
  }, [spotIndex, open]);

  // Hop to a new corner every so often, so the bear feels like it's popping up around the site.
  useEffect(() => {
    const id = window.setInterval(() => {
      setSpotIndex((i) => (i + 1) % SPOTS.length);
    }, 14000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    fetchActiveVoiceNote()
      .then((note) => setVoiceUrl(note?.url ?? null))
      .catch(() => setVoiceUrl(null));
  }, []);

  const reveal = () => {
    setShowHint(false);
    setOpen(true);
    window.setTimeout(() => {
      audioRef.current
        ?.play()
        .then(() => {
          setPlaying(true);
          duckBackgroundAudio();
        })
        .catch(() => {});
    }, 500);
  };

  const close = () => {
    audioRef.current?.pause();
    setPlaying(false);
    restoreBackgroundAudio();
    setOpen(false);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      restoreBackgroundAudio();
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
      duckBackgroundAudio();
    }
  };

  const handleVoiceEnded = () => {
    setPlaying(false);
    restoreBackgroundAudio();
  };

  // The hint bubble sits above the bear on the bottom-anchored spots, and
  // below it on the top-anchored ones, so it never drifts off-screen.
  const hintBelow = (SPOTS[spotIndex] ?? SPOTS[0]).startsWith("top");

  return (
    <div className={`fixed z-40 transition-[bottom,top,left,right] duration-700 ${SPOTS[spotIndex]}`}>
      <div className="relative">
        {showHint && (
          <div
            className={`teddy-hint pointer-events-none absolute left-1/2 w-max -translate-x-1/2 whitespace-nowrap rounded-full bg-wine px-4 py-1.5 font-script text-base text-cream shadow-lg ${
              hintBelow ? "top-full mt-3" : "bottom-full mb-3"
            }`}
          >
            find me… 🧸
          </div>
        )}

        <button
          type="button"
          onClick={reveal}
          aria-label="Tap the bear for a surprise"
          className="teddy-hop grid size-14 place-items-center rounded-full bg-cream/90 text-3xl shadow-lg ring-1 ring-gold/40"
        >
          <span className="teddy-wiggle">🧸</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 left-0 top-0 z-[200] flex items-center justify-center overflow-hidden bg-ink/40 backdrop-blur-sm">
          <div aria-hidden="true" className="golden-surprise-bg absolute inset-0" />
          <GoldenBurst />

          <div className="golden-surprise-pop relative z-10 mx-6 max-w-md rounded-3xl border border-gold/50 bg-cream px-8 py-10 text-center shadow-2xl">
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-lg text-ink/40 hover:text-ink/70"
            >
              ✕
            </button>

            <span className="text-5xl">🧸</span>

            <p className="mt-4 font-heading text-xs uppercase tracking-[0.35em] text-gold">
              a little surprise for you
            </p>

            <h2 className="golden-glow-text mt-3 font-script text-4xl sm:text-5xl">
              I love you
            </h2>

            {voiceUrl ? (
              <>
                <audio ref={audioRef} src={voiceUrl} onEnded={handleVoiceEnded} />
                <button
                  onClick={toggleAudio}
                  className="luxury-clickable mt-7 inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 font-heading text-sm tracking-wide text-cream"
                >
                  {playing ? "pause my voice ⏸" : "hear my voice ▶"}
                </button>
              </>
            ) : (
              <p className="mt-6 font-body text-base italic text-ink/60">
                (a voice note is coming soon — for now, just know I mean it.)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
