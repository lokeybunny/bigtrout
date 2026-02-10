import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RenderHealthWatchdog
 * 
 * Monitors camera health every frame. Resets to last-good state
 * on NaN/Infinity or extreme distance. Also tracks if the scene
 * has gone "dead" (no visible rendering) and triggers context
 * loss recovery via a forced context loss event.
 */

const SAFE_POS = new THREE.Vector3(0, 3, -5);

function isInvalid(v: number) {
  return !Number.isFinite(v);
}

function vec3Invalid(v: THREE.Vector3) {
  return isInvalid(v.x) || isInvalid(v.y) || isInvalid(v.z);
}

export const RenderHealthWatchdog = () => {
  const { camera, gl } = useThree();
  const lastGoodPos = useRef(new THREE.Vector3().copy(SAFE_POS));
  const lastGoodQuat = useRef(new THREE.Quaternion());
  const frameCount = useRef(0);
  

  useFrame(() => {
    frameCount.current++;

    // Check camera position validity
    if (vec3Invalid(camera.position)) {
      console.warn('[Watchdog] Camera position invalid, resetting');
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      return;
    }

    // Check for extreme positions (camera flew off into space)
    const dist = camera.position.length();
    if (dist > 500) {
      console.warn(`[Watchdog] Camera too far (${dist.toFixed(0)}), resetting`);
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      return;
    }

    // Check quaternion validity
    const q = camera.quaternion;
    if (isInvalid(q.x) || isInvalid(q.y) || isInvalid(q.z) || isInvalid(q.w)) {
      console.warn('[Watchdog] Camera quaternion invalid, resetting');
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      return;
    }

    // Save last known good state
    lastGoodPos.current.copy(camera.position);
    lastGoodQuat.current.copy(camera.quaternion);

    // Passive context health check — log only, never dispatch synthetic events
    // (dispatching synthetic webglcontextlost caused an infinite loss/restore loop)
    if (frameCount.current % 300 === 0) {
      try {
        const ctx = gl.getContext();
        if (ctx && (ctx as WebGLRenderingContext).isContextLost?.()) {
          console.warn('[Watchdog] WebGL context appears lost (passive check)');
        }
      } catch {
        // ignore
      }
    }
  });

  return null;
};
