import heroGif from '@/assets/bigtrout-hero.gif';

export const HologramModel = () => {
  return (
    <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]">
      {/* Hologram base glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-4 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(ellipse, hsl(190 100% 70% / 0.8), transparent)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      
      {/* GIF container with dissolve loop effect */}
      <div className="relative w-full h-full animate-float flex items-center justify-center">
        <img
          src={heroGif}
          alt="BIGTROUT Hero"
          className="w-full h-full object-contain"
          style={{
            animation: 'dissolveLoop 3.5s ease-in-out infinite',
          }}
        />
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
    </div>
  );
};
