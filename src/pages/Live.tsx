import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Radio, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const STREAM_URL = 'https://x.com/i/broadcasts/1mnxeNARBBQKX';

const Live = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Dark night sky with fire glow at top */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(20 100% 45% / 0.35) 0%, hsl(25 100% 40% / 0.15) 30%, transparent 60%),
            radial-gradient(ellipse at 30% 10%, hsl(35 100% 50% / 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 5%, hsl(15 100% 45% / 0.18) 0%, transparent 35%),
            linear-gradient(180deg, 
              hsl(220 40% 4%) 0%, 
              hsl(230 35% 5%) 30%,
              hsl(240 30% 4%) 60%, 
              hsl(235 35% 3%) 100%
            )
          `,
        }}
      />

      {/* Ember particles rising */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: `radial-gradient(circle, hsl(${15 + Math.random() * 25} 100% 60%), transparent)`,
              boxShadow: `0 0 6px hsl(${15 + Math.random() * 25} 100% 50% / 0.6)`,
              animation: `fireDustRise ${5 + Math.random() * 5}s ease-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-sm tracking-wider">BACK HOME</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center glow-fire relative"
              style={{
                background: 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))',
              }}
            >
              <Radio className="w-7 h-7 text-storm-dark" />
              {/* Pulsing live dot */}
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse border-2 border-background" />
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black">
              <span className="text-fire">LIVE</span>{' '}
              <span className="text-ice">STREAM</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mb-16">
            Tune into the official $BIGTROUT dev stream — real-time updates, community chat, and full transparency.
          </p>

          {/* Stream card */}
          <div className="card-volcanic p-8 md:p-12 text-center max-w-2xl mx-auto">
            {/* Live indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/50 bg-red-500/10 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-display text-sm tracking-widest text-red-400">LIVE NOW</span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              BigTrout300 Stream
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join the stream on X to watch live development updates, ask questions, and hang with the Trout Squad.
            </p>

            <a
              href={STREAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fire inline-flex items-center gap-3 text-lg"
            >
              <Radio className="w-5 h-5" />
              Watch Live on X
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Live;
