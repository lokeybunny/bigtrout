import { HologramModel } from './HologramModel';
import { Parallax3D } from './Parallax3D';
import heroImage from '@/assets/bigtrout-hero.png';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Full background image with blur */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.4)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Dark overlay for readability */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, hsl(220 30% 6% / 0.7) 0%, hsl(220 30% 6% / 0.5) 50%, hsl(220 30% 6% / 0.8) 100%)',
        }}
      />
      
      {/* Lava glow effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse"
          style={{ background: 'radial-gradient(circle, hsl(20 100% 50%), transparent)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, hsl(195 90% 45%), transparent)',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-20 text-center mb-8">
        {/* Ticker badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 mb-8 rounded-full border border-primary/50 bg-card/50 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-sm tracking-widest text-primary">LIVE ON SOLANA</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tight">
          <span className="text-fire-ice">$BIGTROUT</span>
        </h1>
        
        <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          The Legendary Warrior Fish has emerged from the volcanic depths. 
          <span className="text-fire"> Fire</span> and <span className="text-ice">Ice</span> collide.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fire"
          >
            Buy $BIGTROUT
          </a>
          <a 
            href="#live-chart"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#live-chart')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-ice"
          >
            View Chart
          </a>
        </div>
      </div>

      {/* 3D Hologram Model with mouse parallax */}
      <div className="relative z-20">
        <Parallax3D intensity={15}>
          <HologramModel />
        </Parallax3D>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};
