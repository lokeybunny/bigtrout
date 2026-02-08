import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BoatProps {
  onPositionUpdate?: (pos: THREE.Vector3, rot: number) => void;
}

export const Boat = ({ onPositionUpdate }: BoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ forward: 0, turn: 0 });
  const headingRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(0, -0.3, 2));
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

    headingRef.current += vel.turn * delta;

    // Move in heading direction
    const dx = -Math.sin(headingRef.current) * vel.forward * delta;
    const dz = -Math.cos(headingRef.current) * vel.forward * delta;
    posRef.current.x += dx;
    posRef.current.z += dz;

    // Clamp to play area
    posRef.current.x = Math.max(-40, Math.min(40, posRef.current.x));
    posRef.current.z = Math.max(-40, Math.min(40, posRef.current.z));

    // Ocean bob
    const bobY = -0.3 + Math.sin(t * 0.8) * 0.15;

    groupRef.current.position.set(posRef.current.x, bobY, posRef.current.z);
    groupRef.current.rotation.y = headingRef.current;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.02 - vel.turn * 0.08;
    groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.01 + vel.forward * 0.005;

    // Sail tilt based on speed
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

  const sailTilt = 0.15;

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

      {/* Main sail */}
      <group rotation={[0, sailTilt, 0]}>
        <mesh position={[0.7, 3.2, -0.3]}>
          <planeGeometry args={[1.4, 3.5]} />
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

      {/* Jib sail (front triangle) */}
      <mesh position={[0, 2.8, -2]}>
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
    </group>
  );
};
