import { Canvas } from '@react-three/fiber';
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Ocean } from './Ocean';
import { Boat } from './Boat';
import { AIBoat, CHECKPOINTS, TOTAL_LAPS } from './AIBoat';
import { RaceTrack } from './RaceTrack';
import { TroutIsland } from './TroutIsland';
import { Sky } from './Sky';

interface RaceState {
  playerCheckpoint: number;
  playerLap: number;
  positions: { id: number | 'player'; progress: number }[];
  finished: boolean;
  finishPlace: number | null;
  countdown: number | null;
  raceStarted: boolean;
}

const AI_BOATS = [
  { id: 1, color: '#cc3333', speed: 2.8, name: 'Red Fin' },
  { id: 2, color: '#3366cc', speed: 3.2, name: 'Blue Wave' },
  { id: 3, color: '#cc9933', speed: 2.5, name: 'Gold Rush' },
  { id: 4, color: '#9933cc', speed: 3.0, name: 'Purple Tide' },
  { id: 5, color: '#33cccc', speed: 2.7, name: 'Teal Storm' },
];

const getCheckpointProgress = (pos: THREE.Vector3): number => {
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    const dx = pos.x - CHECKPOINTS[i][0];
    const dz = pos.z - CHECKPOINTS[i][1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }
  return closestIdx;
};

