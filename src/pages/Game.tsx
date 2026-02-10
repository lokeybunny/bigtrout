import { Suspense, useState } from 'react';
import { GameScene } from '@/components/game/GameScene';
import raceMenuBg from '@/assets/game-landing-bg.jpeg';
import raceHowtoBg from '@/assets/bigtrout-race-howto.png';

type Screen = 'menu' | 'howto' | 'playing';

const HOW_IT_WORKS = [
  {
    icon: '⛵',
    title: 'RACE TO THE ISLAND',
    desc: 'Navigate your sailboat through checkpoints across 10 laps. Use WASD to steer and Shift to paddle faster. First to reach $BIGTROUT Island wins!',
  },
  {
    icon: '🔗',
    title: 'LIVE SOLANA INTEGRATION',
    desc: 'The game connects to the Solana blockchain in real-time, tracking live $BIGTROUT token transactions as they happen on-chain.',
  },
  {
    icon: '🚀',
    title: 'BUYS = SPEED BOOST',
    desc: 'When someone buys $BIGTROUT, your boat gets a speed boost! Big buys give bigger boosts and earn you $BIGTROUT points. The more the community buys, the faster you go!',
  },
  {
    icon: '🐙',
    title: 'SELLS = SLOWDOWN',
    desc: 'When someone sells $BIGTROUT, your boat slows down temporarily. Sell streaks cost you $BIGTROUT points. Diamond hands = faster racing!',
  },
  {
    icon: '⚡',
    title: 'COLLECT & AVOID',
    desc: 'Grab ⚡ speed boost pickups scattered on the track. Watch out for 🪨 rocks and 🌊 rough waves that slow you down!',
  },
  {
    icon: '📊',
    title: 'LIVE CHART & RADIO',
    desc: 'Open the live GMGN chart to watch $BIGTROUT price action while racing. Vibe out to the World Radio with genres from Lo-Fi to Rock!',
  },
];

const Game = () => {
  const [screen, setScreen] = useState<Screen>('menu');

  if (screen === 'menu') {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        {/* Background image */}
        <img
          src={raceMenuBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.15) 100%)',
        }} />

        <div className="relative z-10 text-center mt-auto pb-12 md:pb-16 px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{
            fontFamily: 'Bangers, cursive',
            color: '#44ff88',
            textShadow: '0 0 40px rgba(68,255,136,0.4), 4px 4px 0 #000',
            letterSpacing: '0.05em',
          }}>
            $BIGTROUT RACE
          </h1>
          <p className="text-lg mb-10" style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#ccc',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            Race to the island. Collect boosts. Avoid obstacles. 🏁
          </p>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => setScreen('howto')}
              className="px-12 py-4 rounded-xl font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'Bangers, cursive',
                background: 'linear-gradient(135deg, #1a6b3a, #44ff88)',
                color: '#0a1525',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 0 30px rgba(68,255,136,0.3), 0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              🏁 PLAY GAME
            </button>

            <a
              href="https://bigtrout.fun"
              className="px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'Bangers, cursive',
                background: 'rgba(0,0,0,0.6)',
                color: '#ccc',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
                backdropFilter: 'blur(4px)',
              }}
            >
              ← BACK TO HOME
            </a>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm" style={{
            fontFamily: 'Bangers, cursive',
            letterSpacing: '0.05em',
          }}>
            {['⌨️ WASD to steer', '⇧ Shift to paddle', '⚡ Collect boosts', '🪨 Avoid rocks', 'R to restart'].map((txt) => (
              <span key={txt} className="px-3 py-1.5 rounded-lg" style={{
                background: 'rgba(0,0,0,0.6)',
                color: '#44ff88',
                border: '1px solid rgba(68,255,136,0.3)',
                backdropFilter: 'blur(4px)',
              }}>{txt}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'howto') {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <img
          src={raceHowtoBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 overflow-y-auto max-h-screen">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{
            fontFamily: 'Bangers, cursive',
            color: '#ffcc44',
            textShadow: '0 0 20px rgba(255,204,68,0.3), 3px 3px 0 #000',
            letterSpacing: '0.05em',
          }}>
            🎮 HOW IT WORKS
          </h2>
          <p className="text-center mb-8 text-sm" style={{ fontFamily: 'Rajdhani', color: '#666' }}>
            $BIGTROUT RACE is powered by live Solana blockchain data
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(68,255,136,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{
                      fontFamily: 'Bangers, cursive',
                      color: '#44ff88',
                      letterSpacing: '0.05em',
                    }}>
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      color: '#ddd',
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Token info */}
          <div className="rounded-xl p-4 mb-8 text-center" style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(68,255,136,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <div className="text-sm font-bold mb-2" style={{ fontFamily: 'Bangers, cursive', color: '#44ff88', letterSpacing: '0.05em' }}>
              $BIGTROUT CONTRACT
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG');
              }}
              className="text-sm font-mono break-all px-3 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              style={{
                color: '#fff',
                background: 'rgba(68,255,136,0.1)',
                border: '1px solid rgba(68,255,136,0.2)',
              }}
              title="Click to copy"
            >
              EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG 📋
            </button>
            <div className="text-xs mt-2" style={{ fontFamily: 'Rajdhani', color: '#ccc' }}>
              0% Tax • 100% Locked Liquidity
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setScreen('playing')}
              className="px-10 py-4 rounded-xl font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                fontFamily: 'Bangers, cursive',
                background: 'linear-gradient(135deg, #1a6b3a, #44ff88)',
                color: '#0a1525',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 0 30px rgba(68,255,136,0.3), 0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              🚀 START RACE
            </button>

            <button
              onClick={() => setScreen('menu')}
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
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Game title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-bold px-4 py-1 rounded-lg" style={{ 
          fontFamily: 'Bangers, cursive',
          color: '#44ff88',
          textShadow: '0 0 20px rgba(68,255,136,0.4), 3px 3px 0 #000',
          letterSpacing: '0.05em',
          background: 'rgba(0,0,0,0.8)',
        }}>
          🏁 $BIGTROUT RACE
        </h1>
      </div>

      {/* Exit button */}
      <a
        href="https://bigtrout.fun"
        className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          fontFamily: 'Bangers, cursive',
          background: 'rgba(0,0,0,0.8)',
          color: '#888',
          letterSpacing: '0.05em',
          border: '1px solid rgba(255,255,255,0.1)',
          textDecoration: 'none',
        }}
      >
        🚪 EXIT
      </a>

      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⛵</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'Bangers', color: '#44ff88' }}>
              Preparing the race...
            </div>
          </div>
        </div>
      }>
        <GameScene />
      </Suspense>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
};

export default Game;
