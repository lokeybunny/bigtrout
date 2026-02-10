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
import { RenderHealthWatchdog } from './RenderHealthWatchdog';
import { ScenePreloader } from './ScenePreloader';
import { AudioMuteProvider, useAudioMute } from './AudioMuteContext';
import { Minimap } from './Minimap';
import { CircleCollider } from './Colliders';
import { useSolanaTransactions, GameEvent } from '../../hooks/useSolanaTransactions';
import { useGameSFX } from '../../hooks/useGameSFX';
import { OpponentBoat } from './OpponentBoat';
import { supabase } from '@/integrations/supabase/client';

interface MultiplayerData {
  matchId: string;
  playerId: string;
  playerName: string;
  playerFish: string;
  opponentName: string;
  opponentFish: string;
  isPlayer1: boolean;
}

interface GameSceneProps {
  mode?: 'singleplayer' | 'multiplayer';
  multiplayerData?: MultiplayerData;
  onExitToMenu?: () => void;
}

interface RaceState {
  playerCheckpoint: number;
  playerLap: number;
  positions: { id: number | 'player'; progress: number }[];
  finished: boolean;
  finishPlace: number | null;
  countdown: number | null;
  raceStarted: boolean;
}

// AI boats removed from singleplayer — solo time trial mode

const FISH_COLORS: Record<string, string> = {
  trout: '#2d8a4e',
  blowfish: '#cc9933',
  shark: '#5566aa',
  octopus: '#9933cc',
};

const MULTIPLAYER_LAPS = 5;
const CHECKPOINT_RADIUS = 8;
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

const formatTime = (ms: number) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
};

