import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptivePerf } from './AdaptivePerformance';

export const FishStatue = () => {
  const fishRef = useRef<THREE.Group>(null);
  const perfRef = useAdaptivePerf();
  const frameCount = useRef(0);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    // On low tier, only update rotation every 3rd frame
    frameCount.current++;
    if (perfRef.current.tier >= 2 && frameCount.current % 3 !== 0) return;
    fishRef.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <group position={[0, 0, -90]}>
      {/* Island base — reduced segments */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8, 10, 2, 8]} />
        <meshStandardMaterial color="#5a4a30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[7, 8, 0.3, 8]} />
        <meshStandardMaterial color="#c4a870" roughness={0.95} />
      </mesh>
      {/* Stone pedestal */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[3, 3.5, 3, 6]} />
        <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Fish statue — reduced segments */}
      <group ref={fishRef} position={[0, 7.5, 0]}>
        <mesh scale={[1, 1.2, 2.8]}>
          <sphereGeometry args={[2, 8, 6]} />
          <meshStandardMaterial color="#1a8a4e" metalness={0.65} roughness={0.25} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.3, 5]} scale={[1, 1, 0.8]}>
          <sphereGeometry args={[2.2, 8, 6]} />
          <meshStandardMaterial color="#2a9a5e" metalness={0.6} roughness={0.25} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-2.1, 1.1, 5.9]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[1.8, 1, 5.5]}>
          <sphereGeometry args={[0.6, 6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.1, 1.1, 5.9]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0.5, -6.5]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[6, 0.3, 3]} />
          <meshStandardMaterial color="#0a6a2e" metalness={0.55} roughness={0.3} />
        </mesh>
        {/* Dorsal fin */}
        <mesh position={[0, 2.8, 1]} rotation={[0.15, 0, 0]}>
          <coneGeometry args={[1, 2.5, 3]} />
          <meshStandardMaterial color="#0a5a2a" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* Golden crown */}
        <mesh position={[0, 2.2, 5]}>
          <cylinderGeometry args={[1, 0.8, 0.5, 5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Light removed for performance */}
    </group>
  );
};
