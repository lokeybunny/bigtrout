import { useEffect, useRef, useState, useCallback } from 'react';

export type QualityLevel = 'high' | 'medium' | 'low';

/**
 * Monitors real-time FPS and returns a quality level.
 * Starts at 'high' and downgrades if sustained low FPS is detected.
 * Once downgraded, it stays there for the session to avoid flickering.
 */
export function usePerformanceMode(): QualityLevel {
  const [quality, setQuality] = useState<QualityLevel>('high');
  const qualityRef = useRef<QualityLevel>('high');
  const framesRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(performance.now());

  const downgrade = useCallback((to: QualityLevel) => {
    qualityRef.current = to;
    setQuality(to);
  }, []);

  useEffect(() => {
    // Quick hardware hint: low deviceMemory or hardwareConcurrency → start at medium
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory && nav.deviceMemory <= 4) {
      downgrade('medium');
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      downgrade('low');
      return; // no need to monitor further
    }

    let sampleCount = 0;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (delta > 0) {
        const fps = 1000 / delta;
        framesRef.current.push(fps);

        // Evaluate every 60 frames (~1 second at 60fps)
        if (framesRef.current.length >= 60) {
          const avg = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
          framesRef.current = [];
          sampleCount++;

          // Only act after 2+ sample windows to avoid initial load stutter
          if (sampleCount >= 2) {
            if (qualityRef.current === 'high' && avg < 30) {
              downgrade('low');
            } else if (qualityRef.current === 'high' && avg < 45) {
              downgrade('medium');
            } else if (qualityRef.current === 'medium' && avg < 25) {
              downgrade('low');
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [downgrade]);

  return quality;
}
