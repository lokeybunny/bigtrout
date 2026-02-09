import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SHOOTING_STAR_COUNT = 4;
const LIGHT_RAY_COUNT = 5;
const MOON_POS: [number, number, number] = [30, 40, -60];

export const Sky = () => {
  const cloudsRef = useRef<THREE.Group>(null);
  const shootingStarsRef = useRef<THREE.Group>(null);
  const moonGlowRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

  // Shooting star state stored in refs to avoid re-renders
  const shootingData = useMemo(() => {
    return Array.from({ length: SHOOTING_STAR_COUNT }).map(() => ({
      progress: Math.random() * -10, // negative = waiting
      speed: 40 + Math.random() * 60,
      start: new THREE.Vector3(
        (Math.random() - 0.5) * 300,
        30 + Math.random() * 50,
        (Math.random() - 0.5) * 300
      ),
      dir: new THREE.Vector3(
        -0.5 + Math.random() * -0.5,
        -0.3 - Math.random() * 0.2,
        -0.5 + Math.random() * -0.5
      ).normalize(),
      length: 8 + Math.random() * 12,
      cooldown: 5 + Math.random() * 15,
    }));
  }, []);

  useFrame(({ clock }, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    }

    // Pulse moon glow
    if (moonGlowRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 0.3) * 0.08 + Math.sin(t * 0.7) * 0.04;
      moonGlowRef.current.scale.setScalar(scale);
      const mat = moonGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 0.5) * 0.03;
    }

    // Animate volumetric light rays
    if (raysRef.current) {
      const t = clock.getElapsedTime();
      const children = raysRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const ray = children[i] as THREE.Mesh;
        const mat = ray.material as THREE.MeshBasicMaterial;
        const phase = i * 1.3;
        mat.opacity = 0.03 + Math.sin(t * 0.2 + phase) * 0.02 + Math.sin(t * 0.5 + phase * 2) * 0.01;
        ray.rotation.z = Math.sin(t * 0.1 + phase) * 0.02;
      }
    }

    // Animate shooting stars
    if (shootingStarsRef.current) {
      const children = shootingStarsRef.current.children;
      for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
        const d = shootingData[i];
        const mesh = children[i] as THREE.Mesh;
        if (!mesh) continue;

        d.progress += delta * d.speed;

        if (d.progress > 80) {
          // Reset with new random position & delay
          d.progress = -(d.cooldown + Math.random() * 10);
          d.start.set(
            (Math.random() - 0.5) * 300,
            30 + Math.random() * 50,
            (Math.random() - 0.5) * 300
          );
          d.dir.set(
            -0.5 + Math.random() * -0.5,
            -0.3 - Math.random() * 0.2,
            -0.5 + Math.random() * -0.5
          ).normalize();
        }

        if (d.progress < 0) {
          mesh.visible = false;
        } else {
          mesh.visible = true;
          mesh.position.set(
            d.start.x + d.dir.x * d.progress,
            d.start.y + d.dir.y * d.progress,
            d.start.z + d.dir.z * d.progress
          );
          mesh.lookAt(
            mesh.position.x + d.dir.x,
            mesh.position.y + d.dir.y,
            mesh.position.z + d.dir.z
          );
          // Fade based on lifecycle
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const fade = Math.min(1, d.progress / 5) * Math.max(0, 1 - (d.progress - 60) / 20);
          mat.opacity = fade * 0.9;
        }
      }
    }
  });

  // Dense star field — 400 stars spread across full sky dome
  const starsGeometry = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2); // bias toward upper hemisphere
      const r = 350 + Math.random() * 30;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.3 + Math.random() * 0.7;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  // Dim star layer for depth
  const dimStarsGeometry = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.1);
      const r = 340 + Math.random() * 40;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Pre-compute cloud positions
  const cloudPositions = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const r = 50 + Math.random() * 30;
      return {
        position: [Math.cos(angle) * r, 15 + Math.random() * 10, Math.sin(angle) * r] as [number, number, number],
        size: 3 + Math.random() * 4,
      };
    });
  }, []);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[400, 16, 8]} />
        <meshBasicMaterial color="#050a14" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Moon */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[5, 12, 12]} />
        <meshBasicMaterial color="#ffffee" fog={false} />
      </mesh>

      {/* Moon glow — layered halos */}
      <mesh ref={moonGlowRef} position={MOON_POS}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial color="#aabbdd" transparent opacity={0.12} fog={false} side={THREE.FrontSide} depthWrite={false} />
      </mesh>
      <mesh position={MOON_POS}>
        <sphereGeometry args={[20, 16, 16]} />
        <meshBasicMaterial color="#6688aa" transparent opacity={0.05} fog={false} side={THREE.FrontSide} depthWrite={false} />
      </mesh>
      <mesh position={MOON_POS}>
        <sphereGeometry args={[35, 12, 12]} />
        <meshBasicMaterial color="#445566" transparent opacity={0.025} fog={false} side={THREE.FrontSide} depthWrite={false} />
      </mesh>

      {/* Moon point light for local illumination */}
      <pointLight position={MOON_POS} intensity={2} distance={120} color="#aabbdd" decay={2} />

      <directionalLight position={MOON_POS} intensity={1.8} color="#ccddef" />

      {/* Volumetric light rays from moon */}
      <group ref={raysRef} position={MOON_POS}>
        {Array.from({ length: LIGHT_RAY_COUNT }).map((_, i) => {
          const angle = ((i / LIGHT_RAY_COUNT) * Math.PI * 0.6) - Math.PI * 0.3;
          const rayLen = 80 + i * 15;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * rayLen * 0.5, -rayLen * 0.4, Math.cos(angle) * 5]}
              rotation={[0, 0, angle - 0.3]}
            >
              <planeGeometry args={[3 + i * 0.8, rayLen]} />
              <meshBasicMaterial
                color="#8899cc"
                transparent
                opacity={0.04}
                fog={false}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          );
        })}
      </group>

      {/* Clouds */}
      <group ref={cloudsRef}>
        {cloudPositions.map((cloud, i) => (
          <mesh key={i} position={cloud.position}>
            <sphereGeometry args={[cloud.size, 6, 4]} />
            <meshBasicMaterial color="#1a2a3a" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Bright stars */}
      <points geometry={starsGeometry}>
        <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation fog={false} />
      </points>

      {/* Dim stars for depth */}
      <points geometry={dimStarsGeometry}>
        <pointsMaterial color="#8899bb" size={0.3} sizeAttenuation fog={false} transparent opacity={0.5} />
      </points>

      {/* Shooting stars */}
      <group ref={shootingStarsRef}>
        {Array.from({ length: SHOOTING_STAR_COUNT }).map((_, i) => (
          <mesh key={i} visible={false}>
            <boxGeometry args={[0.15, 0.15, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} fog={false} />
          </mesh>
        ))}
      </group>
    </>
  );
};
