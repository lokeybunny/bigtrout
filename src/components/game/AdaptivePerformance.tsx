import { useRef, createContext, useContext, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Adaptive Performance Governor
 * 
 * 1. Detects hardware on mount (GPU string, deviceMemory, mobile)
 *    to pick an initial tier (0=high, 1=medium, 2=low).
 * 2. Monitors FPS every ~0.75s and can downgrade OR upgrade tiers
 *    (with hysteresis to prevent oscillation).
 * 3. Exposes a ref-based context so consumers read .current each frame
 *    without causing re-renders.
 */

export interface PerformanceTier {
  /** 0 = high, 1 = medium, 2 = low */
  tier: number;
  /** How many frames to skip for wave updates (1 = none) */
  oceanFrameSkip: number;
  /** Whether checkpoint lights should render */
  enableCheckpointLights: boolean;
  /** Whether decorative details on boat render */
  enableBoatDetails: boolean;
  /** Whether shadows are enabled */
  enableShadows: boolean;
  /** Star count multiplier (1 = full, 0.5 = half, 0.25 = quarter) */
  starMultiplier: number;
  /** Ocean grid segments (higher = more detail) */
  oceanSegments: number;
}

const TIERS: PerformanceTier[] = [
  // Tier 0 — High
  {
    tier: 0,
    oceanFrameSkip: 2,
    enableCheckpointLights: true,
    enableBoatDetails: true,
    enableShadows: false, // already disabled globally for perf
    starMultiplier: 1,
    oceanSegments: 25,
  },
  // Tier 1 — Medium
  {
    tier: 1,
    oceanFrameSkip: 3,
    enableCheckpointLights: true,
    enableBoatDetails: false,
    enableShadows: false,
    starMultiplier: 0.5,
    oceanSegments: 16,
  },
  // Tier 2 — Low
  {
    tier: 2,
    oceanFrameSkip: 5,
    enableCheckpointLights: false,
    enableBoatDetails: false,
    enableShadows: false,
    starMultiplier: 0.25,
    oceanSegments: 10,
  },
];

/**
 * Detect hardware capabilities and return a starting tier.
 */
function detectInitialTier(): number {
  // Mobile / touch device → start at tier 1
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Low memory → tier 2
  const mem = (navigator as any).deviceMemory;
  if (mem !== undefined && mem <= 2) return 2;
  if (mem !== undefined && mem <= 4) return isMobile ? 2 : 1;

  // Check GPU via WebGL renderer string
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const dbg = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        const renderer = (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // Known weak GPUs
        const weakGPUs = ['intel', 'mesa', 'swiftshader', 'llvmpipe', 'virtualbox', 'microsoft basic'];
        if (weakGPUs.some(g => renderer.includes(g))) {
          return isMobile ? 2 : 1;
        }
      }
    }
  } catch {
    // ignore
  }

  return isMobile ? 1 : 0;
}

const AdaptivePerfContext = createContext<React.MutableRefObject<PerformanceTier>>({ current: { ...TIERS[0] } });

export const useAdaptivePerf = () => useContext(AdaptivePerfContext);

export const AdaptivePerformanceProvider = ({ children }: { children: React.ReactNode }) => {
  const initialTier = useRef(detectInitialTier());
  const perfRef = useRef<PerformanceTier>({ ...TIERS[initialTier.current] });

  return (
    <AdaptivePerfContext.Provider value={perfRef}>
      <AdaptivePerformanceMonitor perfRef={perfRef} initialTier={initialTier.current} />
      {children}
    </AdaptivePerfContext.Provider>
  );
};

function AdaptivePerformanceMonitor({ perfRef, initialTier }: { perfRef: React.MutableRefObject<PerformanceTier>; initialTier: number }) {
  const fpsBuffer = useRef<number[]>([]);
  const currentTier = useRef(initialTier);
  const stableHighCount = useRef(0);
  const lastTransition = useRef(performance.now());

  useEffect(() => {
    perfRef.current = { ...TIERS[initialTier] };
    console.log(`[Perf] Initial tier: ${initialTier} (${initialTier === 0 ? 'high' : initialTier === 1 ? 'medium' : 'low'})`);
  }, []);

  // Dynamic tier adjustment — only downgrades smoothly (no remounts, just ref updates)
  useFrame((_, delta) => {
    if (delta <= 0) return;
    const fps = 1 / delta;
    fpsBuffer.current.push(fps);

    // Evaluate every ~45 frames
    if (fpsBuffer.current.length < 45) return;

    const avg = fpsBuffer.current.reduce((a, b) => a + b, 0) / fpsBuffer.current.length;
    fpsBuffer.current = [];

    const now = performance.now();
    // Cooldown: wait at least 5s between tier changes to avoid oscillation
    if (now - lastTransition.current < 5000) return;

    const tier = currentTier.current;

    // Downgrade: if avg FPS is consistently low
    if (tier < 2 && avg < 24) {
      currentTier.current = 2;
      perfRef.current = { ...TIERS[2] };
      lastTransition.current = now;
      console.log(`[Perf] Downgraded to LOW (avg FPS: ${avg.toFixed(0)})`);
      stableHighCount.current = 0;
    } else if (tier === 0 && avg < 38) {
      currentTier.current = 1;
      perfRef.current = { ...TIERS[1] };
      lastTransition.current = now;
      console.log(`[Perf] Downgraded to MEDIUM (avg FPS: ${avg.toFixed(0)})`);
      stableHighCount.current = 0;
    }
    // Upgrade: only after sustained high FPS (3 consecutive good windows)
    else if (tier > 0 && avg > 55) {
      stableHighCount.current++;
      if (stableHighCount.current >= 3) {
        const newTier = Math.max(0, tier - 1);
        currentTier.current = newTier;
        perfRef.current = { ...TIERS[newTier] };
        lastTransition.current = now;
        stableHighCount.current = 0;
        console.log(`[Perf] Upgraded to ${newTier === 0 ? 'HIGH' : 'MEDIUM'} (avg FPS: ${avg.toFixed(0)})`);
      }
    } else {
      stableHighCount.current = 0;
    }
  });

  return null;
}
