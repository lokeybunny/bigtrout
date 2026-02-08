import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const Ocean = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(600, 600, 100, 100);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Follow the camera so the ocean is always under the player
    meshRef.current.position.x = camera.position.x;
    meshRef.current.position.z = camera.position.z;
    
    const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) + camera.position.x;
      const y = positions.getY(i) + camera.position.z;
      positions.setZ(i, 
        Math.sin(x * 0.08 + time * 0.8) * 0.5 + 
        Math.cos(y * 0.12 + time * 0.6) * 0.3 +
        Math.sin((x + y) * 0.04 + time * 0.4) * 0.8
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
