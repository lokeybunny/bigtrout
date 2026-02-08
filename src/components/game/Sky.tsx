import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Sky = () => {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
  });

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[100, 32, 16]} />
        <meshBasicMaterial 
          color="#1a2a4a" 
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Horizon glow */}
      <mesh position={[0, -5, -80]}>
        <planeGeometry args={[200, 40]} />
        <meshBasicMaterial 
          color="#2a4060" 
          transparent 
          opacity={0.5}
        />
      </mesh>

      {/* Moon */}
      <mesh position={[30, 40, -60]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial color="#eeeedd" />
      </mesh>
      <pointLight position={[30, 40, -60]} color="#aabbcc" intensity={0.5} />

      {/* Clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 15 }).map((_, i) => {
          const angle = (i / 15) * Math.PI * 2;
          const r = 50 + Math.random() * 30;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, 15 + Math.random() * 10, Math.sin(angle) * r]}>
              <sphereGeometry args={[3 + Math.random() * 4, 8, 6]} />
              <meshBasicMaterial color="#1a2a3a" transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh key={`star-${i}`} position={[
          (Math.random() - 0.5) * 180,
          20 + Math.random() * 60,
          (Math.random() - 0.5) * 180,
        ]}>
          <sphereGeometry args={[0.05 + Math.random() * 0.1, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </>
  );
};
