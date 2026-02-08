import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GameScene } from '@/components/game/GameScene';

const Game = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm"
        style={{ fontFamily: 'Rajdhani, sans-serif', cursor: 'pointer' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back</span>
      </Link>

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
