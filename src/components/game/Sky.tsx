import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MOON_POS: [number, number, number] = [30, 40, -60];
const STAR_COUNT = 350;
const SHOOTING_STAR_COUNT = 3;

export const Sky = () => {
  // Star field — fixed count, no perf tier dependency
  const starsGeometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2);
      const r = 350 + Math.random() * 30;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.4 + Math.random() * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  // Shooting stars — lightweight line segments
  const shootingStars = useMemo(() => {
    return Array.from({ length: SHOOTING_STAR_COUNT }, (_, i) => ({
      id: i,
      startTheta: Math.random() * Math.PI * 2,
      startPhi: 0.3 + Math.random() * 0.5,
      speed: 40 + Math.random() * 30,
      delay: Math.random() * 20,
      duration: 1.5 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[400, 8, 6]} />
        <meshBasicMaterial color="#050a14" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Moon — brighter */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[5, 8, 8]} />
        <meshBasicMaterial color="#fffff8" fog={false} />
      </mesh>

      {/* Moon glow — more visible */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[14, 8, 8]} />
        <meshBasicMaterial color="#ccddff" transparent opacity={0.15} fog={false} side={THREE.FrontSide} depthWrite={false} />
      </mesh>

      {/* Moon light — slightly brighter */}
      <directionalLight position={MOON_POS} intensity={2.2} color="#ddeeff" />

      {/* Stars — brighter and more visible */}
      <points geometry={starsGeometry}>
        <pointsMaterial color="#ffffff" size={0.8} sizeAttenuation fog={false} />
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

    const r = 340;
    const theta = startTheta + progress * 0.3;
    const phi = startPhi + progress * 0.15;

    meshRef.current.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );

    // Fade in/out
    const fade = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.9;

    // Stretch in direction of travel
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
