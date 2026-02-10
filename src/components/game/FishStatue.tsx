import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FishStatue = () => {
  const fishRef = useRef<THREE.Group>(null);
  const frameCount = useRef(0);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    fishRef.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <group position={[0, 0, -90]}>
      {/* Island base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8, 10, 2, 6]} />
        <meshBasicMaterial color="#5a4a30" />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[3, 3.5, 3, 6]} />
        <meshBasicMaterial color="#555555" />
      </mesh>

      {/* Fish statue */}
      <group ref={fishRef} position={[0, 7.5, 0]}>
        <mesh scale={[1, 1.2, 2.8]}>
          <sphereGeometry args={[2, 6, 4]} />
          <meshBasicMaterial color="#1a8a4e" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.3, 5]} scale={[1, 1, 0.8]}>
          <sphereGeometry args={[2.2, 6, 4]} />
          <meshBasicMaterial color="#2a9a5e" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 0.5, -6.5]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[6, 0.3, 3]} />
          <meshBasicMaterial color="#0a6a2e" />
        </mesh>
        {/* Crown */}
        <mesh position={[0, 2.2, 5]}>
          <cylinderGeometry args={[1, 0.8, 0.5, 5]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
      </group>
    </group>
  );
};
