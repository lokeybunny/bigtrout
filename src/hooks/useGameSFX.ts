import { useRef, useCallback } from 'react';

// Web Audio API-based sound effects — no external files needed
const createAudioContext = () => {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
};

const playTone = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  ramp?: 'up' | 'down',
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  if (ramp === 'down') {
    osc.frequency.linearRampToValueAtTime(frequency * 0.5, ctx.currentTime + duration);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  } else if (ramp === 'up') {
    osc.frequency.linearRampToValueAtTime(frequency * 1.8, ctx.currentTime + duration);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  } else {
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export type SFXType = 'boost' | 'rock' | 'wave' | 'buy' | 'bigBuy' | 'sell';

export const useGameSFX = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = createAudioContext();
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback((type: SFXType) => {
    const ctx = ensureCtx();
    if (!ctx) return;

    switch (type) {
      case 'boost':
        // Rising sparkle
        playTone(ctx, 600, 0.15, 'sine', 0.12, 'up');
        setTimeout(() => playTone(ctx, 900, 0.12, 'sine', 0.1, 'up'), 80);
        setTimeout(() => playTone(ctx, 1200, 0.15, 'sine', 0.08), 160);
        break;

      case 'rock':
        // Heavy thud
        playTone(ctx, 80, 0.3, 'sawtooth', 0.2, 'down');
        playTone(ctx, 120, 0.15, 'square', 0.1, 'down');
        break;

      case 'wave':
        // Swooshy noise
        playTone(ctx, 200, 0.25, 'triangle', 0.12, 'down');
        setTimeout(() => playTone(ctx, 150, 0.2, 'sine', 0.08, 'down'), 100);
        break;

      case 'buy':
        // Happy ding
        playTone(ctx, 523, 0.12, 'sine', 0.1);
        setTimeout(() => playTone(ctx, 659, 0.15, 'sine', 0.1), 100);
        break;

      case 'bigBuy':
        // Triumphant chord
        playTone(ctx, 523, 0.15, 'sine', 0.12);
        setTimeout(() => playTone(ctx, 659, 0.15, 'sine', 0.12), 80);
        setTimeout(() => playTone(ctx, 784, 0.2, 'sine', 0.12), 160);
        setTimeout(() => playTone(ctx, 1047, 0.25, 'sine', 0.08), 250);
        break;

      case 'sell':
        // Descending minor
        playTone(ctx, 400, 0.15, 'square', 0.08, 'down');
        setTimeout(() => playTone(ctx, 300, 0.2, 'square', 0.06, 'down'), 120);
        break;
    }
  }, [ensureCtx]);

  return play;
};
