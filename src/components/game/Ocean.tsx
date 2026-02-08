import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptivePerf } from './AdaptivePerformance';

interface OceanProps {
  tokenMultiplier?: number;
}

export const Ocean = ({ tokenMultiplier = 1 }: OceanProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const { camera } = useThree();
  const frameSkip = useRef(0);
  const perfRef = useAdaptivePerf();
  
  const geometry = useMemo(() => {
    // Reduced from 100x100 (10K verts) to 40x40 (1.6K verts) — 6x fewer
    const geo = new THREE.PlaneGeometry(600, 600, 40, 40);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
    
    // Dynamic frame skipping based on performance tier
    const skip = perfRef.current.oceanFrameSkip;
    frameSkip.current++;
    if (frameSkip.current % skip !== 0) return;
    
    const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
    const time = clock.getElapsedTime();
    
    const intensity = tokenMultiplier >= 1 
      ? 0.6 + (tokenMultiplier - 1) * 0.15
      : 0.6 + (1 - tokenMultiplier) * 0.4;
    
    meshRef.current.position.y = -1.2;
    
    const speed = tokenMultiplier < 1 ? 1.3 : 0.9;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) + camera.position.x;
      const y = positions.getY(i) + camera.position.z;
      positions.setZ(i, 
        Math.sin(x * 0.08 + time * 0.8 * speed) * 0.5 * intensity + 
        Math.cos(y * 0.12 + time * 0.6 * speed) * 0.3 * intensity +
        Math.sin((x + y) * 0.04 + time * 0.4 * speed) * 0.8 * intensity
      );
    }
    positions.needsUpdate = true;
    // Skip computeVertexNormals — very expensive, minimal visual difference on water
    // (meshRef.current.geometry as THREE.PlaneGeometry).computeVertexNormals();

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
