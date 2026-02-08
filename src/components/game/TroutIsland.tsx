import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TroutIsland = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Gentle bob
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, -180]} rotation={[0, Math.PI, 0]}>
      {/* Main body — elongated fish shape */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[8, 16, 12]} />
        <meshStandardMaterial color="#2d7a3e" roughness={0.8} />
      </mesh>
      {/* Stretched body */}
      <mesh position={[0, 2, -8]}>
        <sphereGeometry args={[6, 14, 10]} />
        <meshStandardMaterial color="#2d8a4e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, 8]}>
        <sphereGeometry args={[5, 12, 10]} />
        <meshStandardMaterial color="#3a9a5e" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.5, 14]}>
        <sphereGeometry args={[4.5, 12, 10]} />
        <meshStandardMaterial color="#3aaa5e" roughness={0.7} />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.5, 17.5]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#1a5a2e" roughness={0.8} />
      </mesh>
      {/* Eye — left */}
      <mesh position={[3, 4, 13]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[3.5, 4.2, 13.5]}>
        <sphereGeometry args={[0.5, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Eye — right */}
      <mesh position={[-3, 4, 13]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-3.5, 4.2, 13.5]}>
        <sphereGeometry args={[0.5, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 3, -16]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[8, 1, 5]} />
        <meshStandardMaterial color="#1a6a2e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5, -16]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[8, 1, 5]} />
        <meshStandardMaterial color="#1a6a2e" roughness={0.7} />
      </mesh>
      {/* Dorsal fin */}
      <mesh position={[0, 7, 0]}>
        <coneGeometry args={[3, 5, 4]} />
        <meshStandardMaterial color="#1a7a3e" roughness={0.7} />
      </mesh>
      {/* Side fins */}
      <mesh position={[6, 0, 5]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[2, 4, 4]} />
        <meshStandardMaterial color="#2a8a4e" roughness={0.7} />
      </mesh>
      <mesh position={[-6, 0, 5]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[2, 4, 4]} />
        <meshStandardMaterial color="#2a8a4e" roughness={0.7} />
      </mesh>
      {/* Spots on body */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 10,
          2 + Math.random() * 4,
          (Math.random() - 0.5) * 20,
        ]}>
          <sphereGeometry args={[0.4 + Math.random() * 0.4, 6, 6]} />
          <meshStandardMaterial color="#1a5a2e" roughness={0.9} />
        </mesh>
      ))}
      {/* Palm trees on top */}
      {[[-2, 8, -3], [3, 7.5, 2], [-1, 8.5, 6], [1, 7, -8]].map(([x, y, z], i) => (
        <group key={`palm-${i}`} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.3, 3]} />
            <meshStandardMaterial color="#5a3a10" />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[1.2, 8, 6]} />
            <meshStandardMaterial color="#228822" />
          </mesh>
        </group>
      ))}
      {/* Beach ring around base */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 14, 24]} />
        <meshStandardMaterial color="#d4b896" side={THREE.DoubleSide} />
      </mesh>
      {/* $BIGTROUT sign */}
      <mesh position={[0, 12, 8]}>
        <boxGeometry args={[8, 2, 0.3]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[0, 12, 8.2]}>
        <boxGeometry args={[7.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#44ff88" emissive="#44ff88" emissiveIntensity={0.5} />
      </mesh>
      {/* Beacon light */}
      <pointLight position={[0, 15, 8]} color="#44ff88" intensity={5} distance={60} />
      <pointLight position={[0, 5, 0]} color="#44ff88" intensity={2} distance={30} />
    </group>
  );
};
