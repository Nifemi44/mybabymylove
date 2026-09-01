/**
 * A soft, looping romantic piano-ish piece rendered with the Web Audio API.
 * Used as the background score when no custom track has been uploaded.
 */

type Ctx = AudioContext & { _romanticStop?: () => void };

const NOTE = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);

// Chord progression: Cmaj7 - Am7 - Fmaj7 - G7 (semitone offsets from A4)
const CHORDS: number[][] = [
  [-9, -2, 2, 7], // C E G B
  [-12, -5, 0, 3], // A C E G
  [-16, -9, -5, 0], // F A C E
  [-14, -7, -3, 2], // G B D F
];

// Gentle melody notes over each bar (semitones from A4)
const MELODY: number[][] = [
  [7, 11, 14, 11],
  [3, 7, 12, 7],
  [0, 4, 9, 4],
  [2, 5, 11, 5],
];

export function createRomanticScore() {
  let ctx: Ctx | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let bar = 0;

  const voice = (
    audio: AudioContext,
    out: GainNode,
    freq: number,
    at: number,
    dur: number,
    peak: number,
  ) => {
    const osc = audio.createOscillator();
    const sub = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "triangle";
    sub.type = "sine";
    osc.frequency.value = freq;
    sub.frequency.value = freq / 2;

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(out);

    osc.start(at);
    sub.start(at);
    osc.stop(at + dur + 0.05);
    sub.stop(at + dur + 0.05);
  };

  const scheduleBar = () => {
    const audio = ctx;
    const out = master;
    if (!audio || !out) return;

    const chord = CHORDS[bar % CHORDS.length]!;
    const melody = MELODY[bar % MELODY.length]!;
    const now = audio.currentTime + 0.05;
    const barLen = 4.8;

    // arpeggiated chord bed
    chord.forEach((semi, i) => {
      voice(audio, out, NOTE(semi), now + i * 0.42, 2.6, 0.07);
      voice(audio, out, NOTE(semi + 12), now + 2.4 + i * 0.3, 1.8, 0.035);
    });

    // melody on top
    melody.forEach((semi, i) => {
      voice(audio, out, NOTE(semi + 12), now + 0.6 + i * 1.1, 1.5, 0.05);
    });

    bar += 1;
    timer = window.setTimeout(scheduleBar, barLen * 1000);
  };

  return {
    async start() {
      if (ctx) {
        await ctx.resume();
        return;
      }
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audio = new AudioCtor() as Ctx;
      const gain = audio.createGain();
      gain.gain.value = 0.0001;
      gain.connect(audio.destination);
      // soft fade-in so it never startles
      gain.gain.exponentialRampToValueAtTime(0.5, audio.currentTime + 3);

      ctx = audio;
      master = gain;
      bar = 0;
      await audio.resume();
      scheduleBar();
    },
    stop() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      const audio = ctx;
      const gain = master;
      ctx = null;
      master = null;
      if (gain && audio) {
        gain.gain.cancelScheduledValues(audio.currentTime);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.8);
      }
      if (audio) {
        window.setTimeout(() => void audio.close().catch(() => {}), 1000);
      }
    },
  };
}
