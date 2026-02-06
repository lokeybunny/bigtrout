import heroGif from '@/assets/bigtrout-hero.gif';
import heroMobile from '@/assets/bigtrout-mobile.jpg';
import { useState, useEffect } from 'react';

export const HologramModel = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px]">
      {/* Orange/Fire flames - outer layer */}
      <div className="absolute inset-[-15%] pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={`fire-outer-${i}`}
            className="absolute top-1/2 left-1/2"
            style={{
              width: '90px',
              height: '200px',
              background: `linear-gradient(to top, 
                hsl(20 100% 50% / 1), 
                hsl(30 100% 55% / 0.9), 
                hsl(40 100% 60% / 0.6), 
                hsl(50 100% 70% / 0.3),
                transparent
              )`,
              borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
              filter: 'blur(6px)',
              transform: `rotate(${i * 30 + 15}deg) translateY(-68%) translateX(-50%)`,
              transformOrigin: 'center bottom',
              animation: `fireFlameIntense ${1.1 + (i % 3) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Blue flames emanating from the sphere - outer layer */}
      <div className="absolute inset-[-15%] pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={`outer-${i}`}
            className="absolute top-1/2 left-1/2"
            style={{
              width: '100px',
              height: '220px',
              background: `linear-gradient(to top, 
                hsl(210 100% 60% / 1), 
                hsl(200 100% 65% / 0.9), 
                hsl(190 100% 70% / 0.6), 
                hsl(180 100% 80% / 0.3),
                transparent
              )`,
              borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
              filter: 'blur(6px)',
              transform: `rotate(${i * 30}deg) translateY(-65%) translateX(-50%)`,
              transformOrigin: 'center bottom',
              animation: `blueFlameIntense ${1.2 + (i % 4) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Core flame glow - fire and ice */}
      <div 
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, transparent 40%, hsl(200 100% 60% / 0.25) 55%, transparent 70%),
            radial-gradient(circle, transparent 40%, hsl(25 100% 55% / 0.25) 60%, transparent 75%)
          `,
          animation: 'pulseGlow 1.5s ease-in-out infinite',
        }}
      />

      {/* Glass sphere effect */}
      <div 
        className="absolute inset-[5%] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, hsl(200 100% 90% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, hsl(190 100% 70% / 0.2) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, hsl(200 80% 20% / 0.1) 0%, hsl(200 100% 50% / 0.05) 100%)
          `,
          border: '2px solid hsl(190 100% 80% / 0.3)',
          boxShadow: `
            inset 0 0 60px hsl(190 100% 70% / 0.2),
            inset 0 0 120px hsl(200 100% 50% / 0.1),
            0 0 40px hsl(190 100% 70% / 0.4),
            0 0 80px hsl(200 100% 60% / 0.3),
            0 0 120px hsl(190 100% 50% / 0.2)
          `,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Glass highlight - top left */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '12%',
          left: '15%',
          width: '25%',
          height: '15%',
          background: 'linear-gradient(135deg, hsl(200 100% 95% / 0.6), transparent)',
          filter: 'blur(10px)',
          transform: 'rotate(-30deg)',
        }}
      />

      {/* Glass highlight - bottom right reflection */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: '20%',
          right: '18%',
          width: '15%',
          height: '8%',
          background: 'linear-gradient(315deg, hsl(190 100% 80% / 0.3), transparent)',
          filter: 'blur(8px)',
          transform: 'rotate(-30deg)',
        }}
      />
      
      {/* Hologram base glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 md:w-64 h-4 sm:h-5 md:h-6 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(ellipse, hsl(190 100% 70% / 0.8), hsl(200 100% 50% / 0.4), transparent)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      
      {/* GIF container with dissolve loop effect */}
      <div className="relative w-full h-full animate-float flex items-center justify-center z-10">
        <img
          src={isMobile ? heroMobile : heroGif}
          alt="BIGTROUT Hero"
          className="w-[85%] h-[85%] object-contain"
          style={{
            animation: isMobile ? undefined : 'dissolveLoop 3.5s ease-in-out infinite',
            mixBlendMode: 'screen',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        />
      </div>
      
      {/* Outer glass rim */}
      <div 
        className="absolute inset-[4%] rounded-full pointer-events-none"
        style={{
          border: '3px solid hsl(190 100% 70% / 0.2)',
          boxShadow: `
            0 0 20px hsl(190 100% 70% / 0.3),
            inset 0 0 20px hsl(190 100% 70% / 0.1)
          `,
          animation: 'hologramPulse 2s ease-in-out infinite',
        }}
      />
    </div>
  );
};
