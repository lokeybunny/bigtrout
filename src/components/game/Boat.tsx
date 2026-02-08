import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BoatProps {
  onPositionUpdate?: (pos: THREE.Vector3, rot: number) => void;
  speedRef?: MutableRefObject<number>;
  posRef?: MutableRefObject<THREE.Vector3>;
  headingRef?: MutableRefObject<number>;
  raceStarted?: boolean;
}

export const Boat = ({ onPositionUpdate, speedRef: externalSpeedRef, posRef: externalPosRef, headingRef: externalHeadingRef, raceStarted = true }: BoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const sailRef = useRef<THREE.Group>(null);
  const jibRef = useRef<THREE.Mesh>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ forward: 0, turn: 0 });
  const headingRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(0, -0.3, -15));
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
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const keys = keysRef.current;
    const vel = velocityRef.current;
    const t = clock.getElapsedTime();

    // Acceleration / deceleration
    const accel = 4;
    const maxSpeed = 8;
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

    headingRef.current += vel.turn * delta;

    // Move in heading direction
    const dx = -Math.sin(headingRef.current) * vel.forward * delta;
    const dz = -Math.cos(headingRef.current) * vel.forward * delta;
    posRef.current.x += dx;
    posRef.current.z += dz;

    // Clamp to play area — wide enough for the full race track
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
      // Sail rotates based on wind (speed) and turning
      sailRef.current.rotation.y = 0.1 + speedNorm * 0.4 + turnNorm * 0.3;
      // Bulge effect via scale
      sailRef.current.scale.x = 1 + speedNorm * 0.3;
      sailRef.current.scale.z = 1 + speedNorm * 0.15;
    }
    if (jibRef.current) {
      const speedNorm = Math.abs(vel.forward) / maxSpeed;
      jibRef.current.scale.x = 1 + speedNorm * 0.25;
      jibRef.current.rotation.y = Math.sin(t * 2) * 0.05 + speedNorm * 0.2;
    }

    // Camera follow
    const camOffset = new THREE.Vector3(0, 3.5, 8);
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), headingRef.current);
    const targetCamPos = posRef.current.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.04);

    const lookTarget = posRef.current.clone().add(
      new THREE.Vector3(0, 0.5, -5).applyAxisAngle(new THREE.Vector3(0, 1, 0), headingRef.current)
    );
    camera.lookAt(lookTarget);

    onPositionUpdate?.(posRef.current.clone(), headingRef.current);
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 2]}>
      {/* Hull - tapered boat shape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.4, 5]} />
        <meshStandardMaterial color="#6b4226" roughness={0.85} />
      </mesh>
      {/* Bow (front taper) */}
      <mesh position={[0, 0, -2.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshStandardMaterial color="#7a4c2e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, -3.4]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#7a4c2e" roughness={0.85} />
      </mesh>
      {/* Sides / gunwales */}
      <mesh position={[-0.95, 0.35, -0.2]}>
        <boxGeometry args={[0.12, 0.35, 5]} />
        <meshStandardMaterial color="#553318" roughness={0.9} />
      </mesh>
      <mesh position={[0.95, 0.35, -0.2]}>
        <boxGeometry args={[0.12, 0.35, 5]} />
        <meshStandardMaterial color="#553318" roughness={0.9} />
      </mesh>
      {/* Stern */}
      <mesh position={[0, 0.35, 2.45]}>
        <boxGeometry args={[2, 0.35, 0.12]} />
        <meshStandardMaterial color="#553318" roughness={0.9} />
      </mesh>
      {/* Deck planks */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[1.8, 0.02, 4.8]} />
        <meshStandardMaterial color="#8b6340" roughness={0.95} />
      </mesh>

      {/* Mast */}
      <mesh position={[0, 2.8, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 5]} />
        <meshStandardMaterial color="#4a3010" roughness={0.9} />
      </mesh>

      {/* Main sail — animated */}
      <group ref={sailRef} rotation={[0, 0.15, 0]}>
        <mesh position={[0.7, 3.2, -0.3]}>
          <planeGeometry args={[1.4, 3.5, 4, 6]} />
          <meshStandardMaterial 
            color="#f0e8d8" 
            side={THREE.DoubleSide} 
            roughness={0.7}
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Boom (horizontal beam for main sail) */}
        <mesh position={[0.7, 1.5, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4]} />
          <meshStandardMaterial color="#4a3010" />
        </mesh>
      </group>

      {/* Jib sail (front triangle) — animated */}
      <mesh ref={jibRef} position={[0, 2.8, -2]}>
        <coneGeometry args={[0.8, 2.5, 3]} />
        <meshStandardMaterial 
          color="#e8ddd0" 
          side={THREE.DoubleSide} 
          roughness={0.7} 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Crow's nest / top */}
      <mesh position={[0, 5.1, -0.3]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#3a2208" />
      </mesh>

      {/* Flag at top */}
      <mesh position={[0.2, 5.4, -0.3]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color="#44ff88" side={THREE.DoubleSide} emissive="#44ff88" emissiveIntensity={0.3} />
      </mesh>

      {/* Fishing rod at stern */}
      <mesh position={[0.7, 0.8, 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2]} />
        <meshStandardMaterial color="#3a2a0a" />
      </mesh>
      <mesh position={[0.7, 1.5, 1]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.008, 2.5]} />
        <meshStandardMaterial color="#2a1a05" />
      </mesh>

      {/* Lantern on stern */}
      <mesh position={[-0.6, 0.8, 2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa22" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[-0.6, 0.8, 2]} color="#ffcc44" intensity={1} distance={6} />

      {/* ===== FISHERMAN ===== */}
      <group position={[0, 0.22, 0.8]}>
        {/* Legs — black pants */}
        <mesh position={[-0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Boots */}
        <mesh position={[-0.12, 0.08, 0.05]}>
          <boxGeometry args={[0.2, 0.16, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.12, 0.08, 0.05]}>
          <boxGeometry args={[0.2, 0.16, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Torso — white t-shirt */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.25]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.28, 0.3, 0.28]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Hat (bucket hat) */}
        <mesh position={[0, 1.72, 0]}>
          <cylinderGeometry args={[0.25, 0.2, 0.15, 8]} />
          <meshStandardMaterial color="#5a7a3a" />
        </mesh>
        <mesh position={[0, 1.67, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 8]} />
          <meshStandardMaterial color="#4a6a2a" />
        </mesh>
        {/* Arms */}
        {/* Left arm — holding rod */}
        <mesh position={[-0.32, 1.0, -0.1]} rotation={[0.4, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color="#cc8822" />
        </mesh>
        {/* Right arm — relaxed */}
        <mesh position={[0.32, 0.95, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color="#cc8822" />
        </mesh>
        {/* Hands */}
        <mesh position={[-0.35, 0.7, -0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        <mesh position={[0.35, 0.68, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
      </group>

      {/* ===== FISH BAGS / CATCH ===== */}
      {/* Bag 1 — large burlap sack with trout tails poking out */}
      <group position={[-0.5, 0.35, 1.5]}>
        <mesh>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.95} />
        </mesh>
        {/* Tied top */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 0.15, 6]} />
          <meshStandardMaterial color="#6a5a3a" />
        </mesh>
        {/* Rope tie */}
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.08, 0.015, 6, 8]} />
          <meshStandardMaterial color="#aa9060" />
        </mesh>
        {/* Fish tail sticking out */}
        <mesh position={[0.1, 0.35, 0]} rotation={[0.3, 0, 0.5]}>
          <coneGeometry args={[0.08, 0.15, 4]} />
          <meshStandardMaterial color="#2d8a4e" />
        </mesh>
      </group>

      {/* Bag 2 — smaller sack */}
      <group position={[0.4, 0.32, 1.8]}>
        <mesh>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color="#7a6a4a" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.06, 0.12, 0.12, 6]} />
          <meshStandardMaterial color="#6a5a3a" />
        </mesh>
        {/* Fish tail */}
        <mesh position={[-0.05, 0.28, 0.05]} rotation={[-0.2, 0, -0.4]}>
          <coneGeometry args={[0.06, 0.12, 4]} />
          <meshStandardMaterial color="#2d8a4e" />
        </mesh>
      </group>

      {/* Bag 3 — near middle */}
      <group position={[0, 0.33, 1.2]}>
        <mesh>
          <sphereGeometry args={[0.25, 8, 6]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.13, 0.12, 6]} />
          <meshStandardMaterial color="#6a5a3a" />
        </mesh>
        {/* Two tails */}
        <mesh position={[0.08, 0.3, 0]} rotation={[0.2, 0.3, 0.3]}>
          <coneGeometry args={[0.07, 0.13, 4]} />
          <meshStandardMaterial color="#2d8a4e" />
        </mesh>
        <mesh position={[-0.08, 0.32, 0.02]} rotation={[-0.3, 0, -0.5]}>
          <coneGeometry args={[0.06, 0.11, 4]} />
          <meshStandardMaterial color="#3a9a5e" />
        </mesh>
      </group>

      {/* Wooden crate with fish visible */}
      <group position={[-0.6, 0.3, 0.5]}>
        <mesh>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial color="#7a5a30" roughness={0.9} />
        </mesh>
        {/* Fish inside crate */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0.3, 0]}>
          <sphereGeometry args={[0.12, 6, 4]} />
          <meshStandardMaterial color="#2d8a4e" metalness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.2, 0.05]} rotation={[0, -0.2, 0.3]}>
          <sphereGeometry args={[0.1, 6, 4]} />
          <meshStandardMaterial color="#3aaa5e" metalness={0.2} />
        </mesh>
      </group>

      {/* Bucket with a fish */}
      <group position={[0.6, 0.28, 0.3]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#6a6a6a" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Water in bucket */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 8]} />
          <meshStandardMaterial color="#2a6a5a" transparent opacity={0.6} />
        </mesh>
        {/* Tail fin poking out */}
        <mesh position={[0.05, 0.2, 0]} rotation={[0.4, 0, 0.6]}>
          <coneGeometry args={[0.06, 0.1, 4]} />
          <meshStandardMaterial color="#2d8a4e" />
        </mesh>
      </group>
    </group>
  );
};
