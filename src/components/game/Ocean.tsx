import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Ocean = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 80, 80);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, 
        Math.sin(x * 0.1 + time * 0.8) * 0.5 + 
        Math.cos(y * 0.15 + time * 0.6) * 0.3 +
        Math.sin((x + y) * 0.05 + time * 0.4) * 0.8
      );
    }
    positions.needsUpdate = true;
    (meshRef.current.geometry as THREE.PlaneGeometry).computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} geometry={geometry}>
      <meshStandardMaterial 
        color="#0a4a3a"
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
};
