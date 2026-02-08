import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';

interface RaceTrackProps {
  passedCheckpoints?: Set<number>;
}

const CheckpointBuoy = ({ position, index, passed }: { position: [number, number]; index: number; passed: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const buoyRef = useRef<THREE.Mesh>(null);
  const wasPassedRef = useRef(false);
  const blinkStartRef = useRef(0);

  useFrame(() => {
    if (!lightRef.current || !glowRef.current || !buoyRef.current) return;
    
    if (passed && !wasPassedRef.current) {
      // Just passed — start blink timer
      wasPassedRef.current = true;
      blinkStartRef.current = performance.now();
    }

    if (passed) {
      const elapsed = performance.now() - blinkStartRef.current;
      const blinkDuration = 1200; // 3 blinks over 1.2s (400ms each)
      
      if (elapsed < blinkDuration) {
        // Blink 3 times: on/off every 200ms
        const blinkOn = Math.floor(elapsed / 200) % 2 === 0;
        const brightness = blinkOn ? 8 : 0.5;
        lightRef.current.intensity = brightness;
        lightRef.current.color.setHex(0x44ff88);
        lightRef.current.distance = blinkOn ? 35 : 10;
        glowRef.current.scale.setScalar(blinkOn ? 2.2 : 1);
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blinkOn ? 1.5 : 0.1;
        (buoyRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blinkOn ? 1.0 : 0.3;
      } else {
        // After blinking, settle to steady green
        lightRef.current.intensity = 2;
        lightRef.current.color.setHex(0x44ff88);
        lightRef.current.distance = 20;
        glowRef.current.scale.setScalar(1.5);
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
        (buoyRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
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
      {/* Light — only render for start or passed checkpoints to reduce light count */}
      {(isStart || passed) && (
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
  return (
    <group>
      {CHECKPOINTS.map((cp, i) => (
        <CheckpointBuoy key={i} position={cp} index={i} passed={passedCheckpoints.has(i)} />
      ))}
      
      {/* Track lane markers */}
      {CHECKPOINTS.map((cp, i) => {
        const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];
        const segments = 5;
        return Array.from({ length: segments }).map((_, j) => {
          const t = (j + 0.5) / segments;
          const x = cp[0] + (next[0] - cp[0]) * t;
          const z = cp[1] + (next[1] - cp[1]) * t;
          return (
            <mesh key={`lane-${i}-${j}`} position={[x, -0.5, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.5, 8]} />
              <meshStandardMaterial color="#44ff88" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
          );
        });
      })}
      
      {/* Start/Finish line */}
      <mesh position={[0, -0.4, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
