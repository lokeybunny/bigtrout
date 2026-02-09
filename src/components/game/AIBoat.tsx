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
}

export const AIBoat = ({ id, color, startOffset, speed, onProgress, obstacles, obstacleColliders }: AIBoatProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(startOffset); // 0..CHECKPOINTS.length * TOTAL_LAPS
  const checkpointRef = useRef(0);
  const lapRef = useRef(0);
  const slowdownRef = useRef(0); // remaining slowdown time in seconds
  const deflectRef = useRef<[number, number]>([0, 0]); // lateral push from obstacle
  const boatId = `ai-${id}`;

  // Unregister on unmount
  useEffect(() => {
    return () => unregisterBoat(boatId);
  }, [boatId]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Decay slowdown timer
    if (slowdownRef.current > 0) {
      slowdownRef.current = Math.max(0, slowdownRef.current - delta);
    }

    // Decay deflection smoothly — faster decay prevents oscillation
    deflectRef.current[0] *= 0.92;
    deflectRef.current[1] *= 0.92;
    // Zero out tiny values to prevent drift
    if (Math.abs(deflectRef.current[0]) < 0.01) deflectRef.current[0] = 0;
    if (Math.abs(deflectRef.current[1]) < 0.01) deflectRef.current[1] = 0;

    // Apply slowdown from obstacle hits (same penalty as player: 0.3x speed for ~1.5s)
    const speedMult = slowdownRef.current > 0 ? 0.3 : 1;

    // Advance along track
    const wobble = Math.sin(t * 2 + id * 1.5) * 0.15;
    progressRef.current += delta * (speed + wobble) * 0.12 * speedMult;

    const totalCheckpoints = CHECKPOINTS.length;
    const totalProgress = totalCheckpoints * TOTAL_LAPS;

    if (progressRef.current >= totalProgress) {
      progressRef.current = totalProgress;
    }

    // Current position on track
    const rawIdx = ((progressRef.current % totalCheckpoints) + totalCheckpoints) % totalCheckpoints;
    const idx = Math.floor(rawIdx);
    const frac = rawIdx - idx;
    const curr = CHECKPOINTS[idx % totalCheckpoints];
    const next = CHECKPOINTS[(idx + 1) % totalCheckpoints];
    if (!curr || !next) return;

    let baseX = curr[0] + (next[0] - curr[0]) * frac + Math.sin(t * 1.5 + id) * 2;
    const baseZ = curr[1] + (next[1] - curr[1]) * frac;

    // --- Lookahead obstacle avoidance ---
    // Check if any obstacle is ahead and steer laterally to avoid it
    const lookDist = 12; // how far ahead to scan
    const trackDx = next[0] - curr[0];
    const trackDz = next[1] - curr[1];
    const trackLen = Math.sqrt(trackDx * trackDx + trackDz * trackDz) || 1;
    const fwdX = trackDx / trackLen;
    const fwdZ = trackDz / trackLen;
    // Perpendicular (left)
    const perpX = -fwdZ;
    const perpZ = fwdX;

    let avoidOffset = 0;
    for (let i = 0; i < obstacleColliders.length; i++) {
      const col = obstacleColliders[i];
      // Vector from boat to obstacle
      const toObsX = col.x - baseX;
      const toObsZ = col.z - baseZ;
      // Project onto forward direction
      const forwardDot = toObsX * fwdX + toObsZ * fwdZ;
      // Only avoid obstacles ahead of us within lookahead range
      if (forwardDot > 0 && forwardDot < lookDist) {
        // Lateral distance from our path to obstacle center
        const lateralDot = toObsX * perpX + toObsZ * perpZ;
        const avoidRadius = col.radius + 4; // boat width + margin
        if (Math.abs(lateralDot) < avoidRadius) {
          // Steer away: if obstacle is to our left (negative lateral), steer right, and vice versa
          const urgency = 1 - (forwardDot / lookDist); // closer = more urgent
          const steerDir = lateralDot >= 0 ? -1 : 1;
          avoidOffset += steerDir * avoidRadius * urgency * 0.8;
        }
      }
    }

    baseX += avoidOffset;

    // Apply deflection offset from obstacle collisions
    let x = baseX + deflectRef.current[0];
    let z = baseZ + deflectRef.current[1];

    // Resolve solid collisions against world objects + obstacles — always active
    const resolved = resolveCollisions(x, z, 1.2, obstacleColliders);
    x = resolved.x;
    z = resolved.z;

    // Resolve boat-to-boat collisions (bounce off other boats)
    const boatResolved = resolveBoatCollisions(boatId, x, z, 1.5);
    x = boatResolved.x;
    z = boatResolved.z;

    // Register position for other boats to collide against
    registerBoatPosition(boatId, x, z);

    if (resolved.hit || boatResolved.hit) {
      // Set deflection directly (not accumulate) to prevent oscillation
      const pushX = x - (baseX + deflectRef.current[0]);
      const pushZ = z - (baseZ + deflectRef.current[1]);
      // Set a strong one-time lateral push in the collision normal direction
      deflectRef.current[0] = pushX * 3;
      deflectRef.current[1] = pushZ * 3;
      // Brief slowdown
      if (slowdownRef.current <= 0) {
        slowdownRef.current = boatResolved.hit ? 0.3 : 0.8;
      }
      // Skip forward slightly to avoid re-entering the same collision zone
      if (boatResolved.hit) {
        progressRef.current += 0.05;
      }
    }

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
