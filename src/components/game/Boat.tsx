import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { resolveCollisions, CircleCollider, registerBoatPosition, unregisterBoat, resolveBoatCollisions } from './Colliders';
import { useAdaptivePerf } from './AdaptivePerformance';

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
  const perfRef = useAdaptivePerf();
  const groupRef = useRef<THREE.Group>(null);
  const sailRef = useRef<THREE.Group>(null);
  const jibRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ forward: 0, turn: 0 });
  const headingRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(startX, -0.3, -15));
  const paddleArmRef = useRef<THREE.Mesh>(null);
  const paddleRef = useRef<THREE.Group>(null);
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

    // Paddle boost — shift key, disabled after obstacle hit
    const paddling = keys.has('shift') && !paddleDisabled && raceStarted;
    isPaddlingRef.current = paddling;
    const paddleMult = paddling ? 1.4 : 1;

    const accel = 4 * boostMultiplier * paddleMult;
    const maxSpeed = 8 * boostMultiplier * paddleMult;
    const turnSpeed = 1.8;
    const friction = 0.96;

    // Block movement before race starts
    if (!raceStarted) {
      vel.forward = 0;
      vel.turn = 0;
    } else {
      if (keys.has('w') || keys.has('arrowup')) {
        vel.forward = Math.min(vel.forward + accel * delta, maxSpeed);
      } else if (keys.has('s') || keys.has('arrowdown')) {
        vel.forward = Math.max(vel.forward - accel * delta, -maxSpeed * 0.4);
      } else {
        vel.forward *= friction;
      }

      if (keys.has('a') || keys.has('arrowleft')) {
        vel.turn = Math.min(vel.turn + turnSpeed * delta, turnSpeed);
      } else if (keys.has('d') || keys.has('arrowright')) {
        vel.turn = Math.max(vel.turn - turnSpeed * delta, -turnSpeed);
      } else {
        vel.turn *= 0.9;
      }
    }

    headingRef.current += vel.turn * Math.min(delta, 0.1);

    // Guard: if delta is unreasonably large (tab was hidden), clamp it
    const safeDelta = Math.min(delta, 0.1);

    // Save pre-collision position
    const prevX = posRef.current.x;
    const prevZ = posRef.current.z;

    // Guard: if heading became NaN, reset it
    if (!Number.isFinite(headingRef.current)) {
      headingRef.current = 0;
      vel.forward = 0;
      vel.turn = 0;
    }

    // Move in heading direction
    const dx = -Math.sin(headingRef.current) * vel.forward * safeDelta;
    const dz = -Math.cos(headingRef.current) * vel.forward * safeDelta;
    posRef.current.x += dx;
    posRef.current.z += dz;

    // Guard: if position became NaN, reset to safe values
    if (!Number.isFinite(posRef.current.x) || !Number.isFinite(posRef.current.z)) {
      console.warn('[Boat] Position became NaN, resetting');
      posRef.current.x = prevX || startX;
      posRef.current.z = prevZ || -15;
      vel.forward = 0;
      vel.turn = 0;
    }

    // Resolve solid collisions (world objects + obstacles)
    const resolved = resolveCollisions(posRef.current.x, posRef.current.z, 1.2, obstacleColliders);
    posRef.current.x = resolved.x;
    posRef.current.z = resolved.z;

    // Resolve boat-to-boat collisions
    const boatResolved = resolveBoatCollisions('player', posRef.current.x, posRef.current.z, 1.5);
    posRef.current.x = boatResolved.x;
    posRef.current.z = boatResolved.z;

    // Register player position for other boats
    registerBoatPosition('player', posRef.current.x, posRef.current.z);

    if (resolved.hit || boatResolved.hit) {
      // Reflect velocity: reverse forward and deflect heading away from collision
      const pushX = posRef.current.x - prevX;
      const pushZ = posRef.current.z - prevZ;
      const pushLen = Math.sqrt(pushX * pushX + pushZ * pushZ);
      if (pushLen > 0.01) {
        const pushAngle = Math.atan2(-pushX, -pushZ);
        const angleDiff = pushAngle - headingRef.current;
        const normDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        headingRef.current += normDiff * 0.3;
      }
      vel.forward = -vel.forward * 0.3;
      vel.forward = Math.max(-2, Math.min(2, vel.forward));
    }

    // Clamp to play area
    posRef.current.x = Math.max(-120, Math.min(120, posRef.current.x));
    posRef.current.z = Math.max(-250, Math.min(50, posRef.current.z));

    // Ocean bob
    const bobY = -0.3 + Math.sin(t * 0.8) * 0.15;

    groupRef.current.position.set(posRef.current.x, bobY, posRef.current.z);
    groupRef.current.rotation.y = headingRef.current;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.02 - vel.turn * 0.08;
    groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.01 + vel.forward * 0.005;

    // Expose refs for wake effect
    if (externalSpeedRef) externalSpeedRef.current = vel.forward;
    if (externalPosRef) externalPosRef.current.copy(posRef.current);
    if (externalHeadingRef) externalHeadingRef.current = headingRef.current;

    // Animate sail billow based on speed
    if (sailRef.current) {
      const speedNorm = Math.abs(vel.forward) / maxSpeed;
      const turnNorm = vel.turn / turnSpeed;
      sailRef.current.rotation.y = 0.1 + speedNorm * 0.4 + turnNorm * 0.3;
      sailRef.current.scale.x = 1 + speedNorm * 0.3;
      sailRef.current.scale.z = 1 + speedNorm * 0.15;
    }
    if (jibRef.current) {
      const speedNorm = Math.abs(vel.forward) / maxSpeed;
      jibRef.current.scale.x = 1 + speedNorm * 0.25;
      jibRef.current.rotation.y = Math.sin(t * 2) * 0.05 + speedNorm * 0.2;
    }

    // Animate fish head mouth
    if (mouthRef.current) {
      const speedNorm = Math.abs(vel.forward) / maxSpeed;
      const mouthOpen = speedNorm > 0.05 ? Math.sin(t * 6) * 0.08 * speedNorm + 0.02 : 0;
      mouthRef.current.position.y = -0.1 - mouthOpen;
      mouthRef.current.scale.y = 1 + mouthOpen * 8;
    }

    // Animate fish eyes
    const turnNorm = vel.turn / turnSpeed;
    const eyeShift = turnNorm * 0.04;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.22 + eyeShift;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.22 + eyeShift;
    }

    // Animate paddle when shift is held
    if (paddleArmRef.current && paddleRef.current) {
      if (isPaddlingRef.current) {
        const paddleSwing = Math.sin(t * 8) * 0.6;
        paddleArmRef.current.rotation.x = 0.8 + paddleSwing;
        paddleRef.current.visible = true;
        paddleRef.current.rotation.x = 0.8 + paddleSwing;
      } else {
        paddleArmRef.current.rotation.x = 0;
        paddleRef.current.visible = false;
      }
    }

    // Camera follow
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
      {/* Hull — meshLambertMaterial (cheap diffuse, no PBR) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.4, 5]} />
        <meshLambertMaterial color="#6b4226" />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0, -2.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshLambertMaterial color="#7a4c2e" />
      </mesh>
      <mesh position={[0, 0.05, -3.4]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshLambertMaterial color="#7a4c2e" />
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
      {/* Deck */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[1.8, 0.02, 4.8]} />
        <meshBasicMaterial color="#8b6340" />
      </mesh>

      {/* Mast */}
      <mesh position={[0, 2.8, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 5]} />
        <meshBasicMaterial color="#4a3010" />
      </mesh>

      {/* Main sail — animated */}
      <group ref={sailRef} rotation={[0, 0.15, 0]}>
        <mesh position={[0.7, 3.2, -0.3]}>
          <planeGeometry args={[1.4, 3.5, 2, 2]} />
          <meshLambertMaterial color="#f0e8d8" side={THREE.DoubleSide} transparent opacity={0.95} />
        </mesh>
        {/* Boom */}
        <mesh position={[0.7, 1.5, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4]} />
          <meshBasicMaterial color="#4a3010" />
        </mesh>
      </group>

      {/* Jib sail */}
      <mesh ref={jibRef} position={[0, 2.8, -2]}>
        <coneGeometry args={[0.8, 2.5, 3]} />
        <meshLambertMaterial color="#e8ddd0" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Crow's nest */}
      <mesh position={[0, 5.1, -0.3]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshBasicMaterial color="#3a2208" />
      </mesh>

      {/* Flag */}
      <mesh position={[0.2, 5.4, -0.3]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshBasicMaterial color="#44ff88" side={THREE.DoubleSide} />
      </mesh>

      {/* Fishing rod */}
      <mesh position={[0.7, 0.8, 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2]} />
        <meshBasicMaterial color="#3a2a0a" />
      </mesh>
      <mesh position={[0.7, 1.5, 1]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.008, 2.5]} />
        <meshBasicMaterial color="#2a1a05" />
      </mesh>

      {/* Lantern */}
      <mesh position={[-0.6, 0.8, 2]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="#ffcc44" />
      </mesh>

      {/* ===== FISHERMAN ===== */}
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
        {/* Boots */}
        <mesh position={[-0.12, 0.08, 0.05]}>
          <boxGeometry args={[0.2, 0.16, 0.28]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.12, 0.08, 0.05]}>
          <boxGeometry args={[0.2, 0.16, 0.28]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.25]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        {/* ===== BIG FISH HEAD ===== */}
        <group position={[0, 1.45, 0]} rotation={[0, Math.PI, 0]}>
          {/* Main fish head — Lambert for the key piece */}
          <mesh>
            <sphereGeometry args={[0.3, 6, 6]} />
            <meshLambertMaterial color={fishColor} />
          </mesh>
          {/* Fish belly */}
          <mesh position={[0, -0.08, 0.05]} scale={[0.9, 0.7, 0.85]}>
            <sphereGeometry args={[0.28, 4, 4]} />
            <meshBasicMaterial color={fishColor} transparent opacity={0.7} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh ref={leftPupilRef} position={[-0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <mesh position={[0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh ref={rightPupilRef} position={[0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.1, 0.25]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.25, 0.04, 0.06]} />
            <meshBasicMaterial color="#cc3333" />
          </mesh>
          {/* Dorsal fin */}
          <mesh position={[0, 0.28, -0.05]} rotation={[0.3, 0, 0]}>
            <coneGeometry args={[0.12, 0.25, 3]} />
            <meshBasicMaterial color={fishColor} />
          </mesh>
          {/* Side fins */}
          <mesh position={[-0.28, 0, 0]} rotation={[0, 0, -0.6]}>
            <coneGeometry args={[0.08, 0.2, 3]} />
            <meshBasicMaterial color={fishColor} />
          </mesh>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, 0.6]}>
            <coneGeometry args={[0.08, 0.2, 3]} />
            <meshBasicMaterial color={fishColor} />
          </mesh>
        </group>
        {/* Arms */}
        <mesh position={[-0.32, 1.0, -0.1]} rotation={[0.4, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshBasicMaterial color="#cc8822" />
        </mesh>
        <mesh ref={paddleArmRef} position={[0.32, 0.95, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshBasicMaterial color="#cc8822" />
        </mesh>

        {/* Paddle */}
        <group ref={paddleRef} position={[0.5, 0.4, -0.3]} visible={false}>
          <mesh rotation={[0.8, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.8]} />
            <meshBasicMaterial color="#5a3a10" />
          </mesh>
          <mesh position={[0, -0.6, -0.5]} rotation={[0.8, 0, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.5]} />
            <meshBasicMaterial color="#7a5a20" />
          </mesh>
        </group>
        {/* Hands */}
        <mesh position={[-0.35, 0.7, -0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#d4a574" />
        </mesh>
        <mesh position={[0.35, 0.68, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#d4a574" />
        </mesh>
      </group>

      {/* ===== FISH BAGS / CATCH — hidden on low-tier devices ===== */}
      {perfRef.current.enableBoatDetails && (
        <>
          {/* Bag 1 */}
          <group position={[-0.5, 0.35, 1.5]}>
            <mesh>
              <sphereGeometry args={[0.3, 4, 4]} />
              <meshBasicMaterial color="#8a7a5a" />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.08, 0.15, 0.15, 4]} />
              <meshBasicMaterial color="#6a5a3a" />
            </mesh>
          </group>
          {/* Bag 2 */}
          <group position={[0.4, 0.32, 1.8]}>
            <mesh>
              <sphereGeometry args={[0.22, 4, 4]} />
              <meshBasicMaterial color="#7a6a4a" />
            </mesh>
          </group>
          {/* Crate */}
          <mesh position={[-0.6, 0.3, 0.5]}>
            <boxGeometry args={[0.5, 0.3, 0.4]} />
            <meshBasicMaterial color="#7a5a30" />
          </mesh>
          {/* Bucket */}
          <mesh position={[0.6, 0.28, 0.3]}>
            <cylinderGeometry args={[0.15, 0.12, 0.3, 6]} />
            <meshBasicMaterial color="#6a6a6a" />
          </mesh>
        </>
      )}
    </group>
  );
};
