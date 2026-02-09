import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';

interface RaceTrackProps {
  passedCheckpoints?: Set<number>;
}

const CheckpointBuoy = ({ position, index, passed }: { position: [number, number]; index: number; passed: boolean }) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const buoyRef = useRef<THREE.Mesh>(null);
  const wasPassedRef = useRef(false);
  const blinkStartRef = useRef(0);
  const settledRef = useRef(false);

  useFrame(() => {
    if (!glowRef.current || !buoyRef.current) return;
    
    if (passed && !wasPassedRef.current) {
      wasPassedRef.current = true;
      settledRef.current = false;
      blinkStartRef.current = performance.now();
    }

    if (settledRef.current) return;

    if (passed) {
      const elapsed = performance.now() - blinkStartRef.current;
      if (elapsed < 1200) {
        const blinkOn = Math.floor(elapsed / 200) % 2 === 0;
        glowRef.current.scale.setScalar(blinkOn ? 2.2 : 1);
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = blinkOn ? 0.5 : 0.15;
      } else {
        glowRef.current.scale.setScalar(1.5);
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35;
        settledRef.current = true;
      }
    }
  });

  const isStart = index === 0;
  const baseColor = passed ? '#44ff88' : (isStart ? '#44ff88' : '#ff8844');

  return (
    <group position={[position[0], 0, position[1]]}>
      {/* Buoy */}
      <mesh ref={buoyRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1, 6]} />
        <meshBasicMaterial color={passed ? '#44ff88' : baseColor} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 4]} />
        <meshBasicMaterial color={passed ? '#66ffaa' : '#888888'} />
      </mesh>
      {/* Flag */}
      <mesh position={[0.3, 3.2, 0]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial 
          color={passed ? '#44ff88' : (isStart ? '#44ff88' : '#ffaa44')} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Green glow ring when passed */}
      <mesh ref={glowRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 2.5, 8]} />
        <meshBasicMaterial 
          color="#44ff88" 
          transparent 
          opacity={passed ? 0.35 : 0} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Number marker */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshBasicMaterial color={passed ? '#44ff88' : '#ffffff'} />
      </mesh>
    </group>
  );
};

export const RaceTrack = ({ passedCheckpoints = new Set() }: RaceTrackProps) => {

  return (
    <group>
      {CHECKPOINTS.map((cp, i) => (
        <CheckpointBuoy key={i} position={cp} index={i} passed={passedCheckpoints.has(i)} />
      ))}
      
      {/* Lane markers removed for performance */}
      
      {/* Start/Finish line */}
      <mesh position={[0, -0.4, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
