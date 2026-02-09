import { useRef, createContext, useContext, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

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
  const { gl } = useThree();
  const fpsBuffer = useRef<number[]>([]);
  const sampleWindows = useRef(0);
  const currentTier = useRef(initialTier);
  const stableHighCount = useRef(0); // consecutive high-FPS windows for upgrade
  const lastTransition = useRef(0); // timestamp of last tier change

  // Apply initial tier DPR
  useEffect(() => {
    if (initialTier >= 2) {
      gl.setPixelRatio(1);
    } else if (initialTier === 1) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    }
    perfRef.current = { ...TIERS[initialTier] };
    console.log(`[Perf] Initial tier: ${initialTier} (${initialTier === 0 ? 'high' : initialTier === 1 ? 'medium' : 'low'})`);
  }, []);

  useFrame((_, delta) => {
    if (delta <= 0) return;
    const fps = 1 / delta;
    fpsBuffer.current.push(fps);

    // Evaluate every 45 frames (~0.75s at 60fps)
    if (fpsBuffer.current.length < 45) return;

    const avg = fpsBuffer.current.reduce((a, b) => a + b, 0) / fpsBuffer.current.length;
    fpsBuffer.current.length = 0;
    sampleWindows.current++;

    // Skip first 2 windows (initial load stutter)
    if (sampleWindows.current < 3) return;

    const now = performance.now();
    // Cooldown: don't change tier within 3 seconds of last change
    if (now - lastTransition.current < 3000) return;

    let newTier = currentTier.current;

    // Downgrade thresholds
    if (avg < 20 && newTier < 2) {
      newTier = 2;
      stableHighCount.current = 0;
    } else if (avg < 32 && newTier < 1) {
      newTier = 1;
      stableHighCount.current = 0;
    }
    // Upgrade thresholds (need 4 consecutive good windows ~3s)
    else if (avg > 50 && newTier > 0) {
      stableHighCount.current++;
      if (stableHighCount.current >= 4) {
        newTier = newTier - 1;
        stableHighCount.current = 0;
      }
    } else {
      stableHighCount.current = 0;
    }

    if (newTier !== currentTier.current) {
      currentTier.current = newTier;
      lastTransition.current = now;
      perfRef.current = { ...TIERS[newTier] };

      // Adjust DPR
      if (newTier === 2) {
        gl.setPixelRatio(1);
      } else if (newTier === 1) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
      } else {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }

      console.log(`[Perf] Tier ${newTier} (${newTier === 0 ? 'high' : newTier === 1 ? 'medium' : 'low'}) — FPS avg: ${avg.toFixed(1)}`);
    }
  });

  return null;
}
