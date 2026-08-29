import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Soft, romantic ambient music generated with the Web Audio API —
 * a slow arpeggio over a warm chord progression. No audio files needed.
 */
const PROGRESSION: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
];

export function BackgroundMusic({ autoStart = false }: { autoStart?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    gainRef.current?.gain.setTargetAtTime(0, ctxRef.current?.currentTime ?? 0, 0.3);
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current) {
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = master;
    }
    const ctx = ctxRef.current!;
    const master = gainRef.current!;
    void ctx.resume();
    master.gain.setTargetAtTime(0.12, ctx.currentTime, 0.8);

    const playNote = (freq: number, when: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(vol, when + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    };

    const tick = () => {
      const c = ctxRef.current;
      if (!c) return;
      const chord = PROGRESSION[Math.floor(stepRef.current / 4) % PROGRESSION.length]!;
      const t = c.currentTime + 0.02;
      const note = chord[stepRef.current % 4]!;
      playNote(note, t, 1.6, 0.45);
      if (stepRef.current % 4 === 0) {
        playNote(chord[0]! / 2, t, 3.2, 0.3); // soft bass
        playNote(chord[2]! * 2, t + 0.25, 2.2, 0.12); // shimmer
      }
      stepRef.current += 1;
    };

    tick();
    timerRef.current = window.setInterval(tick, 700);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (autoStart) start();
  }, [autoStart, start]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      void ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => (playing ? stop() : start())}
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
  );
}
