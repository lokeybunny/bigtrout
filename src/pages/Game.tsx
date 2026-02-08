import { Suspense, useState } from 'react';
import { GameScene } from '@/components/game/GameScene';

const Game = () => {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 80%, #0a2a1a 0%, #050d08 50%, #000 100%)',
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2344ff88\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Logo / Title */}
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

          {/* Buttons */}
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => setStarted(true)}
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

          {/* Controls hint */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs" style={{ fontFamily: 'Rajdhani', color: '#555' }}>
            <span>⌨️ WASD to steer</span>
            <span>⇧ Shift to paddle</span>
            <span>⚡ Collect boosts</span>
            <span>🪨 Avoid rocks</span>
            <span>R to restart</span>
          </div>
        </div>

        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(68,255,136,0.3), 0 4px 20px rgba(0,0,0,0.5); }
            50% { box-shadow: 0 0 50px rgba(68,255,136,0.5), 0 4px 20px rgba(0,0,0,0.5); }
          }
        `}</style>
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
