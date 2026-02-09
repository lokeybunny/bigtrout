import { useRef, createContext, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Adaptive FPS governor — monitors real-time FPS and exposes
 * a quality tier (via ref to avoid re-renders) that other
 * components can read each frame to scale their work.
 *
 * Tier 0 = full quality, Tier 1 = moderate reduction, Tier 2 = aggressive
 */

export interface PerformanceTier {
  /** 0 = high, 1 = medium, 2 = low */
  tier: number;
  /** How many frames to skip for wave updates (1 = none, higher = more skip) */
  oceanFrameSkip: number;
  /** Whether checkpoint lights should render */
  enableCheckpointLights: boolean;
  /** Whether lane markers should render */
  enableLaneMarkers: boolean;
  /** Whether shadows are enabled */
  enableShadows: boolean;
}

const DEFAULT_TIER: PerformanceTier = {
  tier: 0,
  oceanFrameSkip: 2,
  enableCheckpointLights: true,
  enableLaneMarkers: true,
  enableShadows: true,
};

// Use a ref-based context so consumers never re-render — they just read .current each frame
const AdaptivePerfContext = createContext<React.MutableRefObject<PerformanceTier>>({ current: { ...DEFAULT_TIER } });

export const useAdaptivePerf = () => useContext(AdaptivePerfContext);

export const AdaptivePerformanceProvider = ({ children }: { children: React.ReactNode }) => {
  const perfRef = useRef<PerformanceTier>({ ...DEFAULT_TIER });
  return (
    <AdaptivePerfContext.Provider value={perfRef}>
      <AdaptivePerformanceMonitor perfRef={perfRef} />
      {children}
    </AdaptivePerfContext.Provider>
  );
};

function AdaptivePerformanceMonitor({ perfRef }: { perfRef: React.MutableRefObject<PerformanceTier> }) {
  const { gl } = useThree();
  const fpsBuffer = useRef<number[]>([]);
  const sampleWindows = useRef(0);
  const currentTier = useRef(0);
  const lastDpr = useRef(gl.getPixelRatio());

  useFrame((_, delta) => {
    if (delta <= 0) return;
    const fps = 1 / delta;
    fpsBuffer.current.push(fps);

    // Evaluate every 45 frames (~0.75s at 60fps)
    if (fpsBuffer.current.length < 45) return;

    const avg = fpsBuffer.current.reduce((a, b) => a + b, 0) / fpsBuffer.current.length;
    fpsBuffer.current.length = 0;
    sampleWindows.current++;

    // Skip first window (initial load stutter)
    if (sampleWindows.current < 2) return;

    let newTier = currentTier.current;

    // Only downgrade, never upgrade (prevents oscillation)
    if (avg < 22 && newTier < 2) {
      newTier = 2;
    } else if (avg < 35 && newTier < 1) {
      newTier = 1;
    }

    if (newTier !== currentTier.current) {
      currentTier.current = newTier;

      if (newTier === 2) {
        // Aggressive: drop DPR to 1, skip 4 ocean frames, disable lights & markers
        gl.setPixelRatio(1);
        lastDpr.current = 1;
        perfRef.current = {
          tier: 2,
          oceanFrameSkip: 4,
          enableCheckpointLights: false,
          enableLaneMarkers: false,
          enableShadows: false,
        };
        // Disable shadow map on low tier
        gl.shadowMap.enabled = false;
        console.log('[Perf] Tier 2 (low) — FPS avg:', avg.toFixed(1));
      } else if (newTier === 1) {
        // Moderate: DPR to 1, skip 3 ocean frames, keep lights but lose markers
        const dpr = Math.min(gl.getPixelRatio(), 1.2);
        gl.setPixelRatio(dpr);
        lastDpr.current = dpr;
        perfRef.current = {
          tier: 1,
          oceanFrameSkip: 3,
          enableCheckpointLights: true,
          enableLaneMarkers: false,
          enableShadows: false,
        };
        gl.shadowMap.enabled = false;
        console.log('[Perf] Tier 1 (medium) — FPS avg:', avg.toFixed(1));
      }
    }
  });

  return null;
}
