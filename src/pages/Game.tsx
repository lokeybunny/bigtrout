import { Suspense, useState } from 'react';
import { GameScene } from '@/components/game/GameScene';

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
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 80%, #0a2a1a 0%, #050d08 50%, #000 100%)',
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2344ff88\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

        <div className="relative z-10 text-center">
          <div className="mb-2 text-6xl">🐟</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{
            fontFamily: 'Bangers, cursive',
            color: '#44ff88',
            textShadow: '0 0 40px rgba(68,255,136,0.4), 4px 4px 0 #000',
            letterSpacing: '0.05em',
          }}>
            $BIGTROUT RACE
          </h1>
          <p className="text-lg mb-12" style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#888',
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
                background: 'rgba(255,255,255,0.05)',
                color: '#888',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}
            >
              ← BACK TO HOME
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs" style={{ fontFamily: 'Rajdhani', color: '#555' }}>
            <span>⌨️ WASD to steer</span>
            <span>⇧ Shift to paddle</span>
            <span>⚡ Collect boosts</span>
            <span>🪨 Avoid rocks</span>
            <span>R to restart</span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'howto') {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0a1a2a 0%, #050d08 50%, #000 100%)',
        }} />

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
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
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
                      color: '#999',
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
            background: 'rgba(68,255,136,0.05)',
            border: '1px solid rgba(68,255,136,0.15)',
          }}>
            <div className="text-xs mb-1" style={{ fontFamily: 'Rajdhani', color: '#44ff88' }}>
              $BIGTROUT CONTRACT
            </div>
            <div className="text-xs font-mono break-all" style={{ color: '#666' }}>
              EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG
            </div>
            <div className="text-xs mt-2" style={{ fontFamily: 'Rajdhani', color: '#555' }}>
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
