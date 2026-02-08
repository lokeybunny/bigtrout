import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const NetCursor = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { mouse, camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    // Project mouse position into 3D space
    const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = 5;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));
    meshRef.current.position.lerp(pos, 0.15);
    meshRef.current.lookAt(camera.position);
  });

  return (
    <group ref={meshRef}>
      {/* Net ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 8, 20]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} />
      </mesh>
      {/* Net mesh (cone) */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 12, 1, true]} />
        <meshStandardMaterial 
          color="#d4c5a9" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.7, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
    </group>
  );
};
