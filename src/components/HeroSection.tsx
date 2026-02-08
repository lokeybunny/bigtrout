import { useEffect, useState, useRef } from 'react';
import heroBanner from '@/assets/bigtrout-hero-banner.jpg';

export const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setScrollY(-rect.top * 0.4);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden">
      {/* Full-width parallax banner */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          transform: `translateY(${scrollY}px) scale(1.15)`,
          willChange: 'transform',
        }}
      />

      {/* Animated water shimmer overlay — gives illusion of moving water */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Horizontal water ripple layer 1 */}
        <div
          className="absolute bottom-0 left-0 w-[200%] h-[45%]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(200 80% 60% / 0.08) 15%, transparent 30%, hsl(190 70% 50% / 0.06) 45%, transparent 60%, hsl(200 80% 60% / 0.08) 75%, transparent 100%)',
            animation: 'waterFlow 4s linear infinite',
          }}
        />
        {/* Horizontal water ripple layer 2 — offset */}
        <div
          className="absolute bottom-0 left-0 w-[200%] h-[40%]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(180 60% 70% / 0.06) 20%, transparent 40%, hsl(200 70% 60% / 0.07) 60%, transparent 80%, hsl(180 60% 70% / 0.05) 100%)',
            animation: 'waterFlow 6s linear infinite reverse',
          }}
        />
        {/* Vertical wave distortion */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[50%]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, hsl(200 80% 70% / 0.03) 2px, transparent 4px)',
            animation: 'waterWave 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Fish subtle movement overlay — gives illusion of fish swaying */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Subtle sway applied to the lower-center area where fish are */}
        <div
          className="absolute bottom-[5%] left-[10%] w-[80%] h-[40%]"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, hsl(130 50% 40% / 0.04), transparent 60%)',
            animation: 'fishSway 5s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[8%] left-[15%] w-[70%] h-[35%]"
          style={{
            background: 'radial-gradient(ellipse at 40% 50%, hsl(340 50% 50% / 0.03), transparent 50%)',
            animation: 'fishSway 4s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Gradient overlays for depth and readability */}
      <div className="absolute inset-0 z-[3]" style={{
        background: 'linear-gradient(180deg, hsl(150 30% 6% / 0.3) 0%, transparent 30%, transparent 60%, hsl(150 30% 6% / 0.7) 100%)',
      }} />

      {/* Sakura petal light scatter */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <div
          className="absolute top-[10%] left-[20%] w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(340 70% 70%), transparent)' }}
        />
        <div
          className="absolute top-[5%] right-[15%] w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(340 60% 75%), transparent)' }}
        />
      </div>

      {/* Main content overlaying the banner */}
      <div className="relative z-10 text-center pb-16 md:pb-24 px-4">
        {/* Ticker badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 mb-6 rounded-full border border-primary/50 bg-card/60 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-sm tracking-widest text-primary">LIVE ON SOLANA</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tight">
          <span className="text-pepe-sakura">$BIGTROUT</span>
        </h1>

        <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          The Legendary Warrior Fish has emerged from the depths.
          <span className="text-pepe"> Based</span> and <span className="text-sakura">Beautiful</span>.
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

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};
