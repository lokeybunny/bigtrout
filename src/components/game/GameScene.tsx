import { Canvas } from '@react-three/fiber';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Ocean } from './Ocean';
import { FishStatue } from './FishStatue';
import { Boat } from './Boat';
import { GameRadio } from './GameRadio';
import { AIBoat, CHECKPOINTS, TOTAL_LAPS } from './AIBoat';
import { RaceTrack } from './RaceTrack';
import { TroutIsland } from './TroutIsland';
import { Sky } from './Sky';
import { SpeedBoost, generateBoosts, BoostPickup } from './SpeedBoost';
import { Obstacles, generateObstacles, Obstacle } from './Obstacles';
import { AdaptivePerformanceProvider } from './AdaptivePerformance';
import { Minimap } from './Minimap';
import { CircleCollider } from './Colliders';
import { useSolanaTransactions, GameEvent } from '../../hooks/useSolanaTransactions';
import { useGameSFX } from '../../hooks/useGameSFX';

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

const CHECKPOINT_RADIUS = 8; // Must be within this distance to trigger checkpoint

const CHECKPOINT_RADIUS_SQ = CHECKPOINT_RADIUS * CHECKPOINT_RADIUS;

const getCheckpointProgress = (pos: THREE.Vector3): { index: number; withinRange: boolean } => {
  let minDistSq = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    const dx = pos.x - CHECKPOINTS[i][0];
    const dz = pos.z - CHECKPOINTS[i][1];
    const distSq = dx * dx + dz * dz;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closestIdx = i;
    }
  }
  return { index: closestIdx, withinRange: minDistSq <= CHECKPOINT_RADIUS_SQ };
};

