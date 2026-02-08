import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WakeEffectProps {
  boatPos: React.MutableRefObject<THREE.Vector3>;
  boatHeading: React.MutableRefObject<number>;
  boatSpeed: React.MutableRefObject<number>;
}

const PARTICLE_COUNT = 80;

export const WakeEffect = ({ boatPos, boatHeading, boatSpeed }: WakeEffectProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesData = useRef<Array<{
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
    active: boolean;
  }>>(Array.from({ length: PARTICLE_COUNT }, () => ({
    life: 0,
    maxLife: 2,
    velocity: new THREE.Vector3(),
    active: false,
  })));
  const spawnTimer = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const speed = Math.abs(boatSpeed.current);
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const sizes = geometry.attributes.size as THREE.BufferAttribute;
    const opacities = geometry.attributes.opacity as THREE.BufferAttribute;
    const data = particlesData.current;

    // Spawn new particles based on speed
    if (speed > 0.5) {
      spawnTimer.current += delta;
      const spawnRate = 0.02 + (1 - speed / 8) * 0.05;
      while (spawnTimer.current > spawnRate) {
        spawnTimer.current -= spawnRate;
        // Find inactive particle
        const idx = data.findIndex(p => !p.active);
        if (idx === -1) continue;

        const p = data[idx];
        p.active = true;
        p.life = 0;
        p.maxLife = 1.5 + Math.random() * 1.5;

        // Spawn at stern of boat
        const sternOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -0.2,
          2.5
        );
        sternOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), boatHeading.current);
        const spawnPos = boatPos.current.clone().add(sternOffset);

        positions.setXYZ(idx, spawnPos.x, spawnPos.y, spawnPos.z);

        // Velocity away from boat (backwards + spread)
        const backward = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          0.3 + Math.random() * 0.5,
          1 + Math.random() * 0.5
        );
        backward.applyAxisAngle(new THREE.Vector3(0, 1, 0), boatHeading.current);
        backward.multiplyScalar(speed * 0.3);
        p.velocity.copy(backward);
      }
    }

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = data[i];
      if (!p.active) {
        sizes.setX(i, 0);
        opacities.setX(i, 0);
        continue;
      }

      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        sizes.setX(i, 0);
        opacities.setX(i, 0);
        continue;
      }

      const t = p.life / p.maxLife;
      const x = positions.getX(i) + p.velocity.x * delta;
      const y = positions.getY(i) + p.velocity.y * delta - delta * 0.8; // gravity
      const z = positions.getZ(i) + p.velocity.z * delta;

      p.velocity.x *= 0.98;
      p.velocity.z *= 0.98;

      positions.setXYZ(i, x, Math.max(-0.8, y), z);
      sizes.setX(i, (1 - t) * 0.4 + t * 0.1);
      opacities.setX(i, (1 - t) * 0.7);
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;
    opacities.needsUpdate = true;
  });

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#aaddff',
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, []);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};
