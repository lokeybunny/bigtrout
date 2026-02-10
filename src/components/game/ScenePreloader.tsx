import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * ScenePreloader
 * 
 * Forces the Three.js renderer to compile all materials and geometries
 * in the first few frames. This prevents shader compilation stutter
 * during gameplay by front-loading all GPU work during countdown.
 */
export const ScenePreloader = () => {
  const { gl, scene, camera } = useThree();
  const compiled = useRef(false);
  const frameCount = useRef(0);

  useFrame(() => {
    if (compiled.current) return;
    frameCount.current++;

    // Frame 1: compile all shaders
    if (frameCount.current === 1) {
      try {
        gl.compile(scene, camera);
        console.log('[Preloader] Scene compiled — all shaders ready');
      } catch (e) {
        console.warn('[Preloader] Compile failed:', e);
      }
    }

    // Frame 3: force a full render pass to warm GPU caches
    if (frameCount.current === 3) {
      try {
        gl.render(scene, camera);
        console.log('[Preloader] Warm-up render complete');
      } catch (e) {
        // ignore
      }
      compiled.current = true;
    }
  });

  return null;
};
