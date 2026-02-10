import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OceanProps {
  tokenMultiplier?: number;
}

export const Ocean = ({ tokenMultiplier = 1 }: OceanProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const frameSkip = useRef(0);
  
  // Fixed geometry — minimal segments
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(600, 600, 16, 16);
  }, []);

  // Use a single color that we can update without material uniforms
  const color = useMemo(() => new THREE.Color('#0a4a3a'), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Guard invalid camera
    if (!Number.isFinite(camera.position.x) || !Number.isFinite(camera.position.z)) return;
    
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
    
    // Skip frames for perf
    frameSkip.current++;
    if (frameSkip.current % 3 !== 0) return;
    
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
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} geometry={geometry}>
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={0.85}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};