export const GameScene = () => {
  const boatPosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeSpeedRef = useRef(0);
  const wakePosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeHeadingRef = useRef(0);
  
  const [state, setState] = useState<RaceState>({
    playerCheckpoint: 0,
    playerLap: 0,
    positions: [
      { id: 'player', progress: 0 },
      ...AI_BOATS.map(b => ({ id: b.id, progress: 0 })),
    ],
    finished: false,
    finishPlace: null,
    countdown: 3,
    raceStarted: false,
  });

  const playerProgressRef = useRef(0);
  const lastCheckpointRef = useRef(0);
  const playerLapRef = useRef(0);
  const aiProgressRef = useRef<Record<number, number>>(
    Object.fromEntries(AI_BOATS.map(b => [b.id, 0]))
  );
  const finishOrderRef = useRef<(number | 'player')[]>([]);

  // Start countdown
  const [countdownDisplay, setCountdownDisplay] = useState<string | null>('3');
  const countdownStarted = useRef(false);

  if (!countdownStarted.current) {
    countdownStarted.current = true;
    setTimeout(() => setCountdownDisplay('2'), 1000);
    setTimeout(() => setCountdownDisplay('1'), 2000);
    setTimeout(() => {
      setCountdownDisplay('GO!');
      setState(prev => ({ ...prev, raceStarted: true, countdown: null }));
    }, 3000);
    setTimeout(() => setCountdownDisplay(null), 3800);
  }

  const handleBoatPosition = useCallback((pos: THREE.Vector3) => {
    boatPosRef.current.copy(pos);
    
    // Track player checkpoint
    const cp = getCheckpointProgress(pos);
    const totalCPs = CHECKPOINTS.length;
    
    // Only advance checkpoint if moving forward (within 2 of last)
    if (cp === (lastCheckpointRef.current + 1) % totalCPs || 
        (cp === 0 && lastCheckpointRef.current === totalCPs - 1)) {
      if (cp === 0 && lastCheckpointRef.current === totalCPs - 1) {
        playerLapRef.current++;
      }
      lastCheckpointRef.current = cp;
      playerProgressRef.current = playerLapRef.current * totalCPs + cp;
      
      // Check if player finished
      if (playerLapRef.current >= TOTAL_LAPS && !finishOrderRef.current.includes('player')) {
        finishOrderRef.current.push('player');
        const place = finishOrderRef.current.indexOf('player') + 1;
        setState(prev => ({
          ...prev,
          finished: true,
          finishPlace: place,
          playerCheckpoint: cp,
          playerLap: playerLapRef.current,
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        playerCheckpoint: cp,
        playerLap: playerLapRef.current,
      }));
    }

    // Update positions for leaderboard
    updatePositions();
  }, []);

  const handleAIProgress = useCallback((id: number, progress: number, lap: number) => {
    aiProgressRef.current[id] = progress;
    
    if (lap >= TOTAL_LAPS && !finishOrderRef.current.includes(id)) {
      finishOrderRef.current.push(id);
    }
    
    updatePositions();
  }, []);

  const updatePositions = useCallback(() => {
    const allProgress = [
      { id: 'player' as const, progress: playerProgressRef.current },
      ...AI_BOATS.map(b => ({ id: b.id, progress: aiProgressRef.current[b.id] || 0 })),
    ].sort((a, b) => b.progress - a.progress);
    
    setState(prev => ({
      ...prev,
      positions: allProgress,
    }));
  }, []);

  const playerPlace = state.positions.findIndex(p => p.id === 'player') + 1;
  const totalCheckpointsPassed = playerProgressRef.current;

  return (
    <div className="relative w-full h-screen" style={{ cursor: 'crosshair' }}>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-start justify-between max-w-5xl mx-auto">
          {/* Race info */}
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold" style={{ 
              fontFamily: 'Bangers, cursive',
              color: '#44ff88',
              textShadow: '0 0 20px rgba(68,255,136,0.5), 2px 2px 0 #000'
            }}>
              LAP {Math.min(playerLapRef.current + 1, TOTAL_LAPS)} / {TOTAL_LAPS}
            </div>
            <div className="text-lg" style={{ 
              fontFamily: 'Bangers, cursive',
              color: '#ffcc44',
              textShadow: '2px 2px 0 #000'
            }}>
              Checkpoint: {lastCheckpointRef.current + 1} / {CHECKPOINTS.length}
            </div>
            <div className="text-sm mt-1" style={{ fontFamily: 'Rajdhani', color: '#aaa' }}>
              ⌨️ WASD to steer • Race to $BIGTROUT Island!
            </div>
          </div>

          {/* Position */}
          <div className="text-center">
            <div className="text-5xl font-bold" style={{
              fontFamily: 'Bangers, cursive',
              color: playerPlace <= 1 ? '#44ff88' : playerPlace <= 3 ? '#ffcc44' : '#ff6644',
              textShadow: '0 0 20px rgba(68,255,136,0.3), 3px 3px 0 #000'
            }}>
              {playerPlace}{playerPlace === 1 ? 'st' : playerPlace === 2 ? 'nd' : playerPlace === 3 ? 'rd' : 'th'}
            </div>
            <div className="text-xs" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
              of {AI_BOATS.length + 1}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[140px]">
            <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Bangers', color: '#ffcc44' }}>
              STANDINGS
            </div>
            {state.positions.slice(0, 6).map((pos, i) => {
              const isPlayer = pos.id === 'player';
              const boat = AI_BOATS.find(b => b.id === pos.id);
              return (
                <div key={String(pos.id)} className="flex items-center gap-2 text-xs py-0.5"
                     style={{ fontFamily: 'Rajdhani' }}>
                  <span style={{ 
                    color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#666',
                    fontWeight: 'bold',
                    width: '16px'
                  }}>
                    {i + 1}.
                  </span>
                  <span style={{ 
                    color: isPlayer ? '#44ff88' : '#aaa',
                    fontWeight: isPlayer ? 'bold' : 'normal'
                  }}>
                    {isPlayer ? '🎣 YOU' : boat?.name || `Boat ${pos.id}`}
                  </span>
                  {isPlayer && <span style={{ color: '#44ff88', fontSize: '8px' }}>◀</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Countdown */}
      {countdownDisplay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-8xl font-bold" style={{
            fontFamily: 'Bangers, cursive',
            color: countdownDisplay === 'GO!' ? '#44ff88' : '#ffcc44',
            textShadow: '0 0 40px rgba(255,204,68,0.5), 4px 4px 0 #000',
            animation: 'pulse 0.5s ease-in-out',
          }}>
            {countdownDisplay}
          </div>
        </div>
      )}

      {/* Finish overlay */}
      {state.finished && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto"
             style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4" style={{
              fontFamily: 'Bangers, cursive',
              color: state.finishPlace === 1 ? '#ffd700' : state.finishPlace! <= 3 ? '#44ff88' : '#ff6644',
              textShadow: '0 0 30px rgba(255,215,0,0.5), 4px 4px 0 #000',
            }}>
              {state.finishPlace === 1 ? '🏆 YOU WIN!' : `FINISHED ${state.finishPlace}${
                state.finishPlace === 2 ? 'nd' : state.finishPlace === 3 ? 'rd' : 'th'
              }`}
            </div>
            <div className="text-2xl mb-6" style={{
              fontFamily: 'Bangers',
              color: '#44ff88',
              textShadow: '2px 2px 0 #000',
            }}>
              You reached $BIGTROUT Island!
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-lg font-bold text-lg"
              style={{
                fontFamily: 'Bangers',
                background: 'linear-gradient(135deg, #2d8a4e, #44ff88)',
                color: '#0a1525',
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              RACE AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 3, -5], fov: 70, near: 0.1, far: 500 }}>
        <ambientLight intensity={0.8} color="#6688bb" />
        <directionalLight position={[10, 20, 5]} intensity={1.2} color="#ccddef" />
        <hemisphereLight args={['#6688aa', '#223344', 0.6]} />
        <fog attach="fog" args={['#0a1525', 60, 250]} />
        
        <Sky />
        <Ocean />
        <TroutIsland />
        <RaceTrack />
        
        <Boat 
          onPositionUpdate={handleBoatPosition}
          speedRef={wakeSpeedRef}
          posRef={wakePosRef}
          headingRef={wakeHeadingRef}
          raceStarted={state.raceStarted}
        />
        
        {AI_BOATS.map((boat, i) => (
          <AIBoat
            key={boat.id}
            id={boat.id}
            color={boat.color}
            speed={state.raceStarted ? boat.speed : 0}
            startOffset={i * 0.3}
            onProgress={handleAIProgress}
          />
        ))}
      </Canvas>
    </div>
  );
};
