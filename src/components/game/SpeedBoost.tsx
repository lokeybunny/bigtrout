import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';

export interface BoostPickup {
  id: string;
  position: [number, number, number];
  active: boolean;
}

// Generate boosts scattered along the race track (1 per checkpoint pair to reduce draw calls)
export const generateBoosts = (): BoostPickup[] => {
  const boosts: BoostPickup[] = [];
  let id = 0;
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    const curr = CHECKPOINTS[i];
    const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];
    const t = 0.5;
    const x = curr[0] + (next[0] - curr[0]) * t + (Math.random() - 0.5) * 8;
    const z = curr[1] + (next[1] - curr[1]) * t + (Math.random() - 0.5) * 4;
    boosts.push({
      id: `boost-${id++}`,
      position: [x, 0.5, z],
      active: true,
    });
  }
  return boosts;
};

interface SpeedBoostProps {
  pickup: BoostPickup;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  onCollect: (id: string) => void;
}

export const SpeedBoost = ({ pickup, playerPos, onCollect }: SpeedBoostProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const collected = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current || !pickup.active || collected.current) return;
    const t = clock.getElapsedTime();

    // Hover and spin
    groupRef.current.position.y = pickup.position[1] + Math.sin(t * 3) * 0.3;
    groupRef.current.rotation.y = t * 2;

    // Check collision with player — squared distance
    const dx = playerPos.current.x - pickup.position[0];
    const dz = playerPos.current.z - pickup.position[2];
    if (dx * dx + dz * dz < 16) { // 4^2 = 16
      collected.current = true;
      onCollect(pickup.id);
    }
  });

  if (!pickup.active) return null;

  return (
    <group ref={groupRef} position={[pickup.position[0], pickup.position[1], pickup.position[2]]}>
      {/* Outer ring — reduced segments */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.12, 4, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>
      {/* Inner bolt */}
      <mesh>
        <coneGeometry args={[0.35, 0.8, 4]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} />
      </mesh>
      {/* Removed pointLight for performance */}
    </group>
  );
};
