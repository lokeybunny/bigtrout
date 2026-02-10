import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Obstacle } from './Obstacles';
import { resolveCollisions, CircleCollider, registerBoatPosition, unregisterBoat, resolveBoatCollisions } from './Colliders';

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
  obstacles: Obstacle[];
  obstacleColliders: CircleCollider[];
  tokenMultiplier?: number;
}

export const AIBoat = ({ id, color, startOffset, speed, onProgress, obstacles, obstacleColliders, tokenMultiplier = 1 }: AIBoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(startOffset);
  const checkpointRef = useRef(0);
  const lapRef = useRef(0);
  const slowdownRef = useRef(0);
  const deflectRef = useRef<[number, number]>([0, 0]);
  const boatId = `ai-${id}`;

  useEffect(() => {
    return () => unregisterBoat(boatId);
  }, [boatId]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.1);

    if (slowdownRef.current > 0) {
      slowdownRef.current = Math.max(0, slowdownRef.current - safeDelta);
    }

    deflectRef.current[0] *= 0.92;
    deflectRef.current[1] *= 0.92;
    if (Math.abs(deflectRef.current[0]) < 0.01) deflectRef.current[0] = 0;
    if (Math.abs(deflectRef.current[1]) < 0.01) deflectRef.current[1] = 0;

    const speedMult = slowdownRef.current > 0 ? 0.3 : 1;
    const wobble = Math.sin(t * 2 + id * 1.5) * 0.15;
    progressRef.current += safeDelta * (speed + wobble) * 0.12 * speedMult * tokenMultiplier;

    const totalCheckpoints = CHECKPOINTS.length;
    const totalProgress = totalCheckpoints * TOTAL_LAPS;
    if (progressRef.current >= totalProgress) progressRef.current = totalProgress;

    const rawIdx = ((progressRef.current % totalCheckpoints) + totalCheckpoints) % totalCheckpoints;
    const idx = Math.floor(rawIdx);
    const frac = rawIdx - idx;
    const curr = CHECKPOINTS[idx % totalCheckpoints];
    const next = CHECKPOINTS[(idx + 1) % totalCheckpoints];
    if (!curr || !next) return;

    let baseX = curr[0] + (next[0] - curr[0]) * frac + Math.sin(t * 1.5 + id) * 2;
    const baseZ = curr[1] + (next[1] - curr[1]) * frac;

    // Lookahead obstacle avoidance
    const trackDx = next[0] - curr[0];
    const trackDz = next[1] - curr[1];
    const trackLen = Math.sqrt(trackDx * trackDx + trackDz * trackDz) || 1;
    const fwdX = trackDx / trackLen;
    const fwdZ = trackDz / trackLen;
    const perpX = -fwdZ;
    const perpZ = fwdX;

    let avoidOffset = 0;
    for (let i = 0; i < obstacleColliders.length; i++) {
      const col = obstacleColliders[i];
      const toObsX = col.x - baseX;
      const toObsZ = col.z - baseZ;
      const forwardDot = toObsX * fwdX + toObsZ * fwdZ;
      if (forwardDot > 0 && forwardDot < 12) {
        const lateralDot = toObsX * perpX + toObsZ * perpZ;
        const avoidRadius = col.radius + 4;
        if (Math.abs(lateralDot) < avoidRadius) {
          const urgency = 1 - (forwardDot / 12);
          avoidOffset += (lateralDot >= 0 ? -1 : 1) * avoidRadius * urgency * 0.8;
        }
      }
    }
    baseX += avoidOffset;

    let x = baseX + deflectRef.current[0];
    let z = baseZ + deflectRef.current[1];

    const resolved = resolveCollisions(x, z, 1.2, obstacleColliders);
    x = resolved.x;
    z = resolved.z;

    const boatResolved = resolveBoatCollisions(boatId, x, z, 1.5);
    x = boatResolved.x;
    z = boatResolved.z;

    registerBoatPosition(boatId, x, z);

    if (resolved.hit || boatResolved.hit) {
      const pushX = x - (baseX + deflectRef.current[0]);
      const pushZ = z - (baseZ + deflectRef.current[1]);
      deflectRef.current[0] = pushX * 3;
      deflectRef.current[1] = pushZ * 3;
      if (slowdownRef.current <= 0) slowdownRef.current = boatResolved.hit ? 0.3 : 0.8;
      if (boatResolved.hit) progressRef.current += 0.05;
    }

    const heading = Math.atan2(-(next[0] - curr[0]), -(next[1] - curr[1]));
    const bobY = -0.3 + Math.sin(t * 0.8 + id) * 0.15;
    groupRef.current.position.set(x, bobY, z);
    groupRef.current.rotation.y = heading;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + id) * 0.03;

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
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0, -2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.9, 0.25, 0.8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3.5]} />
        <meshBasicMaterial color="#3a2208" />
      </mesh>
      {/* Sail */}
      <mesh position={[0.4, 2.2, 0]}>
        <planeGeometry args={[1, 2.5]} />
        <meshBasicMaterial color="#eeeeee" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      {/* Crew head */}
      <mesh position={[0, 0.95, 0.3]}>
        <sphereGeometry args={[0.12, 4, 4]} />
        <meshBasicMaterial color="#d4a574" />
      </mesh>
    </group>
  );
};
