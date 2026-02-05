import heroGif from '@/assets/bigtrout-hero.gif';

export const HologramModel = () => {
  return (
    <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]">
      {/* Fire flames shooting outward from sphere edge */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {[...Array(16)].map((_, i) => (
          <div
            key={`fire-shoot-${i}`}
            className="absolute"
            style={{
              width: '120px',
              height: '280px',
              left: '50%',
              top: '50%',
              marginLeft: '-60px',
              marginTop: '-50%',
              background: `linear-gradient(to top, 
                hsl(15 100% 50% / 1), 
                hsl(25 100% 55% / 0.95), 
                hsl(35 100% 60% / 0.8), 
                hsl(45 100% 65% / 0.5),
                hsl(55 100% 70% / 0.2),
                transparent
              )`,
              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
              filter: 'blur(3px)',
              transform: `rotate(${i * 22.5}deg)`,
              transformOrigin: '50% 100%',
              animation: `fireFlameIntense ${0.8 + (i % 4) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.06}s`,
            }}
          />
        ))}
      </div>

      {/* Blue/Ice flames shooting outward */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {[...Array(16)].map((_, i) => (
          <div
            key={`ice-shoot-${i}`}
            className="absolute"
            style={{
              width: '100px',
              height: '260px',
              left: '50%',
              top: '50%',
              marginLeft: '-50px',
              marginTop: '-48%',
              background: `linear-gradient(to top, 
                hsl(200 100% 60% / 1), 
                hsl(195 100% 65% / 0.9), 
                hsl(190 100% 70% / 0.7), 
                hsl(185 100% 80% / 0.4),
                transparent
              )`,
              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
              filter: 'blur(4px)',
              transform: `rotate(${i * 22.5 + 11.25}deg)`,
              transformOrigin: '50% 100%',
              animation: `blueFlameIntense ${1 + (i % 3) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Core flame glow - fire and ice */}
      <div 
        className="absolute inset-[-20%] rounded-full pointer-events-none z-10"
        style={{
          background: `
            radial-gradient(circle, transparent 30%, hsl(25 100% 55% / 0.4) 45%, transparent 60%),
            radial-gradient(circle, transparent 35%, hsl(200 100% 60% / 0.35) 50%, transparent 65%)
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-6 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(ellipse, hsl(190 100% 70% / 0.8), hsl(200 100% 50% / 0.4), transparent)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      
      {/* GIF container with dissolve loop effect */}
      <div className="relative w-full h-full animate-float flex items-center justify-center z-10">
        <img
          src={heroGif}
          alt="BIGTROUT Hero"
          className="w-[85%] h-[85%] object-contain"
          style={{
            animation: 'dissolveLoop 3.5s ease-in-out infinite',
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
