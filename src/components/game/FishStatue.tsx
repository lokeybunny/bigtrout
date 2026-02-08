import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FishStatue = () => {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(clock.getElapsedTime() * 1.5) * 1;
    }
  });

  return (
    <group position={[0, 0, -90]}>
      {/* Island base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8, 10, 2, 16]} />
        <meshStandardMaterial color="#5a4a30" roughness={0.9} />
      </mesh>
      {/* Sandy top */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[7, 8, 0.3, 16]} />
        <meshStandardMaterial color="#c4a870" roughness={0.95} />
      </mesh>
      {/* Stone pedestal */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[3, 3.5, 3, 8]} />
        <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Pedestal top rim */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[3.3, 3, 0.3, 8]} />
        <meshStandardMaterial color="#666666" roughness={0.7} />
      </mesh>

      {/* ===== GIANT FISH STATUE ===== */}
      <group position={[0, 3.8, 0]}>
        {/* Body — large upright fish */}
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[3, 12, 10]} />
          <meshStandardMaterial color="#1a7a4a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 6.5, 0]}>
          <sphereGeometry args={[2.5, 12, 10]} />
          <meshStandardMaterial color="#1a8a4e" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[2.5, 10, 8]} />
          <meshStandardMaterial color="#1a6a3a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 8.5, 0.5]}>
          <sphereGeometry args={[2, 10, 8]} />
          <meshStandardMaterial color="#2a9a5e" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Eyes — left */}
        <mesh position={[-1.3, 9, 1.3]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} />
        </mesh>
        <mesh position={[-1.4, 9.1, 1.7]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Eyes — right */}
        <mesh position={[1.3, 9, 1.3]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} />
        </mesh>
        <mesh position={[1.4, 9.1, 1.7]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        {/* Mouth — open grin */}
        <mesh position={[0, 7.8, 1.8]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.5]} />
          <meshStandardMaterial color="#cc3333" metalness={0.4} roughness={0.4} />
        </mesh>

        {/* Dorsal fin — tall */}
        <mesh position={[0, 11, -0.5]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[1.2, 3, 4]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Tail fin — wide V at bottom */}
        <mesh position={[-1.5, -0.5, -1]} rotation={[0.3, 0.3, -0.5]}>
          <boxGeometry args={[2.5, 0.4, 1.5]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[1.5, -0.5, -1]} rotation={[0.3, -0.3, 0.5]}>
          <boxGeometry args={[2.5, 0.4, 1.5]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Side fins */}
        <mesh position={[-2.8, 4, 0]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.8, 2, 4]} />
          <meshStandardMaterial color="#1a7a3e" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[2.8, 4, 0]} rotation={[0, 0, 0.6]}>
          <coneGeometry args={[0.8, 2, 4]} />
          <meshStandardMaterial color="#1a7a3e" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Crown — golden, because this fish is king */}
        <mesh position={[0, 10.8, 0.5]}>
          <cylinderGeometry args={[1.2, 1, 0.6, 5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.3} />
        </mesh>
        {/* Crown spikes */}
        {[0, 1.26, 2.51, 3.77, 5.03].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 1.1, 11.3, Math.sin(angle) * 1.1 + 0.5]}>
            <coneGeometry args={[0.2, 0.6, 4]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Glowing base ring */}
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 7.5, 24]} />
        <meshStandardMaterial color="#44ff88" emissive="#44ff88" emissiveIntensity={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Lights */}
      <pointLight ref={glowRef} position={[0, 16, 0]} color="#44ff88" intensity={3} distance={50} />
      <pointLight position={[0, 6, 3]} color="#ffd700" intensity={2} distance={25} />
    </group>
  );
};
