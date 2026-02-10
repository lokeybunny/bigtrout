import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptivePerf } from './AdaptivePerformance';

const MOON_POS: [number, number, number] = [30, 40, -60];
const SKY_RADIUS = 250;

export const Sky = () => {
  const perfRef = useAdaptivePerf();
  const tier = perfRef.current.tier;
  const starMult = perfRef.current.starMultiplier;

  // Star count scales with performance tier
  const starCount = Math.floor(200 * starMult);

  const starsGeometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2);
      const r = SKY_RADIUS + Math.random() * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.4 + Math.random() * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [starCount]);

  // Sky dome segments: fewer on low tier
  const skySegs: [number, number] = tier >= 2 ? [6, 4] : [8, 6];
  // Moon segments
  const moonSegs = tier >= 2 ? 6 : 8;
  // Shooting stars: none on low, 1 on medium, 3 on high
  const shootingStarCount = tier >= 1 ? 0 : 1;

  const shootingStars = useMemo(() => {
    return Array.from({ length: shootingStarCount }, (_, i) => ({
      id: i,
      startTheta: Math.random() * Math.PI * 2,
      startPhi: 0.3 + Math.random() * 0.5,
      speed: 40 + Math.random() * 30,
      delay: Math.random() * 20,
      duration: 1.5 + Math.random() * 1.5,
    }));
  }, [shootingStarCount]);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[SKY_RADIUS + 50, skySegs[0], skySegs[1]]} />
        <meshBasicMaterial color="#050a14" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Moon */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[5, 6, 6]} />
        <meshBasicMaterial color="#fffff8" fog={false} />
      </mesh>

      {/* Moon glow — skip on low tier */}
      {tier < 2 && (
        <mesh position={MOON_POS}>
          <sphereGeometry args={[10, 6, 6]} />
          <meshBasicMaterial color="#ccddff" transparent opacity={0.15} fog={false} side={THREE.FrontSide} depthWrite={false} />
        </mesh>
      )}

      {/* Moon light */}
      <directionalLight position={MOON_POS} intensity={2.2} color="#ddeeff" />

      {/* Stars */}
      <points geometry={starsGeometry}>
        <pointsMaterial color="#ffffff" size={tier >= 2 ? 1.0 : 0.8} sizeAttenuation fog={false} />
      </points>

      {/* Shooting stars */}
      {shootingStars.map(star => (
        <ShootingStar key={star.id} {...star} />
      ))}
    </>
  );
};

interface ShootingStarProps {
  startTheta: number;
  startPhi: number;
  speed: number;
  delay: number;
  duration: number;
}

const ShootingStar = ({ startTheta, startPhi, speed, delay, duration }: ShootingStarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cycleLength = delay + duration;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const cycleT = t % cycleLength;

    if (cycleT < delay) {
      meshRef.current.visible = false;
      return;
    }

    const progress = (cycleT - delay) / duration;
    if (progress > 1) {
      meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;

    const r = SKY_RADIUS - 10;
    const theta = startTheta + progress * 0.3;
    const phi = startPhi + progress * 0.15;

    meshRef.current.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );

    const fade = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.9;

    meshRef.current.scale.set(1, 1, 2 + speed * 0.02);
    meshRef.current.lookAt(0, 0, 0);
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.6, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} fog={false} depthWrite={false} />
    </mesh>
  );
};
