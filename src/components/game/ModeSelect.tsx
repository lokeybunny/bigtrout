import raceHowtoBg from '@/assets/bigtrout-race-howto.png';

interface ModeSelectProps {
  onSinglePlayer: () => void;
  onMultiplayer: () => void;
  onLeaderboard: () => void;
  onBack: () => void;
}

export const ModeSelect = ({ onSinglePlayer, onMultiplayer, onLeaderboard, onBack }: ModeSelectProps) => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <img src={raceHowtoBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{
          fontFamily: 'Bangers, cursive',
          color: '#44ff88',
          textShadow: '0 0 30px rgba(68,255,136,0.4), 3px 3px 0 #000',
          letterSpacing: '0.05em',
        }}>
          CHOOSE YOUR MODE
        </h2>
        <p className="text-sm mb-10" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
          Race solo against AI or challenge another player online
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8">
          {/* Single Player */}
          <button
            onClick={onSinglePlayer}
            className="w-64 rounded-xl p-6 transition-all duration-200 hover:scale-105 active:scale-95 text-left"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid rgba(68,255,136,0.3)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
          >
            <div className="text-3xl mb-2">⛵</div>
            <div className="text-xl font-bold mb-1" style={{
              fontFamily: 'Bangers, cursive',
              color: '#44ff88',
              letterSpacing: '0.05em',
            }}>
              SINGLE PLAYER
            </div>
            <p className="text-xs" style={{ fontFamily: 'Rajdhani', color: '#aaa' }}>
              Race 10 laps against 5 AI boats. Use R to restart anytime.
            </p>
          </button>

          {/* Multiplayer */}
          <button
            onClick={onMultiplayer}
            className="w-64 rounded-xl p-6 transition-all duration-200 hover:scale-105 active:scale-95 text-left"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid rgba(255,204,68,0.4)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
          >
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-xl font-bold mb-1" style={{
              fontFamily: 'Bangers, cursive',
              color: '#ffcc44',
              letterSpacing: '0.05em',
            }}>
              MULTIPLAYER 1v1
            </div>
            <p className="text-xs" style={{ fontFamily: 'Rajdhani', color: '#aaa' }}>
              5-lap timed race against a real player. Pick your fish head. No restarts!
            </p>
          </button>
        </div>

        {/* Leaderboard button */}
        <button
          onClick={onLeaderboard}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 mb-6"
          style={{
            fontFamily: 'Bangers, cursive',
            background: 'rgba(255,204,68,0.15)',
            color: '#ffcc44',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            border: '1px solid rgba(255,204,68,0.3)',
          }}
        >
          🏆 LEADERBOARD
        </button>

        <div className="block">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: 'Bangers, cursive',
              background: 'rgba(255,255,255,0.05)',
              color: '#888',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
};
