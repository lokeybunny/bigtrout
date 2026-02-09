import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OpponentBoatProps {
  posRef: React.MutableRefObject<{ x: number; z: number; heading: number }>;
  color?: string;
  fishEmoji?: string;
}

/**
 * Renders the opponent's boat in multiplayer.
 * Position is driven externally via posRef (updated from Realtime broadcast).
 */
export const OpponentBoat = ({ posRef, color = '#cc9933' }: OpponentBoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0, -0.3, -15));
  const targetHeading = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Smoothly interpolate to opponent's position
    targetPos.current.set(posRef.current.x, -0.3, posRef.current.z);
    targetHeading.current = posRef.current.heading;

    groupRef.current.position.lerp(targetPos.current, 0.15);
    // Smooth heading interpolation
    const currentY = groupRef.current.rotation.y;
    const diff = targetHeading.current - currentY;
    const normDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
    groupRef.current.rotation.y += normDiff * 0.15;

    // Ocean bob
    groupRef.current.position.y = -0.3 + Math.sin(t * 0.8 + 1) * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + 2) * 0.02;
    groupRef.current.rotation.x = Math.cos(t * 0.5 + 1) * 0.01;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, -15]}>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.4, 5]} />
        <meshStandardMaterial color="#6b4226" roughness={0.85} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0, -2.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshStandardMaterial color="#7a4c2e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, -3.4]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#7a4c2e" roughness={0.85} />
      </mesh>
      {/* Sides */}
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
      {/* Deck */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[1.8, 0.02, 4.8]} />
        <meshStandardMaterial color="#8b6340" roughness={0.95} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 2.8, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 5]} />
        <meshStandardMaterial color="#4a3010" roughness={0.9} />
      </mesh>
      {/* Sail */}
      <mesh position={[0.7, 3.2, -0.3]}>
        <planeGeometry args={[1.4, 3.5]} />
        <meshStandardMaterial color="#f0e8d8" side={THREE.DoubleSide} roughness={0.7} transparent opacity={0.95} />
      </mesh>
      {/* Flag - opponent color */}
      <mesh position={[0.2, 5.4, -0.3]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Fisherman body */}
      <group position={[0, 0.22, 0.8]}>
        <mesh position={[-0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.12, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.25]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        {/* Fish head - colored by opponent selection */}
        <group position={[0, 1.45, 0]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <sphereGeometry args={[0.3, 10, 8]} />
            <meshStandardMaterial color={color} metalness={0.25} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.08, 0.05]} scale={[0.9, 0.7, 0.85]}>
            <sphereGeometry args={[0.28, 8, 6]} />
            <meshStandardMaterial color="#6ecf8a" metalness={0.15} roughness={0.6} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.2, 0.08, 0.18]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.22, 0.08, 0.26]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Mouth */}
          <mesh position={[0, -0.1, 0.25]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.25, 0.04, 0.06]} />
            <meshStandardMaterial color="#cc3333" />
          </mesh>
          {/* Dorsal fin */}
          <mesh position={[0, 0.28, -0.05]} rotation={[0.3, 0, 0]}>
            <coneGeometry args={[0.12, 0.25, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>
      {/* Opponent name label - glowing above boat */}
      <mesh position={[0, 6, -0.3]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </group>
  );
};
