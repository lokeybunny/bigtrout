import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FishStatue = () => {
  const glowRef = useRef<THREE.PointLight>(null);
  const fishRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(clock.getElapsedTime() * 1.5) * 1;
    }
    // Slow majestic rotation
    if (fishRef.current) {
      fishRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group position={[0, 0, -90]}>
      {/* Island base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8, 10, 2, 16]} />
        <meshStandardMaterial color="#5a4a30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[7, 8, 0.3, 16]} />
        <meshStandardMaterial color="#c4a870" roughness={0.95} />
      </mesh>
      {/* Stone pedestal */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[3, 3.5, 3, 8]} />
        <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[3.3, 3, 0.3, 8]} />
        <meshStandardMaterial color="#666666" roughness={0.7} />
      </mesh>

      {/* ===== FISH STATUE — horizontal, proper fish shape ===== */}
      <group ref={fishRef} position={[0, 7.5, 0]}>
        {/* Main body — elongated ellipsoid (scaled sphere) */}
        <mesh scale={[1, 1.2, 2.8]}>
          <sphereGeometry args={[2, 14, 10]} />
          <meshStandardMaterial color="#1a8a4e" metalness={0.65} roughness={0.25} />
        </mesh>

        {/* Belly — lighter underside */}
        <mesh position={[0, -0.6, 0]} scale={[0.85, 0.7, 2.6]}>
          <sphereGeometry args={[2, 12, 8]} />
          <meshStandardMaterial color="#5ecf8a" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Head — front bulge */}
        <mesh position={[0, 0.3, 5]} scale={[1, 1, 0.8]}>
          <sphereGeometry args={[2.2, 12, 10]} />
          <meshStandardMaterial color="#2a9a5e" metalness={0.6} roughness={0.25} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.2, 7]} scale={[0.7, 0.6, 0.6]}>
          <sphereGeometry args={[1.5, 10, 8]} />
          <meshStandardMaterial color="#2aaa60" metalness={0.55} roughness={0.3} />
        </mesh>

        {/* Mouth — open */}
        <mesh position={[0, -0.8, 7.5]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[1.4, 0.25, 0.8]} />
          <meshStandardMaterial color="#cc3333" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Lower jaw */}
        <mesh position={[0, -1.2, 7.2]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#1a6a3a" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Left eye */}
        <mesh position={[-1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.2} />
        </mesh>
        <mesh position={[-2.1, 1.1, 5.9]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Right eye */}
        <mesh position={[1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.2} />
        </mesh>
        <mesh position={[2.1, 1.1, 5.9]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        {/* Tail fin — forked V */}
        <mesh position={[-1.2, 0.5, -6.5]} rotation={[0, 0.4, -0.3]}>
          <boxGeometry args={[2.5, 0.3, 2]} />
          <meshStandardMaterial color="#0a6a2e" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[1.2, 0.5, -6.5]} rotation={[0, -0.4, 0.3]}>
          <boxGeometry args={[2.5, 0.3, 2]} />
          <meshStandardMaterial color="#0a6a2e" metalness={0.55} roughness={0.3} />
        </mesh>
        {/* Upper tail lobe */}
        <mesh position={[0, 2, -6.5]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[1.8, 0.3, 2]} />
          <meshStandardMaterial color="#0a6a2e" metalness={0.55} roughness={0.3} />
        </mesh>
        {/* Lower tail lobe */}
        <mesh position={[0, -1, -6.5]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[1.8, 0.3, 2]} />
          <meshStandardMaterial color="#0a6a2e" metalness={0.55} roughness={0.3} />
        </mesh>

        {/* Dorsal fin — top, along the back */}
        <mesh position={[0, 2.8, 1]} rotation={[0.15, 0, 0]}>
          <coneGeometry args={[1, 2.5, 4]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 2.5, -1.5]} rotation={[0.15, 0, 0]}>
          <coneGeometry args={[0.7, 1.8, 4]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.55} roughness={0.35} />
        </mesh>

        {/* Pectoral fins — sides */}
        <mesh position={[-2.2, -0.5, 3]} rotation={[0, 0.3, -0.7]}>
          <coneGeometry args={[0.6, 2.5, 4]} />
          <meshStandardMaterial color="#1a7a3e" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[2.2, -0.5, 3]} rotation={[0, -0.3, 0.7]}>
          <coneGeometry args={[0.6, 2.5, 4]} />
          <meshStandardMaterial color="#1a7a3e" metalness={0.5} roughness={0.35} />
        </mesh>

        {/* Anal fin — bottom rear */}
        <mesh position={[0, -2, -3]} rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[0.5, 1.5, 4]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.55} roughness={0.35} />
        </mesh>

        {/* Spots / scales */}
        {[
          [0.8, 1, 2], [-1, 0.5, 0], [0.5, 0.8, -2], [-0.7, 1.2, 3],
          [1.2, 0, -1], [-1.3, -0.3, 1], [0, 1.5, -3], [1, -0.5, 4],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#0a4a1e" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}

        {/* Golden crown on head */}
        <mesh position={[0, 2.2, 5]}>
          <cylinderGeometry args={[1, 0.8, 0.5, 5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.3} />
        </mesh>
        {[0, 1.26, 2.51, 3.77, 5.03].map((angle, i) => (
          <mesh key={`spike-${i}`} position={[Math.cos(angle) * 0.9, 2.7, Math.sin(angle) * 0.9 + 5]}>
            <coneGeometry args={[0.15, 0.5, 4]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Glowing base ring */}
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 7.5, 24]} />
        <meshStandardMaterial color="#44ff88" emissive="#44ff88" emissiveIntensity={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Single light instead of two */}
      <pointLight ref={glowRef} position={[0, 12, 2]} color="#44ff88" intensity={4} distance={40} />
    </group>
  );
};
