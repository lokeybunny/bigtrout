import { useMemo } from 'react';
import * as THREE from 'three';
import { useAdaptivePerf } from './AdaptivePerformance';

const MOON_POS: [number, number, number] = [30, 40, -60];

export const Sky = () => {
  const perfRef = useAdaptivePerf();
  const starMult = perfRef.current.starMultiplier;
  // Star field — scaled by performance tier
  const starsGeometry = useMemo(() => {
    const count = Math.floor(200 * starMult);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2);
      const r = 350 + Math.random() * 30;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <>
      {/* Sky dome — minimal segments */}
      <mesh>
        <sphereGeometry args={[400, 8, 6]} />
        <meshBasicMaterial color="#050a14" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Moon — static, no animation */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[5, 8, 8]} />
        <meshBasicMaterial color="#ffffee" fog={false} />
      </mesh>

      {/* Moon glow — single layer */}
      <mesh position={MOON_POS}>
        <sphereGeometry args={[14, 8, 8]} />
        <meshBasicMaterial color="#aabbdd" transparent opacity={0.1} fog={false} side={THREE.FrontSide} depthWrite={false} />
      </mesh>

      {/* Moon light */}
      <directionalLight position={MOON_POS} intensity={1.8} color="#ccddef" />

      {/* Stars */}
      <points geometry={starsGeometry}>
        <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation fog={false} />
      </points>
    </>
  );
};
