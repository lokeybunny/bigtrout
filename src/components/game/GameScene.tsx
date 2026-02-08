import { Canvas } from '@react-three/fiber';
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Ocean } from './Ocean';
import { Boat } from './Boat';
import { FishEntity } from './FishEntity';
import { NetCursor } from './NetCursor';
import { Sky } from './Sky';
import { WakeEffect } from './WakeEffect';
import { useSolanaTransactions, GameEvent } from '@/hooks/useSolanaTransactions';

interface GameState {
  score: number;
  caughtTrout: number;
  caughtGoldfish: number;
  eatenByOctopus: number;
  missedFish: number;
  inventory: number; // fish in boat
}

export const GameScene = () => {
  const [entities, setEntities] = useState<Array<GameEvent & { pos: [number, number, number] }>>([]);
  const boatPosRef = useRef(new THREE.Vector3(0, 0, 2));
  const boatSpeedRef = useRef(0);
  const boatHeadingRef = useRef(0);
  const wakePosRef = useRef(new THREE.Vector3(0, 0, 2));
  const wakeHeadingRef = useRef(0);
  const wakeSpeedRef = useRef(0);
  const [state, setState] = useState<GameState>({
    score: 0,
    caughtTrout: 0,
    caughtGoldfish: 0,
    eatenByOctopus: 0,
    missedFish: 0,
    inventory: 0,
  });
  const [messages, setMessages] = useState<Array<{ text: string; color: string; id: string }>>([]);

  const handleBoatPosition = useCallback((pos: THREE.Vector3) => {
    boatPosRef.current.copy(pos);
  }, []);

  const { connected } = useSolanaTransactions(
    useCallback((event: GameEvent) => {
      // Spawn fish near the boat
      const bp = boatPosRef.current;
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 8;
      const spawnX = bp.x + Math.cos(angle) * dist;
      const spawnZ = bp.z + Math.sin(angle) * dist;
      setEntities(prev => [...prev, { ...event, pos: [spawnX, 0, spawnZ] }]);
    }, [])
  );

  const addMessage = (text: string, color: string) => {
    const id = `msg-${Date.now()}`;
    setMessages(prev => [...prev, { text, color, id }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, 2500);
  };

  const handleCatch = useCallback((id: string, kind: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    if (kind === 'octopus') {
      // Catching the octopus saves your fish!
      setState(prev => ({ ...prev, score: prev.score + 50 }));
      addMessage('🐙 Octopus defeated! +50', '#ff44aa');
    } else if (kind === 'trout') {
      setState(prev => ({
        ...prev,
        score: prev.score + 25,
        caughtTrout: prev.caughtTrout + 1,
        inventory: prev.inventory + 1,
      }));
      addMessage('🐟 Big Trout caught! +25', '#44ff88');
    } else {
      setState(prev => ({
        ...prev,
        score: prev.score + 10,
        caughtGoldfish: prev.caughtGoldfish + 1,
        inventory: prev.inventory + 1,
      }));
      addMessage('✨ Goldfish caught! +10', '#ffcc00');
    }
  }, []);

  const handleMiss = useCallback((id: string, kind: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    if (kind === 'octopus') {
      // Octopus eats your fish!
      const fishLost = Math.min(state.inventory, 3);
      setState(prev => ({
        ...prev,
        eatenByOctopus: prev.eatenByOctopus + fishLost,
        inventory: Math.max(0, prev.inventory - fishLost),
        score: Math.max(0, prev.score - fishLost * 10),
      }));
      if (fishLost > 0) {
        addMessage(`🐙 Octopus ate ${fishLost} fish! -${fishLost * 10}`, '#ff0044');
      } else {
        addMessage('🐙 Octopus escaped (no fish to eat)', '#884444');
      }
    } else {
      setState(prev => ({
        ...prev,
        missedFish: prev.missedFish + 1,
      }));
      addMessage(`💨 ${kind === 'trout' ? 'Trout' : 'Goldfish'} escaped!`, '#888888');
    }
  }, [state.inventory]);

  return (
    <div className="relative w-full h-screen" style={{ cursor: 'none' }}>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold" style={{ 
              fontFamily: 'Bangers, cursive',
              color: '#44ff88',
              textShadow: '0 0 20px rgba(68,255,136,0.5), 2px 2px 0 #000'
            }}>
              Score: {state.score}
            </div>
            <div className="flex gap-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              <span style={{ color: '#44ff88' }}>🐟 Trout: {state.caughtTrout}</span>
              <span style={{ color: '#ffcc00' }}>✨ Goldfish: {state.caughtGoldfish}</span>
              <span style={{ color: '#88ccff' }}>🎣 In Boat: {state.inventory}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} 
                 style={{ boxShadow: connected ? '0 0 8px #4f4' : '0 0 8px #f44' }} />
            <span className="text-xs text-white/60" style={{ fontFamily: 'Rajdhani' }}>
              {connected ? 'LIVE' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating messages */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none">
        {messages.map(msg => (
          <div key={msg.id} className="animate-fade-in text-lg font-bold px-4 py-1 rounded-lg"
               style={{ 
                 color: msg.color, 
                 fontFamily: 'Bangers, cursive',
                 textShadow: '2px 2px 0 #000',
                 animation: 'floatUp 2.5s ease-out forwards'
               }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <p className="text-white/40 text-sm" style={{ fontFamily: 'Rajdhani', textShadow: '1px 1px 2px #000' }}>
          WASD / Arrow keys to sail • Click fish to catch them • Buys spawn fish • Sells spawn octopuses
        </p>
        <p className="text-white/30 text-xs mt-1" style={{ fontFamily: 'Rajdhani', textShadow: '1px 1px 2px #000' }}>
          W = Forward • S = Reverse • A/D = Turn
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 6], fov: 70, near: 0.1, far: 200 }}>
        <ambientLight intensity={0.8} color="#6688bb" />
        <directionalLight position={[10, 20, 5]} intensity={1.2} color="#ccddef" />
        <hemisphereLight args={['#6688aa', '#223344', 0.6]} />
        <fog attach="fog" args={['#0a1525', 30, 100]} />
        
        <Sky />
        <Ocean />
        <Boat 
          onPositionUpdate={handleBoatPosition} 
          speedRef={wakeSpeedRef}
          posRef={wakePosRef}
          headingRef={wakeHeadingRef}
        />
        <WakeEffect boatPos={wakePosRef} boatHeading={wakeHeadingRef} boatSpeed={wakeSpeedRef} />
        <NetCursor />
        
        {entities.map(entity => (
          <FishEntity
            key={entity.id}
            id={entity.id}
            kind={entity.kind}
            position={entity.pos}
            onCatch={handleCatch}
            onMiss={handleMiss}
          />
        ))}
      </Canvas>
    </div>
  );
};
