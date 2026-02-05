import { useEffect, useState } from 'react';
import heroImage from '@/assets/bigtrout-hero.png';

export const HologramModel = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]">
      {/* Hologram base glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-4 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(ellipse, hsl(190 100% 70% / 0.8), transparent)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      
      {/* Scanning lines */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, hsl(190 100% 70% / 0.1) 4px, hsl(190 100% 70% / 0.1) 8px)',
          animation: 'scanLines 3s linear infinite',
        }}
      />
      
      {/* 3D Spinning container */}
      <div 
        className="relative w-full h-full animate-float"
        style={{
          perspective: '1200px',
          perspectiveOrigin: 'center center',
        }}
      >
        {/* Rotating image wrapper */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            transition: 'transform 0.016s linear',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 backface-visible"
            style={{
              transform: 'translateZ(20px)',
              backfaceVisibility: 'visible',
            }}
          >
            <img
              src={heroImage}
              alt="BIGTROUT Hologram"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 30px hsl(190 100% 70% / 0.6)) drop-shadow(0 0 60px hsl(20 100% 50% / 0.4))',
                mixBlendMode: 'screen',
              }}
            />
          </div>
          
          {/* Hologram overlay effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(190 100% 70% / 0.1) 50%, transparent 100%)',
              transform: 'translateZ(25px)',
            }}
          />
        </div>
      </div>
      
      {/* Outer ring glow */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '2px solid hsl(190 100% 70% / 0.3)',
          boxShadow: `
            0 0 30px hsl(190 100% 70% / 0.3),
            inset 0 0 30px hsl(190 100% 70% / 0.1)
          `,
          animation: 'hologramPulse 2s ease-in-out infinite',
        }}
      />
      
      {/* Particle ring */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              background: i % 2 === 0 
                ? 'hsl(190 100% 70%)' 
                : 'hsl(30 100% 60%)',
              boxShadow: i % 2 === 0 
                ? '0 0 10px hsl(190 100% 70%)' 
                : '0 0 10px hsl(30 100% 60%)',
              transform: `rotate(${i * 45 + rotation}deg) translateX(${140 + (i % 3) * 20}px) translateY(-50%)`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    </div>
  );
};