const GameSceneInner = ({ mode = 'singleplayer', multiplayerData, onExitToMenu }: GameSceneProps) => {
  const isMultiplayer = mode === 'multiplayer';
  const totalLaps = isMultiplayer ? MULTIPLAYER_LAPS : TOTAL_LAPS;

  const { muteAll, muteSFX } = useAudioMute();
  const playSFXRaw = useGameSFX();
  const playSFX = useCallback((type: Parameters<typeof playSFXRaw>[0]) => {
    if (muteAll || muteSFX) return;
    playSFXRaw(type);
  }, [muteAll, muteSFX, playSFXRaw]);
  const boatPosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeSpeedRef = useRef(0);
  const wakePosRef = useRef(new THREE.Vector3(0, 0, -15));
  const wakeHeadingRef = useRef(0);

  const [boosts, setBoosts] = useState<BoostPickup[]>(() => generateBoosts());
  const [obstacles] = useState<Obstacle[]>(() => generateObstacles());
  const obstacleColliders = useMemo<CircleCollider[]>(() => 
    obstacles.map(obs => ({ x: obs.position[0], z: obs.position[2], radius: obs.radius, label: obs.type })),
    [obstacles]
  );
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [boostTimer, setBoostTimer] = useState(0);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [hitMessage, setHitMessage] = useState<string | null>(null);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [webglLost, setWebglLost] = useState(false);
  const webglLostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [passedCheckpoints, setPassedCheckpoints] = useState<Set<number>>(new Set());
  const [checkpointFlash, setCheckpointFlash] = useState<string | null>(null);
  const [paddleDisabled, setPaddleDisabled] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Multiplayer state
  const raceStartTimeRef = useRef(0);
  const [raceTimeMs, setRaceTimeMs] = useState(0);
  const [opponentLap, setOpponentLap] = useState(0);
  const [opponentCheckpoint, setOpponentCheckpoint] = useState(0);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [opponentFinishTime, setOpponentFinishTime] = useState<number | null>(null);
  const [playerFinishTime, setPlayerFinishTime] = useState<number | null>(null);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);

  // Spawn offsets: player1 on left, player2 on right (side by side)
  const playerStartX = isMultiplayer && multiplayerData ? (multiplayerData.isPlayer1 ? -3 : 3) : 0;
  const opponentStartX = isMultiplayer && multiplayerData ? (multiplayerData.isPlayer1 ? 3 : -3) : 5;

  // Opponent position ref for 3D rendering (updated via broadcast)
  const opponentPosRef = useRef({ x: opponentStartX, z: -15, heading: 0 });
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastThrottleRef = useRef(0);

  // $BIGTROUT points
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
    positions: [{ id: 'player', progress: 0 }],
    finished: false,
    finishPlace: null,
    countdown: 3,
    raceStarted: false,
  });

  const playerProgressRef = useRef(0);
  const lastCheckpointRef = useRef(0);
  const playerLapRef = useRef(0);
  const aiProgressRef = useRef<Record<number, number>>({});
  const finishOrderRef = useRef<(number | 'player')[]>([]);

  // Setup multiplayer broadcast channel
  useEffect(() => {
    if (!isMultiplayer || !multiplayerData) return;

    const channel = supabase.channel(`race-broadcast-${multiplayerData.matchId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'position' }, ({ payload }) => {
      if (payload.playerId !== multiplayerData.playerId) {
        opponentPosRef.current = { x: payload.x, z: payload.z, heading: payload.heading };
        setOpponentLap(payload.lap || 0);
        setOpponentCheckpoint(payload.checkpoint || 0);
        if (payload.finished) {
          setOpponentFinished(true);
          setOpponentFinishTime(payload.finishTimeMs);
        }
      }
    });

    channel.subscribe();
    broadcastChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      broadcastChannelRef.current = null;
    };
  }, [isMultiplayer, multiplayerData]);

  // Reset race (single player only)
  const resetRace = useCallback(() => {
    if (isMultiplayer) return;
    playerProgressRef.current = 0;
    lastCheckpointRef.current = 0;
    playerLapRef.current = 0;
    finishOrderRef.current = [];
    boatPosRef.current.set(0, 0, -15);
    boostEndTimeRef.current = 0;
    raceStartTimeRef.current = 0;
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
    setRaceTimeMs(0);
    setPlayerFinishTime(null);
    setResetKey(prev => prev + 1);
    setCountdownDisplay('3');
    setState({
      playerCheckpoint: 0, playerLap: 0,
      positions: [{ id: 'player', progress: 0 }],
      finished: false, finishPlace: null, countdown: 3, raceStarted: false,
    });
    setTimeout(() => setCountdownDisplay('2'), 1000);
    setTimeout(() => setCountdownDisplay('1'), 2000);
    setTimeout(() => { setCountdownDisplay('GO!'); raceStartTimeRef.current = performance.now(); setState(prev => ({ ...prev, raceStarted: true, countdown: null })); }, 3000);
    setTimeout(() => setCountdownDisplay(null), 3800);
  }, [isMultiplayer]);

  // R key to reset (single player only)
  useEffect(() => {
    if (isMultiplayer) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'r' || e.key === 'R') resetRace(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetRace, isMultiplayer]);

  // Countdown
  const [countdownDisplay, setCountdownDisplay] = useState<string | null>('3');
  const countdownStarted = useRef(false);

  if (!countdownStarted.current) {
    countdownStarted.current = true;
    setTimeout(() => setCountdownDisplay('2'), 1000);
    setTimeout(() => setCountdownDisplay('1'), 2000);
    setTimeout(() => {
      setCountdownDisplay('GO!');
      raceStartTimeRef.current = performance.now();
      setState(prev => ({ ...prev, raceStarted: true, countdown: null }));
    }, 3000);
    setTimeout(() => setCountdownDisplay(null), 3800);
  }

  // Race timer (both modes)
  useEffect(() => {
    if (!state.raceStarted || state.finished) return;
    let raf: number;
    const tick = () => { setRaceTimeMs(performance.now() - raceStartTimeRef.current); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.raceStarted, state.finished]);

  // Boost timer decay
  const boostEndTimeRef = useRef(0);

  useEffect(() => {
    if (boostMultiplier === 1) return;
    let raf: number;
    let lastUpdate = 0;
    const tick = (now: number) => {
      const remaining = Math.max(0, (boostEndTimeRef.current - performance.now()) / 1000);
      if (remaining <= 0) { setBoostMultiplier(1); setBoostTimer(0); setBoostMessage(null); }
      else { if (now - lastUpdate > 250) { setBoostTimer(remaining); lastUpdate = now; } raf = requestAnimationFrame(tick); }
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

  // Broadcast position to opponent
  const broadcastPosition = useCallback((pos: THREE.Vector3, heading: number, lap: number, checkpoint: number, finished = false, finishTimeMs = 0) => {
    if (!broadcastChannelRef.current || !multiplayerData) return;
    const now = performance.now();
    if (!finished && now - broadcastThrottleRef.current < 50) return; // ~20Hz
    broadcastThrottleRef.current = now;

    broadcastChannelRef.current.send({
      type: 'broadcast',
      event: 'position',
      payload: {
        playerId: multiplayerData.playerId,
        x: pos.x,
        z: pos.z,
        heading,
        lap,
        checkpoint,
        finished,
        finishTimeMs,
      },
    });
  }, [multiplayerData]);

  const handleBoatPosition = useCallback((pos: THREE.Vector3, heading: number) => {
    boatPosRef.current.copy(pos);

    // Broadcast in multiplayer
    if (isMultiplayer) {
      broadcastPosition(pos, heading, playerLapRef.current, lastCheckpointRef.current);
    }

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

      if (playerLapRef.current >= totalLaps && !finishOrderRef.current.includes('player')) {
        finishOrderRef.current.push('player');
        const finishTime = performance.now() - raceStartTimeRef.current;
        setPlayerFinishTime(finishTime);

        if (isMultiplayer && multiplayerData) {
          broadcastPosition(pos, heading, playerLapRef.current, cp, true, Math.round(finishTime));

          supabase.from('race_positions').update({
            lap: playerLapRef.current, finished: true, finish_time_ms: Math.round(finishTime),
          }).eq('match_id', multiplayerData.matchId).eq('player_id', multiplayerData.playerId).then(() => {});

          supabase.from('leaderboard').insert({
            username: multiplayerData.playerName, time_ms: Math.round(finishTime), laps: totalLaps, mode: 'multiplayer',
          }).then(() => setLeaderboardSubmitted(true));
        } else {
          // Submit singleplayer time to leaderboard
          supabase.from('leaderboard').insert({
            username: 'Player', time_ms: Math.round(finishTime), laps: totalLaps, mode: 'singleplayer',
          }).then(() => setLeaderboardSubmitted(true));
        }

        setState(prev => ({ ...prev, finished: true, finishPlace: 1, playerCheckpoint: cp, playerLap: playerLapRef.current }));
        return;
      }

      setState(prev => ({ ...prev, playerCheckpoint: cp, playerLap: playerLapRef.current }));
    }

    const now = performance.now();
    if (now - posUpdateThrottleRef.current > 250) {
      posUpdateThrottleRef.current = now;
      updatePositions();
    }
  }, [isMultiplayer, multiplayerData, totalLaps, broadcastPosition]);

  const handleAIProgress = useCallback((_id: number, _progress: number, _lap: number) => {
    // AI boats removed — no-op kept for type compatibility
  }, []);

  const updatePositions = useCallback(() => {
    setState(prev => ({ ...prev, positions: [{ id: 'player' as const, progress: playerProgressRef.current }] }));
  }, []);

  const aiMinimapData: { id: number; color: string; progress: number }[] = [];

  const opponentColor = multiplayerData ? (FISH_COLORS[multiplayerData.opponentFish] || '#cc9933') : '#cc9933';
  const playerColor = multiplayerData ? (FISH_COLORS[multiplayerData.playerFish] || '#2d8a4e') : '#2d8a4e';

  return (
    <div className="relative w-full h-screen" style={{ cursor: 'crosshair' }}>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-start justify-between max-w-5xl mx-auto">
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold" style={{ fontFamily: 'Bangers, cursive', color: '#44ff88', textShadow: '0 0 20px rgba(68,255,136,0.5), 2px 2px 0 #000' }}>
              LAP {Math.min(playerLapRef.current + 1, totalLaps)} / {totalLaps}
            </div>
            <div className="text-lg" style={{ fontFamily: 'Bangers, cursive', color: '#ffcc44', textShadow: '2px 2px 0 #000' }}>
              Checkpoint: {lastCheckpointRef.current + 1} / {CHECKPOINTS.length}
            </div>
            {/* Race timer — always show */}
            <div className="text-lg font-mono" style={{ color: '#fff', textShadow: '2px 2px 0 #000' }}>
              ⏱️ {formatTime(state.finished ? (playerFinishTime || raceTimeMs) : raceTimeMs)}
            </div>
            <div className="text-sm mt-1" style={{ fontFamily: 'Rajdhani', color: '#aaa' }}>
              ⌨️ WASD to steer • ⇧ Shift to paddle • Collect ⚡ • Avoid 🪨{!isMultiplayer && ' • R to restart'}
            </div>
            {boostMultiplier > 1 && (
              <div className="mt-1">
                <div className="text-sm font-bold" style={{ fontFamily: 'Bangers', color: '#ffaa00' }}>⚡ BOOST {boostTimer.toFixed(1)}s</div>
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(boostTimer / 4) * 100}%`, background: 'linear-gradient(90deg, #ff6600, #ffcc00)' }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Opponent info (multiplayer) */}
            {isMultiplayer && multiplayerData && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[160px]">
                <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Bangers', color: '#ffcc44' }}>⚔️ VS</div>
                <div className="text-sm font-bold" style={{ fontFamily: 'Rajdhani', color: opponentColor }}>
                  {multiplayerData.opponentName}
                </div>
                <div className="text-xs" style={{ fontFamily: 'Rajdhani', color: opponentFinished ? '#ffd700' : '#888' }}>
                  {opponentFinished
                    ? `🏁 Finished: ${formatTime(opponentFinishTime || 0)}`
                    : `Lap ${Math.min(opponentLap + 1, totalLaps)}/${totalLaps} • CP ${opponentCheckpoint + 1}`
                  }
                </div>
              </div>
            )}

            {/* EXIT button (singleplayer) */}
            {!isMultiplayer && onExitToMenu && (
              <button onClick={onExitToMenu} className="pointer-events-auto px-4 py-2 rounded-lg font-bold" style={{ fontFamily: 'Bangers', background: 'rgba(0,0,0,0.6)', color: '#ff6644', border: '1px solid rgba(255,102,68,0.4)', cursor: 'pointer' }}>
                🚪 EXIT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Boost/hit/checkpoint messages */}
      {boostMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-3xl font-bold px-4 py-1 rounded-lg" style={{ fontFamily: 'Bangers, cursive', color: '#ffaa00', textShadow: '0 0 30px rgba(255,170,0,0.6), 3px 3px 0 #000', background: 'rgba(0,0,0,0.7)', animation: 'floatUp 2s ease-out forwards' }}>{boostMessage}</div>
        </div>
      )}
      {hitMessage && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-3xl font-bold px-4 py-1 rounded-lg" style={{ fontFamily: 'Bangers, cursive', color: '#ff4444', textShadow: '0 0 30px rgba(255,68,68,0.6), 3px 3px 0 #000', background: 'rgba(0,0,0,0.7)' }}>{hitMessage}</div>
        </div>
      )}
      {checkpointFlash && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-2xl font-bold px-4 py-2 rounded-lg" style={{ fontFamily: 'Bangers, cursive', color: '#44ff88', textShadow: '0 0 20px rgba(68,255,136,0.6), 2px 2px 0 #000', background: 'rgba(0,0,0,0.4)' }}>{checkpointFlash}</div>
        </div>
      )}

      {countdownDisplay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-8xl font-bold px-8 py-4 rounded-2xl" style={{ fontFamily: 'Bangers, cursive', color: countdownDisplay === 'GO!' ? '#44ff88' : '#ffcc44', textShadow: '0 0 40px rgba(255,204,68,0.5), 4px 4px 0 #000', background: 'rgba(0,0,0,0.6)' }}>
            {countdownDisplay}
          </div>
        </div>
      )}

      {/* Finish overlay */}
      {state.finished && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="text-center">
            {isMultiplayer ? (
              <>
                <div className="text-6xl font-bold mb-4" style={{
                  fontFamily: 'Bangers, cursive',
                  color: (!opponentFinished || (playerFinishTime && opponentFinishTime && playerFinishTime < opponentFinishTime)) ? '#ffd700' : '#ff6644',
                  textShadow: '0 0 30px rgba(255,215,0,0.5), 4px 4px 0 #000',
                }}>
                  {!opponentFinished ? '🏁 RACE COMPLETE!' : (playerFinishTime && opponentFinishTime && playerFinishTime < opponentFinishTime) ? '🏆 YOU WIN!' : '💀 YOU LOST!'}
                </div>
                {playerFinishTime && (
                  <div className="mb-4">
                    <div className="text-3xl font-mono font-bold" style={{ color: '#44ff88', textShadow: '2px 2px 0 #000' }}>
                      ⏱️ Your time: {formatTime(playerFinishTime)}
                    </div>
                    {opponentFinished && opponentFinishTime && (
                      <div className="text-lg mt-2" style={{ fontFamily: 'Rajdhani', color: '#ffcc44' }}>
                        {multiplayerData?.opponentName}: {formatTime(opponentFinishTime)}
                      </div>
                    )}
                    {!opponentFinished && (
                      <div className="text-sm mt-2 animate-pulse" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
                        Waiting for {multiplayerData?.opponentName} to finish...
                      </div>
                    )}
                    {leaderboardSubmitted && (
                      <div className="text-xs mt-1" style={{ fontFamily: 'Rajdhani', color: '#44ff88' }}>✅ Time submitted to leaderboard</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl font-bold mb-4" style={{
                  fontFamily: 'Bangers, cursive',
                  color: '#ffd700',
                  textShadow: '0 0 30px rgba(255,215,0,0.5), 4px 4px 0 #000',
                }}>
                  🏁 RACE COMPLETE!
                </div>
                {playerFinishTime && (
                  <div className="text-3xl font-mono font-bold mb-2" style={{ color: '#44ff88', textShadow: '2px 2px 0 #000' }}>
                    ⏱️ {formatTime(playerFinishTime)}
                  </div>
                )}
                {leaderboardSubmitted && (
                  <div className="text-xs mb-2" style={{ fontFamily: 'Rajdhani', color: '#44ff88' }}>✅ Time submitted to leaderboard</div>
                )}
              </>
            )}

            <div className="text-2xl mb-6" style={{ fontFamily: 'Bangers', color: '#44ff88', textShadow: '2px 2px 0 #000' }}>
              You reached $BIGTROUT Island!
            </div>

            <div className="flex gap-4 justify-center">
              {isMultiplayer ? (
                <button onClick={onExitToMenu} className="px-8 py-3 rounded-lg font-bold text-lg" style={{ fontFamily: 'Bangers', background: 'linear-gradient(135deg, #2d8a4e, #44ff88)', color: '#0a1525', cursor: 'pointer', letterSpacing: '0.1em' }}>
                  BACK TO MENU
                </button>
              ) : (
                <button onClick={() => window.location.reload()} className="px-8 py-3 rounded-lg font-bold text-lg" style={{ fontFamily: 'Bangers', background: 'linear-gradient(135deg, #2d8a4e, #44ff88)', color: '#0a1525', cursor: 'pointer', letterSpacing: '0.1em' }}>
                  RACE AGAIN
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="absolute bottom-2 left-2 z-10 transition-all duration-300" style={{ width: chartExpanded ? 560 : 48, height: chartExpanded ? 400 : 48 }}>
        {chartExpanded ? (
          <div className="rounded-lg overflow-hidden border border-white/10 relative" style={{ background: 'rgba(0,0,0,0.85)', width: '100%', height: '100%' }}>
            <button onClick={() => setChartExpanded(false)} className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-md" style={{ background: 'rgba(0,0,0,0.7)', color: '#ffcc44', fontFamily: 'Bangers', fontSize: '14px', cursor: 'pointer', border: '1px solid rgba(255,204,68,0.3)' }}>✕</button>
            <iframe src="https://www.gmgn.cc/kline/sol/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG?theme=dark" width="100%" height="100%" style={{ border: 'none' }} title="$BIGTROUT Chart" />
          </div>
        ) : (
          <button onClick={() => setChartExpanded(true)} className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,204,68,0.4)', cursor: 'pointer', boxShadow: '0 0 12px rgba(255,204,68,0.2)' }} title="Open $BIGTROUT Chart">
            <span style={{ fontSize: '24px' }}>📊</span>
          </button>
        )}
      </div>

      <GameRadio chartExpanded={chartExpanded} />

      {/* Points HUD */}
      <div className="absolute left-2 z-10 pointer-events-none transition-all duration-300" style={{ bottom: chartExpanded ? 416 : 60 }}>
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2" style={{ minWidth: 180 }}>
          <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Bangers', color: '#44ff88' }}>$BIGTROUT POINTS</div>
          <div className="text-2xl font-bold" style={{ fontFamily: 'Bangers', color: '#ffcc44', textShadow: '2px 2px 0 #000' }}>🐟 {troutPoints}</div>
          <div className="text-xs mt-1" style={{ fontFamily: 'Rajdhani', color: tokenMultiplier >= 1 ? '#44ff88' : '#ff6644' }}>
            Speed: {(tokenMultiplier * 100).toFixed(0)}% {tokenMultiplier > 1 ? '🔥' : tokenMultiplier < 1 ? '🧊' : ''}
          </div>
          
        </div>
      </div>

      {tokenMessage && (
        <div className="absolute left-2 z-10 pointer-events-none transition-all duration-300" style={{ bottom: chartExpanded ? 520 : 164 }}>
          <div className="text-lg font-bold px-3 py-1 rounded-md" style={{ fontFamily: 'Bangers, cursive', color: tokenMessage.includes('SELL') ? '#ff4444' : '#44ff88', textShadow: '0 0 20px rgba(68,255,136,0.5), 2px 2px 0 #000', background: 'rgba(0,0,0,0.7)' }}>{tokenMessage}</div>
        </div>
      )}

      <Minimap playerPos={boatPosRef} aiPositions={aiMinimapData} boosts={boosts} />

      {/* WebGL context loss recovery overlay */}
      {webglLost && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,21,37,0.95)' }}>
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bangers, cursive', color: '#ffcc44', textShadow: '2px 2px 0 #000' }}>
              RENDER LOST
            </div>
            <div className="text-sm mb-6" style={{ fontFamily: 'Rajdhani', color: '#aaa' }}>
              GPU context was lost. This can happen on mobile or with heavy browser tabs.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ fontFamily: 'Bangers', background: 'linear-gradient(135deg, #1a6b3a, #44ff88)', color: '#0a1525', cursor: 'pointer', border: 'none', letterSpacing: '0.1em', boxShadow: '0 0 30px rgba(68,255,136,0.3)' }}
            >
              🔄 RELOAD GAME
            </button>
          </div>
        </div>
      )}

      {/* CA */}
      <div className="absolute bottom-2 z-10 transition-all duration-300" style={{ left: chartExpanded ? 'calc(50% + 200px)' : '50%', transform: 'translateX(-50%)' }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG');
            const el = document.getElementById('ca-copied');
            if (el) { el.textContent = '✅ Copied!'; setTimeout(() => { el.textContent = 'CA: EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG 📋'; }, 1500); }
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#44ff88', border: '1px solid rgba(68,255,136,0.3)', backdropFilter: 'blur(4px)', textShadow: '0 0 8px rgba(68,255,136,0.4)' }}
          title="Click to copy CA"
        >
          <span id="ca-copied">CA: EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG 📋</span>
        </button>
      </div>

      {/* Background layer — covers white flash during WebGL context loss/restore */}
      <div className="absolute inset-0" style={{ background: '#0a1525', zIndex: 0 }} />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3, -5], fov: 70, near: 0.1, far: 500 }}
        dpr={1}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, depth: true, alpha: false, failIfMajorPerformanceCaveat: false }}
        shadows={false}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor('#0a1525', 1);
          gl.clear();
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[WebGL] Context lost');
            // Close chart to free GPU memory
            setChartExpanded(false);
            // Show recovery overlay after 3s if not restored
            if (webglLostTimerRef.current) clearTimeout(webglLostTimerRef.current);
            webglLostTimerRef.current = setTimeout(() => {
              setWebglLost(true);
            }, 3000);
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('[WebGL] Context restored');
            if (webglLostTimerRef.current) {
              clearTimeout(webglLostTimerRef.current);
              webglLostTimerRef.current = null;
            }
            setWebglLost(false);
            gl.setClearColor('#0a1525', 1);
            gl.clear();
            let frames = 0;
            const waitForFrame = () => {
              frames++;
              if (frames >= 5) {
                canvas.style.visibility = 'visible';
              } else {
                requestAnimationFrame(waitForFrame);
              }
            };
            requestAnimationFrame(waitForFrame);
          });
        }}
        style={{ background: '#0a1525', position: 'relative', zIndex: 1 }}
      >
        <AdaptivePerformanceProvider>
          <ScenePreloader />
          <RenderHealthWatchdog />
          <ambientLight intensity={0.8} color="#6688bb" />
          <fog attach="fog" args={['#0a1525', 50, 200]} />
          <Sky />
          <Ocean tokenMultiplier={tokenMultiplier} />
          <TroutIsland />
          <FishStatue />
          <RaceTrack passedCheckpoints={passedCheckpoints} />

          <Boat key={`player-${resetKey}`} onPositionUpdate={handleBoatPosition} speedRef={wakeSpeedRef} posRef={wakePosRef} headingRef={wakeHeadingRef} raceStarted={state.raceStarted} boostMultiplier={boostMultiplier * tokenMultiplier} paddleDisabled={paddleDisabled} obstacleColliders={obstacleColliders} startX={playerStartX} fishColor={playerColor} />

          {/* Opponent boat (multiplayer only) */}

          {/* Opponent boat (multiplayer only) */}
          {isMultiplayer && multiplayerData && (
            <OpponentBoat posRef={opponentPosRef} color={opponentColor} />
          )}

          {boosts.map(boost => (
            <SpeedBoost key={boost.id} pickup={boost} playerPos={wakePosRef} onCollect={handleBoostCollect} />
          ))}
          <Obstacles obstacles={obstacles} playerPos={wakePosRef} onHit={handleObstacleHit} />
        </AdaptivePerformanceProvider>
      </Canvas>
    </div>
  );
};

export const GameScene = (props: GameSceneProps) => (
  <AudioMuteProvider>
    <GameSceneInner {...props} />
  </AudioMuteProvider>
);
