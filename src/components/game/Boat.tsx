import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Boat = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.02;
    groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.01;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 2]}>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.4, 4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
      </mesh>
      {/* Sides */}
      <mesh position={[-1.2, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      {/* Stern */}
      <mesh position={[0, 0.3, 2]}>
        <boxGeometry args={[2.5, 0.4, 0.15]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      {/* Fishing rod holder */}
      <mesh position={[0.8, 0.8, 1.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5]} />
        <meshStandardMaterial color="#3a2a0a" />
      </mesh>
      {/* Rod */}
      <mesh position={[0.8, 1.6, 0.5]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.01, 3]} />
        <meshStandardMaterial color="#2a1a05" />
      </mesh>
    </group>
  );
};
