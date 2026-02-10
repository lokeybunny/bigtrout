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

    // Frame 3: compile all shaders (skip frame 1 to let scene settle)
    if (frameCount.current === 3) {
      try {
        gl.compile(scene, camera);
        console.log('[Preloader] Scene compiled — all shaders ready');
      } catch (e) {
        console.warn('[Preloader] Compile failed:', e);
      }
      compiled.current = true;
    }
  });

  return null;
};
