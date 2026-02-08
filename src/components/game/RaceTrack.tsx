import * as THREE from 'three';
import { CHECKPOINTS } from './AIBoat';

export const RaceTrack = () => {
  return (
    <group>
      {/* Checkpoint buoys */}
      {CHECKPOINTS.map((cp, i) => (
        <group key={i} position={[cp[0], 0, cp[1]]}>
          {/* Buoy */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 1, 8]} />
            <meshStandardMaterial 
              color={i === 0 ? '#44ff88' : '#ff8844'} 
              emissive={i === 0 ? '#44ff88' : '#ff8844'} 
              emissiveIntensity={0.3} 
            />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          {/* Flag */}
          <mesh position={[0.3, 3.2, 0]}>
            <planeGeometry args={[0.6, 0.4]} />
            <meshStandardMaterial 
              color={i === 0 ? '#44ff88' : '#ffaa44'} 
              side={THREE.DoubleSide}
              emissive={i === 0 ? '#44ff88' : '#ffaa44'}
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Light */}
          <pointLight 
            position={[0, 1.5, 0]} 
            color={i === 0 ? '#44ff88' : '#ff8844'} 
            intensity={1} 
            distance={15} 
          />
          {/* Number marker */}
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.2} 
            />
          </mesh>
        </group>
      ))}
      
      {/* Track lane markers — dotted path between checkpoints */}
      {CHECKPOINTS.map((cp, i) => {
        const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];
        const segments = 5;
        return Array.from({ length: segments }).map((_, j) => {
          const t = (j + 0.5) / segments;
          const x = cp[0] + (next[0] - cp[0]) * t;
          const z = cp[1] + (next[1] - cp[1]) * t;
          return (
            <mesh key={`lane-${i}-${j}`} position={[x, -0.5, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.5, 8]} />
              <meshStandardMaterial color="#44ff88" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
          );
        });
      })}
      
      {/* Start/Finish line */}
      <mesh position={[0, -0.4, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