export const GameScene = () => {
  const playSFX = useGameSFX();
  const boatPosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeSpeedRef = useRef(0);
  const wakePosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeHeadingRef = useRef(0);

  const [boosts, setBoosts] = useState<BoostPickup[]>(() => generateBoosts());
  const [obstacles] = useState<Obstacle[]>(() => generateObstacles());
  // Convert obstacles to circle colliders for solid collision resolution
  const obstacleColliders = useMemo<CircleCollider[]>(() => 
    obstacles.map(obs => ({
      x: obs.position[0],
      z: obs.position[2],
      radius: obs.radius,
      label: obs.type,
    })),
    [obstacles]
  );
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [boostTimer, setBoostTimer] = useState(0);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [hitMessage, setHitMessage] = useState<string | null>(null);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<Set<number>>(new Set());
  const [checkpointFlash, setCheckpointFlash] = useState<string | null>(null);
  const [paddleDisabled, setPaddleDisabled] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // $BIGTROUT points from Solana buys/sells
  const [troutPoints, setTroutPoints] = useState(0);
  const [tokenMultiplier, setTokenMultiplier] = useState(1);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);

  const handleGameEvent = useCallback((event: GameEvent) => {
    if (event.kind === 'trout') {
      setTroutPoints(prev => prev + 5);
      setTokenMultiplier(prev => Math.min(prev + 0.15, 2.5));
      setTokenMessage('🐟 BIG BUY! +5 $BIGTROUT');
      playSFX('bigBuy');
    } else if (event.kind === 'goldfish') {
      setTroutPoints(prev => prev + 1);
      setTokenMultiplier(prev => Math.min(prev + 0.05, 2.5));
      setTokenMessage('🐠 BUY! +1 $BIGTROUT');
      playSFX('buy');
    } else if (event.kind === 'octopus') {
      setTroutPoints(prev => Math.max(0, prev - 3));
      setTokenMultiplier(prev => Math.max(0.5, prev - 0.2));
      setTokenMessage('🐙 SELL STREAK! -3 $BIGTROUT');
      playSFX('sell');
    }
    setTimeout(() => setTokenMessage(null), 2500);
  }, [playSFX]);

  const { connected } = useSolanaTransactions(handleGameEvent);
  
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

  // Reset race
  const resetRace = useCallback(() => {
    // Reset refs
    playerProgressRef.current = 0;
    lastCheckpointRef.current = 0;
    playerLapRef.current = 0;
    aiProgressRef.current = Object.fromEntries(AI_BOATS.map(b => [b.id, 0]));
    finishOrderRef.current = [];
    boatPosRef.current.set(0, 0, -15);
    boostEndTimeRef.current = 0;

    // Reset state
    setBoosts(generateBoosts());
    setBoostMultiplier(1);
    setBoostTimer(0);
    setBoostMessage(null);
    setHitMessage(null);
    setPassedCheckpoints(new Set());
    setCheckpointFlash(null);
    setPaddleDisabled(false);
    setTroutPoints(0);
    setTokenMultiplier(1);
    setTokenMessage(null);
    setResetKey(prev => prev + 1);

    // Restart countdown
    setCountdownDisplay('3');
    setState({
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

    setTimeout(() => setCountdownDisplay('2'), 1000);
    setTimeout(() => setCountdownDisplay('1'), 2000);
    setTimeout(() => {
      setCountdownDisplay('GO!');
      setState(prev => ({ ...prev, raceStarted: true, countdown: null }));
    }, 3000);
    setTimeout(() => setCountdownDisplay(null), 3800);
  }, []);

  // R key to reset
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') resetRace();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetRace]);

  // Countdown (initial only)
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

  // Boost timer decay — tracked via ref to avoid re-renders, synced to HUD less frequently
  const boostEndTimeRef = useRef(0);

  // Boost decay via rAF — no setInterval jank
  useEffect(() => {
    if (boostMultiplier === 1) return;
    let raf: number;
    let lastUpdate = 0;
    const tick = (now: number) => {
      const remaining = Math.max(0, (boostEndTimeRef.current - performance.now()) / 1000);
      if (remaining <= 0) {
        setBoostMultiplier(1);
        setBoostTimer(0);
        setBoostMessage(null);
      } else {
        // Only update React state ~4x/sec to avoid jank
        if (now - lastUpdate > 250) {
          setBoostTimer(remaining);
          lastUpdate = now;
        }
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [boostMultiplier]);

  const handleBoostCollect = useCallback((id: string) => {
    setBoosts(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
    setBoostMultiplier(1.8);
    boostEndTimeRef.current = performance.now() + 4000;
    setBoostTimer(4);
    setBoostMessage('⚡ SPEED BOOST!');
    playSFX('boost');
    setTimeout(() => setBoostMessage(null), 2000);
  }, [playSFX]);

  const handleObstacleHit = useCallback((type: 'rock' | 'wave') => {
    setBoostMultiplier(0.3);
    boostEndTimeRef.current = performance.now() + 1500;
    setHitMessage(type === 'rock' ? '🪨 ROCK HIT! Slowed!' : '🌊 ROUGH WAVES! Slowed!');
    playSFX(type);
    setPaddleDisabled(true);
    setTimeout(() => { setHitMessage(null); setPaddleDisabled(false); }, 1500);
  }, [playSFX]);

  const posUpdateThrottleRef = useRef(0);

  const handleBoatPosition = useCallback((pos: THREE.Vector3) => {
    boatPosRef.current.copy(pos);
    
    const { index: cp, withinRange } = getCheckpointProgress(pos);
    const totalCPs = CHECKPOINTS.length;
    
    if (withinRange && (cp === (lastCheckpointRef.current + 1) % totalCPs || 
        (cp === 0 && lastCheckpointRef.current === totalCPs - 1))) {
      if (cp === 0 && lastCheckpointRef.current === totalCPs - 1) {
        playerLapRef.current++;
      }
      lastCheckpointRef.current = cp;
      playerProgressRef.current = playerLapRef.current * totalCPs + cp;
      
      setPassedCheckpoints(prev => new Set(prev).add(cp));
      setCheckpointFlash(`✅ Checkpoint ${cp + 1} / ${totalCPs}`);
      playSFX('checkpoint');
      setTimeout(() => setCheckpointFlash(null), 1500);
      
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

    // Throttle leaderboard updates to ~4x/sec to avoid React re-render jank
    const now = performance.now();
    if (now - posUpdateThrottleRef.current > 250) {
      posUpdateThrottleRef.current = now;
      updatePositions();
    }
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

  // AI positions for minimap
  const aiMinimapData = AI_BOATS.map(b => ({
    id: b.id,
    color: b.color,
    progress: aiProgressRef.current[b.id] || 0,
  }));

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
              ⌨️ WASD to steer • ⇧ Shift to paddle • Collect ⚡ • Avoid 🪨 • R to restart
            </div>
            {/* Boost indicator */}
            {boostMultiplier > 1 && (
              <div className="mt-1">
                <div className="text-sm font-bold" style={{ fontFamily: 'Bangers', color: '#ffaa00' }}>
                  ⚡ BOOST {boostTimer.toFixed(1)}s
                </div>
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(boostTimer / 4) * 100}%`,
                    background: 'linear-gradient(90deg, #ff6600, #ffcc00)',
                  }} />
                </div>
              </div>
            )}
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

      {/* Position indicator - far right */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-5 py-4">
          <div className="text-6xl font-bold" style={{
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
      </div>

      {/* Boost message */}
      {boostMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-3xl font-bold px-4 py-1 rounded-lg" style={{
            fontFamily: 'Bangers, cursive',
            color: '#ffaa00',
            textShadow: '0 0 30px rgba(255,170,0,0.6), 3px 3px 0 #000',
            background: 'rgba(0,0,0,0.7)',
            animation: 'floatUp 2s ease-out forwards',
          }}>
            {boostMessage}
          </div>
        </div>
      )}

      {/* Hit message */}
      {hitMessage && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-3xl font-bold px-4 py-1 rounded-lg" style={{
            fontFamily: 'Bangers, cursive',
            color: '#ff4444',
            textShadow: '0 0 30px rgba(255,68,68,0.6), 3px 3px 0 #000',
            background: 'rgba(0,0,0,0.7)',
          }}>
            {hitMessage}
          </div>
        </div>
      )}

      {/* Checkpoint flash */}
      {checkpointFlash && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-2xl font-bold px-4 py-2 rounded-lg" style={{
            fontFamily: 'Bangers, cursive',
            color: '#44ff88',
            textShadow: '0 0 20px rgba(68,255,136,0.6), 2px 2px 0 #000',
            background: 'rgba(0,0,0,0.4)',
          }}>
            {checkpointFlash}
          </div>
        </div>
      )}

      {countdownDisplay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-8xl font-bold px-8 py-4 rounded-2xl" style={{
            fontFamily: 'Bangers, cursive',
            color: countdownDisplay === 'GO!' ? '#44ff88' : '#ffcc44',
            textShadow: '0 0 40px rgba(255,204,68,0.5), 4px 4px 0 #000',
            background: 'rgba(0,0,0,0.6)',
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

      {/* GMGN Chart - bottom left with expand toggle */}
      <div className="absolute bottom-2 left-2 z-10 transition-all duration-300" style={{ 
        width: chartExpanded ? 560 : 48, 
        height: chartExpanded ? 400 : 48 
      }}>
        {chartExpanded ? (
          <div className="rounded-lg overflow-hidden border border-white/10 relative" style={{ background: 'rgba(0,0,0,0.85)', width: '100%', height: '100%' }}>
            <button
              onClick={() => setChartExpanded(false)}
              className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-md"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#ffcc44', fontFamily: 'Bangers', fontSize: '14px', cursor: 'pointer', border: '1px solid rgba(255,204,68,0.3)' }}
            >
              ✕
            </button>
            <iframe
              src="https://www.gmgn.cc/kline/sol/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG?theme=dark"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="$BIGTROUT Chart"
            />
          </div>
        ) : (
          <button
            onClick={() => setChartExpanded(true)}
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'rgba(0,0,0,0.7)', 
              border: '1px solid rgba(255,204,68,0.4)', 
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(255,204,68,0.2)',
            }}
            title="Open $BIGTROUT Chart"
          >
            <span style={{ fontSize: '24px' }}>📊</span>
          </button>
        )}
      </div>

      {/* Radio Player */}
      <GameRadio chartExpanded={chartExpanded} />

      {/* $BIGTROUT Points HUD - bottom left, above chart button */}
      <div className="absolute left-2 z-10 pointer-events-none transition-all duration-300" style={{ bottom: chartExpanded ? 416 : 60 }}>
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2" style={{ minWidth: 180 }}>
          <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Bangers', color: '#44ff88' }}>
            $BIGTROUT POINTS
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: 'Bangers', color: '#ffcc44', textShadow: '2px 2px 0 #000' }}>
            🐟 {troutPoints}
          </div>
          <div className="text-xs mt-1" style={{ fontFamily: 'Rajdhani', color: tokenMultiplier >= 1 ? '#44ff88' : '#ff6644' }}>
            Speed: {(tokenMultiplier * 100).toFixed(0)}% {tokenMultiplier > 1 ? '🔥' : tokenMultiplier < 1 ? '🧊' : ''}
          </div>
          <div className="text-xs" style={{ fontFamily: 'Rajdhani', color: connected ? '#44ff88' : '#888' }}>
            {connected ? '● Live' : '○ Connecting...'}
          </div>
        </div>
      </div>

      {/* Token event message */}
      {tokenMessage && (
        <div className="absolute left-2 z-10 pointer-events-none transition-all duration-300" style={{ bottom: chartExpanded ? 520 : 164 }}>
          <div className="text-lg font-bold px-3 py-1 rounded-md" style={{
            fontFamily: 'Bangers, cursive',
            color: tokenMessage.includes('SELL') ? '#ff4444' : '#44ff88',
            textShadow: '0 0 20px rgba(68,255,136,0.5), 2px 2px 0 #000',
            background: 'rgba(0,0,0,0.7)',
          }}>
            {tokenMessage}
          </div>
        </div>
      )}

      {/* Minimap */}
      <Minimap 
        playerPos={boatPosRef} 
        aiPositions={aiMinimapData}
        boosts={boosts}
      />

      {/* CA Address - bottom center, shifts right when chart+radio expanded */}
      <div className="absolute bottom-2 z-10 transition-all duration-300" style={{
        left: chartExpanded ? 'calc(50% + 200px)' : '50%',
        transform: 'translateX(-50%)',
      }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG');
            const el = document.getElementById('ca-copied');
            if (el) { el.textContent = '✅ Copied!'; setTimeout(() => { el.textContent = 'CA: EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG 📋'; }, 1500); }
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#44ff88',
            border: '1px solid rgba(68,255,136,0.3)',
            backdropFilter: 'blur(4px)',
            textShadow: '0 0 8px rgba(68,255,136,0.4)',
          }}
          title="Click to copy CA"
        >
          <span id="ca-copied">CA: EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG 📋</span>
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 3, -5], fov: 70, near: 0.1, far: 500 }} 
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <AdaptivePerformanceProvider>
          <ambientLight intensity={0.8} color="#6688bb" />
          <directionalLight position={[10, 20, 5]} intensity={1.5} color="#ccddef" />
          <fog attach="fog" args={['#0a1525', 50, 200]} />
          
          <Sky />
          <Ocean tokenMultiplier={tokenMultiplier} />
          <TroutIsland />
          <FishStatue />
          <RaceTrack passedCheckpoints={passedCheckpoints} />
          
          <Boat 
            key={`player-${resetKey}`}
            onPositionUpdate={handleBoatPosition}
            speedRef={wakeSpeedRef}
            posRef={wakePosRef}
            headingRef={wakeHeadingRef}
            raceStarted={state.raceStarted}
            boostMultiplier={boostMultiplier * tokenMultiplier}
            paddleDisabled={paddleDisabled}
            obstacleColliders={obstacleColliders}
          />
          
          {AI_BOATS.map((boat, i) => (
            <AIBoat
              key={`${boat.id}-${resetKey}`}
              id={boat.id}
              color={boat.color}
              speed={state.raceStarted ? boat.speed : 0}
              startOffset={i * 0.3}
              onProgress={handleAIProgress}
              obstacles={obstacles}
              obstacleColliders={obstacleColliders}
            />
          ))}

          {/* Speed boost pickups */}
          {boosts.map(boost => (
            <SpeedBoost
              key={boost.id}
              pickup={boost}
              playerPos={wakePosRef}
              onCollect={handleBoostCollect}
            />
          ))}

          {/* Obstacles */}
          <Obstacles obstacles={obstacles} playerPos={wakePosRef} onHit={handleObstacleHit} />
        </AdaptivePerformanceProvider>
      </Canvas>
    </div>
  );
};
