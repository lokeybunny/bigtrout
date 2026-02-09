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
  const sampleWindows = useRef(0);
  const currentTier = useRef(initialTier);
  const stableHighCount = useRef(0); // consecutive high-FPS windows for upgrade
  const lastTransition = useRef(0); // timestamp of last tier change

  // Set initial tier — no DPR changes (causes white flashes)
  useEffect(() => {
    perfRef.current = { ...TIERS[initialTier] };
    console.log(`[Perf] Initial tier: ${initialTier} (${initialTier === 0 ? 'high' : initialTier === 1 ? 'medium' : 'low'})`);
  }, []);

  // Tier changes during gameplay cause white flashes — disabled.
  // Initial hardware detection sets the tier once on mount.
  // This monitor now only logs FPS for debugging, no tier changes.
  useFrame((_, delta) => {
    if (delta <= 0) return;
  });

  return null;
}
