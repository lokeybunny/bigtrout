import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Sky = () => {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
  });

  // Batch all stars into a single Points geometry instead of 100 individual meshes
  const starsGeometry = useMemo(() => {
    const positions = new Float32Array(80 * 3); // reduced from 100 to 80
    for (let i = 0; i < 80; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = 20 + Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Pre-compute cloud positions
  const cloudPositions = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => { // reduced from 15 to 8
      const angle = (i / 8) * Math.PI * 2;
      const r = 50 + Math.random() * 30;
      return {
        position: [Math.cos(angle) * r, 15 + Math.random() * 10, Math.sin(angle) * r] as [number, number, number],
        size: 3 + Math.random() * 4,
      };
    });
  }, []);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[400, 16, 8]} />
        <meshBasicMaterial color="#050a14" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Moon */}
      <mesh position={[30, 40, -60]}>
        <sphereGeometry args={[5, 12, 12]} />
        <meshBasicMaterial color="#ffffee" />
      </mesh>
      {/* Single directional light for moon (removed extra pointLight) */}
      <directionalLight position={[30, 40, -60]} intensity={1.8} color="#ccddef" />

      {/* Clouds — reduced count */}
      <group ref={cloudsRef}>
        {cloudPositions.map((cloud, i) => (
          <mesh key={i} position={cloud.position}>
            <sphereGeometry args={[cloud.size, 6, 4]} />
            <meshBasicMaterial color="#1a2a3a" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Stars — single draw call via Points */}
      <points geometry={starsGeometry}>
        <pointsMaterial color="#ffffff" size={0.4} sizeAttenuation />
      </points>
    </>
  );
};
