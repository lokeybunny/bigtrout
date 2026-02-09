import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';
import { useAdaptivePerf } from './AdaptivePerformance';

interface RaceTrackProps {
  passedCheckpoints?: Set<number>;
}

const CheckpointBuoy = ({ position, index, passed }: { position: [number, number]; index: number; passed: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const buoyRef = useRef<THREE.Mesh>(null);
  const wasPassedRef = useRef(false);
  const blinkStartRef = useRef(0);
  const perfRef = useAdaptivePerf();
  const perfAllowLights = perfRef.current.enableCheckpointLights;

  const settledRef = useRef(false);

  useFrame(() => {
    if (!lightRef.current || !glowRef.current || !buoyRef.current) return;
    
    if (passed && !wasPassedRef.current) {
      wasPassedRef.current = true;
      settledRef.current = false;
      blinkStartRef.current = performance.now();
    }

    // Once settled after blinking, stop running per-frame logic
    if (settledRef.current) return;

    if (passed) {
      const elapsed = performance.now() - blinkStartRef.current;
      const blinkDuration = 1200;
      
      if (elapsed < blinkDuration) {
        const blinkOn = Math.floor(elapsed / 200) % 2 === 0;
        const brightness = blinkOn ? 8 : 0.5;
        lightRef.current.intensity = brightness;
        lightRef.current.color.setHex(0x44ff88);
        lightRef.current.distance = blinkOn ? 35 : 10;
        glowRef.current.scale.setScalar(blinkOn ? 2.2 : 1);
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blinkOn ? 1.5 : 0.1;
        (buoyRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blinkOn ? 1.0 : 0.3;
      } else {
        // Settle and stop future per-frame work
        lightRef.current.intensity = 2;
        lightRef.current.color.setHex(0x44ff88);
        lightRef.current.distance = 20;
        glowRef.current.scale.setScalar(1.5);
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
        (buoyRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
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
        <cylinderGeometry args={[0.5, 0.6, 1, 8]} />
        <meshStandardMaterial 
          color={passed ? '#44ff88' : baseColor} 
          emissive={passed ? '#44ff88' : baseColor} 
          emissiveIntensity={passed ? 0.6 : 0.3} 
        />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color={passed ? '#66ffaa' : '#888888'} />
      </mesh>
      {/* Flag */}
      <mesh position={[0.3, 3.2, 0]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial 
          color={passed ? '#44ff88' : (isStart ? '#44ff88' : '#ffaa44')} 
          side={THREE.DoubleSide}
          emissive={passed ? '#44ff88' : (isStart ? '#44ff88' : '#ffaa44')}
          emissiveIntensity={passed ? 0.5 : 0.2}
        />
      </mesh>
      {/* Light — only render for start or passed checkpoints, and only if perf allows */}
      {(isStart || passed) && perfAllowLights && (
        <pointLight 
          ref={lightRef}
          position={[0, 1.5, 0]} 
          color="#44ff88" 
          intensity={passed ? 3 : 1} 
          distance={passed ? 25 : 15} 
        />
      )}
      {/* Green glow ring when passed */}
      <mesh ref={glowRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 2.5, 16]} />
        <meshStandardMaterial 
          color="#44ff88" 
          emissive="#44ff88" 
          emissiveIntensity={passed ? 0.8 : 0} 
          transparent 
          opacity={passed ? 0.35 : 0} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Number marker */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial 
          color={passed ? '#44ff88' : '#ffffff'} 
          emissive={passed ? '#44ff88' : '#ffffff'} 
          emissiveIntensity={passed ? 0.5 : 0.2} 
        />
      </mesh>
    </group>
  );
};

export const RaceTrack = ({ passedCheckpoints = new Set() }: RaceTrackProps) => {
  const perfRef = useAdaptivePerf();

  return (
    <group>
      {CHECKPOINTS.map((cp, i) => (
        <CheckpointBuoy key={i} position={cp} index={i} passed={passedCheckpoints.has(i)} />
      ))}
      
      {/* Lane markers removed for performance */}
      
      {/* Start/Finish line */}
      <mesh position={[0, -0.4, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
