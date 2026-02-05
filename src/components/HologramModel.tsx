import heroGif from '@/assets/bigtrout-hero.gif';

export const HologramModel = () => {
  return (
    <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]">
      {/* Blue flames emanating from the sphere */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              width: '60px',
              height: '120px',
              background: `linear-gradient(to top, 
                hsl(200 100% 50% / 0.8), 
                hsl(190 100% 60% / 0.6), 
                hsl(180 100% 70% / 0.3), 
                transparent
              )`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              filter: 'blur(8px)',
              transform: `rotate(${i * 30}deg) translateY(-55%) translateX(-50%)`,
              transformOrigin: 'center bottom',
              animation: `blueFlame ${1.5 + (i % 3) * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

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
