import * as THREE from 'three';

export const TroutIsland = () => {
  return (
    <group position={[0, 0, -185]} rotation={[0, Math.PI, 0]}>
      {/* Main body — reduced segments */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[8, 8, 6]} />
        <meshStandardMaterial color="#2d7a3e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, -8]}>
        <sphereGeometry args={[6, 8, 6]} />
        <meshStandardMaterial color="#2d8a4e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, 8]}>
        <sphereGeometry args={[5, 8, 6]} />
        <meshStandardMaterial color="#3a9a5e" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.5, 14]}>
        <sphereGeometry args={[4.5, 8, 6]} />
        <meshStandardMaterial color="#3aaa5e" roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[3, 4, 13]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[3.5, 4.2, 13.5]}>
        <sphereGeometry args={[0.5, 4, 4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-3, 4, 13]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-3.5, 4.2, 13.5]}>
        <sphereGeometry args={[0.5, 4, 4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 3, -16]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[8, 1, 5]} />
        <meshStandardMaterial color="#1a6a2e" roughness={0.7} />
      </mesh>
      {/* Dorsal fin */}
      <mesh position={[0, 7, 0]}>
        <coneGeometry args={[3, 5, 3]} />
        <meshStandardMaterial color="#1a7a3e" roughness={0.7} />
      </mesh>
      {/* Palm trees — only 2 */}
      {[[-2, 8, -3], [3, 7.5, 2]].map(([x, y, z], i) => (
        <group key={`palm-${i}`} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.3, 3, 4]} />
            <meshStandardMaterial color="#5a3a10" />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[1.2, 6, 4]} />
            <meshStandardMaterial color="#228822" />
          </mesh>
        </group>
      ))}
      {/* Beach ring */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 14, 12]} />
        <meshStandardMaterial color="#d4b896" side={THREE.DoubleSide} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 12, 8]}>
        <boxGeometry args={[8, 2, 0.3]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[0, 12, 8.2]}>
        <boxGeometry args={[7.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#44ff88" emissive="#44ff88" emissiveIntensity={0.5} />
      </mesh>
      {/* Beacon light */}
      <pointLight position={[0, 10, 4]} color="#44ff88" intensity={5} distance={50} />
    </group>
  );
};
