import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Race track checkpoint positions (oval circuit)
export const CHECKPOINTS: [number, number][] = [
  [0, -20],
  [30, -50],
  [40, -90],
  [30, -130],
  [0, -160],
  [-30, -130],
  [-40, -90],
  [-30, -50],
];

export const TOTAL_LAPS = 10;

interface AIBoatProps {
  id: number;
  color: string;
  startOffset: number;
  speed: number;
  onProgress: (id: number, checkpoint: number, lap: number) => void;
}

export const AIBoat = ({ id, color, startOffset, speed, onProgress }: AIBoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(startOffset); // 0..CHECKPOINTS.length * TOTAL_LAPS
  const checkpointRef = useRef(0);
  const lapRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Advance along track
    const wobble = Math.sin(t * 2 + id * 1.5) * 0.15;
    progressRef.current += delta * (speed + wobble) * 0.12;

    const totalCheckpoints = CHECKPOINTS.length;
    const totalProgress = totalCheckpoints * TOTAL_LAPS;

    if (progressRef.current >= totalProgress) {
      progressRef.current = totalProgress;
    }

    // Current position on track
    const rawIdx = progressRef.current % totalCheckpoints;
    const idx = Math.floor(rawIdx);
    const frac = rawIdx - idx;
    const curr = CHECKPOINTS[idx % totalCheckpoints];
    const next = CHECKPOINTS[(idx + 1) % totalCheckpoints];

    const x = curr[0] + (next[0] - curr[0]) * frac + Math.sin(t * 1.5 + id) * 2;
    const z = curr[1] + (next[1] - curr[1]) * frac;

    // Heading
    const dx = next[0] - curr[0];
    const dz = next[1] - curr[1];
    const heading = Math.atan2(-dx, -dz);

    const bobY = -0.3 + Math.sin(t * 0.8 + id) * 0.15;
    groupRef.current.position.set(x, bobY, z);
    groupRef.current.rotation.y = heading;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + id) * 0.03;

    // Track checkpoint/lap progress
    const currentCheckpoint = Math.floor(progressRef.current) % totalCheckpoints;
    const currentLap = Math.floor(progressRef.current / totalCheckpoints);
    if (currentCheckpoint !== checkpointRef.current || currentLap !== lapRef.current) {
      checkpointRef.current = currentCheckpoint;
      lapRef.current = currentLap;
      onProgress(id, Math.floor(progressRef.current), currentLap);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.3, 3.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0, -2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.9, 0.25, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Sides */}
      <mesh position={[-0.7, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.25, 3.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.7, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.25, 3.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3.5]} />
        <meshStandardMaterial color="#3a2208" />
      </mesh>
      {/* Sail */}
      <mesh position={[0.4, 2.2, 0]}>
        <planeGeometry args={[1, 2.5]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      {/* Number plate */}
      <mesh position={[0, 0.5, 1.5]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Crew (simple figure) */}
      <mesh position={[0, 0.6, 0.3]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      <mesh position={[0, 0.95, 0.3]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
    </group>
  );
};
