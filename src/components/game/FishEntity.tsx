import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FishEntityProps {
  id: string;
  kind: 'trout' | 'goldfish' | 'octopus';
  position: [number, number, number];
  onCatch: (id: string, kind: string) => void;
  onMiss: (id: string, kind: string) => void;
}

const FISH_COLORS = {
  trout: '#2d8a4e',
  goldfish: '#ffaa00',
  octopus: '#8b1a4a',
};

const FISH_SIZES = {
  trout: 1.2,
  goldfish: 0.6,
  octopus: 1.5,
};

export const FishEntity = ({ id, kind, position, onCatch, onMiss }: FishEntityProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [phase, setPhase] = useState<'rising' | 'airborne' | 'falling' | 'gone'>('rising');
  const timeRef = useRef(0);
  const startY = -2;
  const peakY = 2 + Math.random() * 2;
  const jumpDuration = kind === 'octopus' ? 4 : 3;
  const size = FISH_SIZES[kind];

  useFrame((_, delta) => {
    if (!groupRef.current || phase === 'gone') return;
    timeRef.current += delta;
    
    const t = timeRef.current / jumpDuration;
    
    if (t >= 1) {
      setPhase('gone');
      onMiss(id, kind);
      return;
    }

    // Parabolic arc
    const y = startY + (peakY - startY) * (4 * t * (1 - t));
    groupRef.current.position.y = y;
    
    // Wobble
    groupRef.current.rotation.z = Math.sin(timeRef.current * 8) * 0.3;
    groupRef.current.rotation.x = Math.sin(timeRef.current * 5) * 0.2;
    
    // Slight horizontal drift
    groupRef.current.position.x = position[0] + Math.sin(timeRef.current * 2) * 0.5;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (phase !== 'gone') {
      setPhase('gone');
      onCatch(id, kind);
    }
  };

  if (phase === 'gone') return null;

  return (
    <group ref={groupRef} position={[position[0], startY, position[2]]}>
      {kind === 'octopus' ? (
        // Octopus
        <group onClick={handleClick}>
          {/* Head */}
          <mesh>
            <sphereGeometry args={[size * 0.5, 12, 12]} />
            <meshStandardMaterial color={FISH_COLORS.octopus} roughness={0.5} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.2, 0.2, 0.35]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.2, 0.2, 0.35]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
          </mesh>
          {/* Tentacles */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 3) * 0.3,
              -0.5,
              Math.sin(i * Math.PI / 3) * 0.3
            ]} rotation={[0.5, i * Math.PI / 3, 0]}>
              <cylinderGeometry args={[0.06, 0.02, 0.8, 6]} />
              <meshStandardMaterial color="#6a1040" />
            </mesh>
          ))}
          {/* Evil aura */}
          <pointLight color="#ff0044" intensity={2} distance={4} />
        </group>
      ) : (
        // Fish (trout or goldfish)
        <group onClick={handleClick}>
          {/* Body */}
          <mesh>
            <sphereGeometry args={[size * 0.4, 10, 8]} />
            <meshStandardMaterial 
              color={FISH_COLORS[kind]} 
              roughness={0.3}
              metalness={kind === 'goldfish' ? 0.6 : 0.2}
            />
          </mesh>
          {/* Tail */}
          <mesh position={[0, 0, -size * 0.5]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[size * 0.25, size * 0.3, 4]} />
            <meshStandardMaterial color={FISH_COLORS[kind]} />
          </mesh>
          {/* Eye */}
          <mesh position={[size * 0.15, 0.08, size * 0.25]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Dorsal fin */}
          <mesh position={[0, size * 0.3, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[size * 0.15, size * 0.25, 3]} />
            <meshStandardMaterial color={FISH_COLORS[kind]} transparent opacity={0.7} />
          </mesh>
          {/* Sparkle for goldfish */}
          {kind === 'goldfish' && (
            <pointLight color="#ffcc00" intensity={1.5} distance={3} />
          )}
          {kind === 'trout' && (
            <pointLight color="#44ff88" intensity={1} distance={3} />
          )}
        </group>
      )}
    </group>
  );
};
