import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OceanProps {
  tokenMultiplier?: number;
}

export const Ocean = ({ tokenMultiplier = 1 }: OceanProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const { camera } = useThree();
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(600, 600, 100, 100);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
    
    const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
    const time = clock.getElapsedTime();
    
    // Wave intensity varies but keep it subtle to avoid submerging the boat
    const intensity = tokenMultiplier >= 1 
      ? 0.6 + (tokenMultiplier - 1) * 0.15
      : 0.6 + (1 - tokenMultiplier) * 0.4;
    
    // Keep water level fixed so the boat never sinks below the surface
    meshRef.current.position.y = -1.2;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) + camera.position.x;
      const y = positions.getY(i) + camera.position.z;
      const speed = tokenMultiplier < 1 ? 1.3 : 0.9;
      positions.setZ(i, 
        Math.sin(x * 0.08 + time * 0.8 * speed) * 0.5 * intensity + 
        Math.cos(y * 0.12 + time * 0.6 * speed) * 0.3 * intensity +
        Math.sin((x + y) * 0.04 + time * 0.4 * speed) * 0.8 * intensity
      );
    }
    positions.needsUpdate = true;
    (meshRef.current.geometry as THREE.PlaneGeometry).computeVertexNormals();

    // Color shifts: green when pumping, darker when dumping
    if (matRef.current) {
      const r = tokenMultiplier < 1 ? 0.06 : 0.04;
      const g = tokenMultiplier >= 1 ? 0.29 + (tokenMultiplier - 1) * 0.1 : 0.22;
      const b = tokenMultiplier < 1 ? 0.18 : 0.23;
      matRef.current.color.setRGB(r, g, b);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} geometry={geometry}>
      <meshStandardMaterial 
        ref={matRef}
        color="#0a4a3a"
        transparent
        opacity={0.85}
        side={THREE.FrontSide}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
};
