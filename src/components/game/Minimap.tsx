import { CHECKPOINTS } from './AIBoat';
import { useIsMobile } from '@/hooks/use-mobile';
import * as THREE from 'three';

interface MinimapProps {
  playerPos: React.MutableRefObject<THREE.Vector3>;
  aiPositions: { id: number; color: string; progress: number }[];
  boosts: { position: [number, number, number]; active: boolean }[];
}

// Map world coords to minimap coords
const WORLD_MIN_X = -60;
const WORLD_MAX_X = 60;
const WORLD_MIN_Z = -200;
const WORLD_MAX_Z = 10;
const DESKTOP_SIZE = 160;
const MOBILE_SIZE = 90;

const worldToMap = (wx: number, wz: number, size: number): [number, number] => {
  const mx = ((wx - WORLD_MIN_X) / (WORLD_MAX_X - WORLD_MIN_X)) * size;
  const my = ((wz - WORLD_MIN_Z) / (WORLD_MAX_Z - WORLD_MIN_Z)) * size;
  return [mx, size - my]; // flip Y
};

// Approximate AI position from progress along checkpoints
const getAIWorldPos = (progress: number): [number, number] => {
  const totalCPs = CHECKPOINTS.length;
  const rawIdx = progress % totalCPs;
  const idx = Math.floor(rawIdx);
  const frac = rawIdx - idx;
  const curr = CHECKPOINTS[idx % totalCPs];
  const next = CHECKPOINTS[(idx + 1) % totalCPs];
  return [
    curr[0] + (next[0] - curr[0]) * frac,
    curr[1] + (next[1] - curr[1]) * frac,
  ];
};

export const Minimap = ({ playerPos, aiPositions, boosts }: MinimapProps) => {
  const isMobile = useIsMobile();
  const MAP_SIZE = isMobile ? MOBILE_SIZE : DESKTOP_SIZE;
  const [px, py] = worldToMap(playerPos.current.x, playerPos.current.z, MAP_SIZE);

  return (
    <div className={`absolute z-10 pointer-events-none ${isMobile ? 'bottom-[160px] left-2' : 'bottom-4 right-4'}`} style={{
      width: MAP_SIZE,
      height: MAP_SIZE,
      background: 'rgba(5, 15, 30, 0.75)',
      border: '2px solid rgba(68, 255, 136, 0.3)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Track path */}
      <svg width={MAP_SIZE} height={MAP_SIZE} className="absolute inset-0">
        {/* Track lines */}
        {CHECKPOINTS.map((cp, i) => {
          const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];
          const [x1, y1] = worldToMap(cp[0], cp[1], MAP_SIZE);
          const [x2, y2] = worldToMap(next[0], next[1], MAP_SIZE);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(68, 255, 136, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
          );
        })}
        
        {/* Checkpoints */}
        {CHECKPOINTS.map((cp, i) => {
          const [cx, cy] = worldToMap(cp[0], cp[1], MAP_SIZE);
          return (
            <circle key={`cp-${i}`} cx={cx} cy={cy} r={isMobile ? 2 : 3}
              fill={i === 0 ? '#44ff88' : '#ff8844'} opacity="0.6" />
          );
        })}

        {/* Island marker */}
        {(() => {
          const [ix, iy] = worldToMap(0, -185, MAP_SIZE);
          return (
            <>
              <circle cx={ix} cy={iy} r={isMobile ? 5 : 8} fill="#2d8a4e" opacity="0.5" />
              <text x={ix} y={iy + 3} textAnchor="middle" fontSize={isMobile ? 5 : 7} fill="#44ff88" fontFamily="Bangers">
                🐟
              </text>
            </>
          );
        })()}

        {/* Boost pickups */}
        {boosts.filter(b => b.active).map((b, i) => {
          const [bx, by] = worldToMap(b.position[0], b.position[2], MAP_SIZE);
          return (
            <circle key={`b-${i}`} cx={bx} cy={by} r="2"
              fill="#ffaa00" opacity="0.7" />
          );
        })}

        {/* AI boats */}
        {aiPositions.map(ai => {
          const [wx, wz] = getAIWorldPos(ai.progress);
          const [ax, ay] = worldToMap(wx, wz, MAP_SIZE);
          return (
            <circle key={`ai-${ai.id}`} cx={ax} cy={ay} r={isMobile ? 3 : 4}
              fill={ai.color} stroke="#000" strokeWidth="0.5" opacity="0.9" />
          );
        })}

        {/* Player */}
        <circle cx={px} cy={py} r={isMobile ? 4 : 5} fill="#44ff88" stroke="#fff" strokeWidth="1" />
        <circle cx={px} cy={py} r={isMobile ? 6 : 8} fill="none" stroke="#44ff88" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Legend */}
      <div className="absolute top-1 left-1.5" style={{ fontSize: isMobile ? '6px' : '7px', fontFamily: 'Rajdhani', color: '#888' }}>
        MAP
      </div>
    </div>
  );
};
