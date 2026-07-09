"use client";

import { useCallback } from "react";

// Port of playBeep from the static site's assets/js/utils.js — tiny Web Audio
// tones so no audio files are needed.
export function useBeep() {
  return useCallback((freq = 440, duration = 0.12, type: OscillatorType = "sine") => {
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // audio not available — stay silent
    }
  }, []);
}

export function useFeedbackSounds() {
  const beep = useBeep();
  return {
    correct: () => {
      beep(660, 0.1);
      setTimeout(() => beep(880, 0.15), 90);
    },
    wrong: () => beep(180, 0.2, "square"),
    tap: () => beep(440, 0.06),
  };
}
