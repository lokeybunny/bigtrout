import { Parallax3D } from './Parallax3D';
import heroImage from '@/assets/bigtrout-hero.png';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(20 100% 50%), transparent)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(195 90% 45%), transparent)' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-20 text-center">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="btn-fire">
            Buy $BIGTROUT
          </button>
          <button className="btn-ice">
            View Chart
          </button>
        </div>
      </div>

      {/* Hero Image with 3D effect */}
      <Parallax3D intensity={8}>
        <div className="relative">
          <img
            src={heroImage}
            alt="BIGTROUT - The Legendary Warrior Fish"
            className="w-full max-w-4xl rounded-2xl shadow-2xl animate-float"
            style={{
              boxShadow: `
                0 0 60px hsl(20 100% 50% / 0.4),
                0 0 120px hsl(25 100% 50% / 0.2),
                0 25px 50px -12px rgba(0, 0, 0, 0.5)
              `,
            }}
          />
          {/* Overlay glow */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 60%, hsl(220 30% 6% / 0.8) 100%)',
            }}
          />
        </div>
      </Parallax3D>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};
