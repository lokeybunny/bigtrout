import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RenderHealthWatchdog
 * 
 * Monitors the camera and scene health every frame.
 * If the camera position or quaternion becomes NaN/Infinity,
 * it resets to a known-good state to prevent blank-out.
 * 
 * Also periodically checks that the renderer is alive.
 */

const SAFE_POS = new THREE.Vector3(0, 3, -5);
const SAFE_TARGET = new THREE.Vector3(0, 0, -15);

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
  const recoveryCount = useRef(0);
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current++;

    // Check camera position validity
    if (vec3Invalid(camera.position)) {
      console.warn(`[Watchdog] Camera position invalid (${camera.position.toArray()}), resetting to last good`);
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      recoveryCount.current++;
      return;
    }

    // Check for extreme positions (camera flew off into space)
    const dist = camera.position.length();
    if (dist > 1000) {
      console.warn(`[Watchdog] Camera too far (${dist.toFixed(0)}), resetting`);
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      recoveryCount.current++;
      return;
    }

    // Check quaternion validity
    const q = camera.quaternion;
    if (isInvalid(q.x) || isInvalid(q.y) || isInvalid(q.z) || isInvalid(q.w)) {
      console.warn('[Watchdog] Camera quaternion invalid, resetting');
      camera.position.copy(lastGoodPos.current);
      camera.quaternion.copy(lastGoodQuat.current);
      recoveryCount.current++;
      return;
    }

    // Save last known good state
    lastGoodPos.current.copy(camera.position);
    lastGoodQuat.current.copy(camera.quaternion);

    // Periodically verify renderer is alive (every ~300 frames)
    if (frameCount.current % 300 === 0) {
      try {
        const ctx = gl.getContext();
        if (ctx && (ctx as WebGLRenderingContext).isContextLost?.()) {
          console.warn('[Watchdog] WebGL context lost detected in frame loop');
        }
      } catch {
        // ignore
      }
    }
  });

  return null;
};
