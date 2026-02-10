import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';

export interface Obstacle {
  id: string;
  position: [number, number, number];
  type: 'rock' | 'wave';
  radius: number;
}

export const generateObstacles = (): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  let id = 0;

  for (let i = 0; i < CHECKPOINTS.length; i++) {
    const curr = CHECKPOINTS[i];
    const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];

    const rockT = 0.3 + Math.random() * 0.4;
    const rx = curr[0] + (next[0] - curr[0]) * rockT + (Math.random() - 0.5) * 14;
    const rz = curr[1] + (next[1] - curr[1]) * rockT + (Math.random() - 0.5) * 8;
    obstacles.push({ id: `obs-${id++}`, position: [rx, 0, rz], type: 'rock', radius: 1.8 });

    const waveT = 0.5 + Math.random() * 0.3;
    const wx = curr[0] + (next[0] - curr[0]) * waveT + (Math.random() - 0.5) * 16;
    const wz = curr[1] + (next[1] - curr[1]) * waveT + (Math.random() - 0.5) * 8;
    obstacles.push({ id: `obs-${id++}`, position: [wx, 0, wz], type: 'wave', radius: 2.2 });
  }

  return obstacles;
};

interface ObstacleProps {
  obstacle: Obstacle;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  onHit: (type: 'rock' | 'wave') => void;
}

const RockObstacle = ({ obstacle, playerPos, onHit }: ObstacleProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cooldownRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    if (cooldownRef.current > 0) {
      cooldownRef.current = Math.max(0, cooldownRef.current - 1 / 60);
      return;
    }
    const dx = playerPos.current.x - obstacle.position[0];
    const dz = playerPos.current.z - obstacle.position[2];
    const distSq = dx * dx + dz * dz;
    if (distSq < obstacle.radius * obstacle.radius) {
      cooldownRef.current = 2;
      onHit('rock');
    }
  });

  const seed = parseInt(obstacle.id.replace('obs-', ''), 10);

  return (
    <group ref={groupRef} position={[obstacle.position[0], obstacle.position[1], obstacle.position[2]]}>
      {/* Rocks — meshBasicMaterial (no lighting, saves GPU) */}
      <mesh position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color="#5a5a5a" />
      </mesh>
      <mesh position={[1, 0.2, 0.5]} rotation={[0, seed * 0.7, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#6a6a6a" />
      </mesh>
    </group>
  );
};

const WaveObstacle = ({ obstacle, playerPos, onHit }: ObstacleProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const cooldownRef = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.3;
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.15;

    if (cooldownRef.current > 0) {
      cooldownRef.current = Math.max(0, cooldownRef.current - 1 / 60);
      return;
    }
    const dx = playerPos.current.x - obstacle.position[0];
    const dz = playerPos.current.z - obstacle.position[2];
    const distSq = dx * dx + dz * dz;
    if (distSq < obstacle.radius * obstacle.radius) {
      cooldownRef.current = 2;
      onHit('wave');
    }
  });

  return (
    <group ref={groupRef} position={[obstacle.position[0], obstacle.position[1], obstacle.position[2]]}>
      {/* Wave — meshBasicMaterial with transparency */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[1.5, 0.4, 4, 8, Math.PI]} />
        <meshBasicMaterial color="#1a5577" transparent opacity={0.7} />
      </mesh>
      {/* Foam */}
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.8, 8]} />
        <meshBasicMaterial color="#ccddee" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

interface ObstaclesProps {
  obstacles: Obstacle[];
  playerPos: React.MutableRefObject<THREE.Vector3>;
  onHit: (type: 'rock' | 'wave') => void;
}

export const Obstacles = ({ obstacles, playerPos, onHit }: ObstaclesProps) => {
  return (
    <>
      {obstacles.map(obs =>
        obs.type === 'rock' ? (
          <RockObstacle key={obs.id} obstacle={obs} playerPos={playerPos} onHit={onHit} />
        ) : (
          <WaveObstacle key={obs.id} obstacle={obs} playerPos={playerPos} onHit={onHit} />
        )
      )}
    </>
  );
};
