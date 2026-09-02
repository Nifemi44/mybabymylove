let bgAudio: HTMLAudioElement | null = null;
let fadeHandle: number | null = null;
let baseVolume = 1;

/** Called once by BackgroundMusic when its <audio> element is ready. */
export function registerBackgroundAudio(audio: HTMLAudioElement, volume = 1) {
  bgAudio = audio;
  baseVolume = volume;
}

function fadeTo(target: number, ms: number) {
  if (!bgAudio) return;
  if (fadeHandle) window.clearInterval(fadeHandle);

  const steps = 12;
  const stepMs = ms / steps;
  const start = bgAudio.volume;
  const delta = (target - start) / steps;
  let i = 0;

  fadeHandle = window.setInterval(() => {
    i += 1;
    if (!bgAudio) return;
    const next = start + delta * i;
    bgAudio.volume = Math.min(1, Math.max(0, next));
    if (i >= steps) {
      if (fadeHandle) window.clearInterval(fadeHandle);
      fadeHandle = null;
    }
  }, stepMs);
}

/** Lower the background music (e.g. while a voice note plays), without pausing it. */
export function duckBackgroundAudio() {
  fadeTo(baseVolume * 0.18, 350);
}

/** Bring the background music back to its normal volume. */
export function restoreBackgroundAudio() {
  fadeTo(baseVolume, 450);
}
