import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { resolveCollisions, CircleCollider, registerBoatPosition, unregisterBoat, resolveBoatCollisions } from './Colliders';

interface BoatProps {
  onPositionUpdate?: (pos: THREE.Vector3, rot: number) => void;
  speedRef?: MutableRefObject<number>;
  posRef?: MutableRefObject<THREE.Vector3>;
  headingRef?: MutableRefObject<number>;
  raceStarted?: boolean;
  boostMultiplier?: number;
  paddleDisabled?: boolean;
  onPaddleChange?: (active: boolean) => void;
  obstacleColliders?: CircleCollider[];
  startX?: number;
  fishColor?: string;
}

// Pre-allocated vectors to avoid per-frame GC
const _camOffset = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);

export const Boat = ({ onPositionUpdate, speedRef: externalSpeedRef, posRef: externalPosRef, headingRef: externalHeadingRef, raceStarted = true, boostMultiplier = 1, paddleDisabled = false, onPaddleChange, obstacleColliders, startX = 0, fishColor = '#2d8a4e' }: BoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const sailRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ forward: 0, turn: 0 });
  const headingRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(startX, -0.3, -15));
  const isPaddlingRef = useRef(false);
  const { camera } = useThree();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      unregisterBoat('player');
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const keys = keysRef.current;
    const vel = velocityRef.current;
    const t = clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.1);

    // Paddle boost
    const paddling = keys.has('shift') && !paddleDisabled && raceStarted;
    isPaddlingRef.current = paddling;
    const paddleMult = paddling ? 1.4 : 1;

    const accel = 4 * boostMultiplier * paddleMult;
    const maxSpeed = 8 * boostMultiplier * paddleMult;
    const turnSpeed = 1.8;
    const friction = 0.96;

    if (!raceStarted) {
      vel.forward = 0;
      vel.turn = 0;
    } else {
      if (keys.has('w') || keys.has('arrowup')) {
        vel.forward = Math.min(vel.forward + accel * safeDelta, maxSpeed);
      } else if (keys.has('s') || keys.has('arrowdown')) {
        vel.forward = Math.max(vel.forward - accel * safeDelta, -maxSpeed * 0.4);
      } else {
        vel.forward *= friction;
      }

      if (keys.has('a') || keys.has('arrowleft')) {
        vel.turn = Math.min(vel.turn + turnSpeed * safeDelta, turnSpeed);
      } else if (keys.has('d') || keys.has('arrowright')) {
        vel.turn = Math.max(vel.turn - turnSpeed * safeDelta, -turnSpeed);
      } else {
        vel.turn *= 0.9;
      }
    }

    headingRef.current += vel.turn * safeDelta;

    // Guard NaN
    if (!Number.isFinite(headingRef.current)) {
      headingRef.current = 0;
      vel.forward = 0;
      vel.turn = 0;
    }

    const prevX = posRef.current.x;
    const prevZ = posRef.current.z;

    const dx = -Math.sin(headingRef.current) * vel.forward * safeDelta;
    const dz = -Math.cos(headingRef.current) * vel.forward * safeDelta;
    posRef.current.x += dx;
    posRef.current.z += dz;

    // Guard NaN
    if (!Number.isFinite(posRef.current.x) || !Number.isFinite(posRef.current.z)) {
      posRef.current.x = prevX || startX;
      posRef.current.z = prevZ || -15;
      vel.forward = 0;
      vel.turn = 0;
    }

    // Resolve collisions
    const resolved = resolveCollisions(posRef.current.x, posRef.current.z, 1.2, obstacleColliders);
    posRef.current.x = resolved.x;
    posRef.current.z = resolved.z;

    const boatResolved = resolveBoatCollisions('player', posRef.current.x, posRef.current.z, 1.5);
    posRef.current.x = boatResolved.x;
    posRef.current.z = boatResolved.z;

    registerBoatPosition('player', posRef.current.x, posRef.current.z);

    if (resolved.hit || boatResolved.hit) {
      const pushX = posRef.current.x - prevX;
      const pushZ = posRef.current.z - prevZ;
      const pushLen = Math.sqrt(pushX * pushX + pushZ * pushZ);
      if (pushLen > 0.01) {
        const pushAngle = Math.atan2(-pushX, -pushZ);
        const angleDiff = pushAngle - headingRef.current;
        const normDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        headingRef.current += normDiff * 0.3;
      }
      vel.forward = Math.max(-2, Math.min(2, -vel.forward * 0.3));
    }

    posRef.current.x = Math.max(-120, Math.min(120, posRef.current.x));
    posRef.current.z = Math.max(-250, Math.min(50, posRef.current.z));

    const bobY = -0.3 + Math.sin(t * 0.8) * 0.15;
    groupRef.current.position.set(posRef.current.x, bobY, posRef.current.z);
    groupRef.current.rotation.y = headingRef.current;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.02 - vel.turn * 0.08;

    if (externalSpeedRef) externalSpeedRef.current = vel.forward;
    if (externalPosRef) externalPosRef.current.copy(posRef.current);
    if (externalHeadingRef) externalHeadingRef.current = headingRef.current;

    // Animate sail
    if (sailRef.current) {
      const speedNorm = Math.abs(vel.forward) / maxSpeed;
      sailRef.current.rotation.y = 0.1 + speedNorm * 0.4;
      sailRef.current.scale.x = 1 + speedNorm * 0.3;
    }

    // Camera follow with NaN guard
    _camOffset.set(0, 3.5, 8);
    _camOffset.applyAxisAngle(_yAxis, headingRef.current);
    _targetCamPos.copy(posRef.current).add(_camOffset);
    if (Number.isFinite(_targetCamPos.x) && Number.isFinite(_targetCamPos.y) && Number.isFinite(_targetCamPos.z)) {
      camera.position.lerp(_targetCamPos, 0.04);
    }
    _lookTarget.set(0, 0.5, -5).applyAxisAngle(_yAxis, headingRef.current);
    _lookTarget.add(posRef.current);
    if (Number.isFinite(_lookTarget.x) && Number.isFinite(_lookTarget.y) && Number.isFinite(_lookTarget.z)) {
      camera.lookAt(_lookTarget);
    }

    onPositionUpdate?.(posRef.current, headingRef.current);
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 2]}>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.4, 5]} />
        <meshBasicMaterial color="#6b4226" />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0, -2.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshBasicMaterial color="#7a4c2e" />
      </mesh>
      {/* Sides */}
      <mesh position={[-0.95, 0.35, -0.2]}>
        <boxGeometry args={[0.12, 0.35, 5]} />
        <meshBasicMaterial color="#553318" />
      </mesh>
      <mesh position={[0.95, 0.35, -0.2]}>
        <boxGeometry args={[0.12, 0.35, 5]} />
        <meshBasicMaterial color="#553318" />
      </mesh>
      {/* Stern */}
      <mesh position={[0, 0.35, 2.45]}>
        <boxGeometry args={[2, 0.35, 0.12]} />
        <meshBasicMaterial color="#553318" />
      </mesh>

      {/* Mast */}
      <mesh position={[0, 2.8, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 5]} />
        <meshBasicMaterial color="#4a3010" />
      </mesh>

      {/* Main sail */}
      <group ref={sailRef} rotation={[0, 0.15, 0]}>
        <mesh position={[0.7, 3.2, -0.3]}>
          <planeGeometry args={[1.4, 3.5]} />
          <meshBasicMaterial color="#f0e8d8" side={THREE.DoubleSide} transparent opacity={0.95} />
        </mesh>
      </group>

      {/* Flag */}
      <mesh position={[0.2, 5.4, -0.3]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshBasicMaterial color="#44ff88" side={THREE.DoubleSide} />
      </mesh>

      {/* Lantern */}
      <mesh position={[-0.6, 0.8, 2]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffcc44" />
      </mesh>

      {/* Fisherman */}
      <group position={[0, 0.22, 0.8]}>
        {/* Legs */}
        <mesh position={[-0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.25]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        {/* Fish head */}
        <group position={[0, 1.45, 0]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <sphereGeometry args={[0.3, 6, 4]} />
            <meshBasicMaterial color={fishColor} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <mesh position={[0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Dorsal fin */}
          <mesh position={[0, 0.28, -0.05]} rotation={[0.3, 0, 0]}>
            <coneGeometry args={[0.12, 0.25, 3]} />
            <meshBasicMaterial color={fishColor} />
          </mesh>
        </group>
        {/* Arms */}
        <mesh position={[-0.32, 1.0, -0.1]} rotation={[0.4, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshBasicMaterial color="#cc8822" />
        </mesh>
        <mesh position={[0.32, 0.95, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshBasicMaterial color="#cc8822" />
        </mesh>
      </group>
    </group>
  );
};
