import { useEffect, useState, useRef } from 'react';
import { BuyNowPopup } from '@/components/BuyNowPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import heroBanner from '@/assets/bigtrout-hero-banner.avif';
import type { QualityLevel } from '@/hooks/usePerformanceMode';

interface HeroSectionProps {
  quality?: QualityLevel;
}

export const HeroSection = ({ quality = 'high' }: HeroSectionProps) => {
  const isMobile = useIsMobile();
  const [scrollY, setScrollY] = useState(0);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  const enableParallax = !isMobile && quality !== 'low';
  const enableEffects = !isMobile && quality === 'high';
  const enableLiteEffects = !isMobile && quality === 'medium';

  useEffect(() => {
    if (!enableParallax) return;
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          setScrollY(-rect.top * 0.35);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enableParallax]);

  return (
    <>
    <section ref={sectionRef} className="relative flex flex-col items-center justify-end overflow-hidden" style={{ minHeight: isMobile ? 'auto' : '100svh' }}>
      {/* Mobile: static full image, no effects */}
      {isMobile ? (
        <div className="w-full pt-16">
          <img src={heroBanner} alt="BigTrout Hero" className="w-full h-auto block" />
        </div>
      ) : (
        <>
          {/* Desktop: parallax banner (or static in low mode) */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${heroBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              transform: enableParallax ? `translateY(${scrollY}px)` : undefined,
              willChange: enableParallax ? 'transform' : undefined,
            }}
          />

          {/* Animated overlays — HIGH quality only */}
          {enableEffects && (
            <>
              {/* Drifting light rays */}
              <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-[0.07]">
                <div className="absolute top-0 left-[20%] w-[30%] h-full" style={{
                  background: 'linear-gradient(180deg, hsl(40 60% 90% / 0.8), transparent 70%)',
                  transform: 'skewX(-15deg)',
                  animation: 'lightRayDrift 8s ease-in-out infinite',
                }} />
                <div className="absolute top-0 left-[55%] w-[20%] h-full" style={{
                  background: 'linear-gradient(180deg, hsl(40 50% 85% / 0.6), transparent 60%)',
                  transform: 'skewX(-10deg)',
                  animation: 'lightRayDrift 10s ease-in-out infinite 3s',
                }} />
              </div>

              {/* Slow fog/mist layer */}
              <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute bottom-[10%] left-0 w-[250%] h-[30%] opacity-[0.04]" style={{
                  background: 'linear-gradient(90deg, transparent, hsl(200 30% 80%), transparent 40%, hsl(200 25% 75%), transparent)',
                  animation: 'mistDrift 20s linear infinite',
                }} />
                <div className="absolute bottom-[20%] left-0 w-[250%] h-[25%] opacity-[0.03]" style={{
                  background: 'linear-gradient(90deg, transparent 10%, hsl(345 30% 80%), transparent 50%, hsl(200 30% 75%), transparent 90%)',
                  animation: 'mistDrift 28s linear infinite reverse',
                }} />
              </div>

              {/* Water shimmer */}
              <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[200%] h-[45%]" style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(200 50% 60% / 0.06) 15%, transparent 30%, hsl(190 45% 50% / 0.05) 45%, transparent 60%, hsl(200 50% 60% / 0.06) 75%, transparent 100%)',
                  animation: 'waterFlow 5s linear infinite',
                }} />
                <div className="absolute bottom-0 left-0 w-[200%] h-[40%]" style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(180 40% 65% / 0.04) 20%, transparent 40%, hsl(200 45% 55% / 0.05) 60%, transparent 80%)',
                  animation: 'waterFlow 7s linear infinite reverse',
                }} />
                <div className="absolute bottom-0 left-0 right-0 h-[50%]" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, hsl(200 50% 70% / 0.02) 2px, transparent 4px)',
                  animation: 'waterWave 3.5s ease-in-out infinite',
                }} />
              </div>

              {/* Fish movement */}
              <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
                <div className="absolute bottom-[5%] left-[10%] w-[80%] h-[40%]" style={{
                  background: 'radial-gradient(ellipse at 50% 60%, hsl(200 40% 50% / 0.03), transparent 60%)',
                  animation: 'fishSway 5s ease-in-out infinite',
                }} />
                <div className="absolute bottom-[8%] left-[15%] w-[70%] h-[35%]" style={{
                  background: 'radial-gradient(ellipse at 40% 50%, hsl(345 40% 55% / 0.02), transparent 50%)',
                  animation: 'fishSway 4s ease-in-out infinite 1s',
                }} />
              </div>
            </>
          )}

          {/* Parchment texture overlay — high & medium */}
          {(enableEffects || enableLiteEffects) && (
            <div className="absolute inset-0 z-[1] pointer-events-none mix-blend-overlay opacity-15" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
            }} />
          )}

          {/* Gradient overlays — always on desktop */}
          <div className="absolute inset-0 z-[4]" style={{
            background: `
              linear-gradient(180deg, hsl(210 25% 10% / 0.15) 0%, transparent 12%, transparent 50%, hsl(210 25% 10% / 0.2) 62%, hsl(210 25% 10% / 0.5) 76%, hsl(210 25% 10% / 0.85) 88%, hsl(210 25% 10% / 1) 100%),
              linear-gradient(90deg, hsl(210 25% 10% / 0.1) 0%, transparent 12%, transparent 88%, hsl(210 25% 10% / 0.1) 100%)
            `,
          }} />
          <div className="absolute -bottom-4 left-0 right-0 h-96 z-[5]" style={{
            background: 'hsl(210 25% 10%)',
            maskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)',
          }} />

          {/* Sakura glow accents — high & medium */}
          {(enableEffects || enableLiteEffects) && (
            <div className="absolute inset-0 z-[4] pointer-events-none">
              <div className="absolute top-[8%] left-[15%] w-48 h-48 rounded-full blur-3xl opacity-20" style={{
                background: 'radial-gradient(circle, hsl(345 55% 75%), transparent)',
              }} />
              <div className="absolute top-[5%] right-[10%] w-40 h-40 rounded-full blur-3xl opacity-15" style={{
                background: 'radial-gradient(circle, hsl(345 50% 80%), transparent)',
              }} />
            </div>
          )}
        </>
      )}

      {/* Main content */}
      <div className={`${isMobile ? 'relative' : 'relative z-10'} text-center ${isMobile ? 'py-8' : 'pb-20 md:pb-28'} px-4 w-full max-w-4xl mx-auto overflow-visible`} style={isMobile ? { background: 'hsl(210 25% 10%)' } : undefined}>

        {/* Title */}
        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black mb-3 tracking-tight animate-hero-pulse hero-title-stroke">
          $BIGTROUT
        </h1>

        <p className="font-display text-lg sm:text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto mb-8 tracking-wider hero-subtitle-glow">
          The Legendary Warrior Fish has emerged from the depths.
          <span className="text-pepe"> Based</span> and <span className="text-sakura">Beautiful</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setIsBuyOpen(true)}
            className="btn-fire"
          >
            Buy $BIGTROUT
          </button>
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

      {/* Scroll indicator — desktop only */}
      {!isMobile && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      )}
    </section>
    <BuyNowPopup open={isBuyOpen} onOpenChange={setIsBuyOpen} />
    </>
  );
};
