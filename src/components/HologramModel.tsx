import heroVideo from '@/assets/bigtrout-hero.mp4';

export const HologramModel = () => {
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
      
      {/* Video container with transparency effect */}
      <div className="relative w-full h-full animate-float flex items-center justify-center">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
          style={{
            mixBlendMode: 'screen',
            filter: 'drop-shadow(0 0 30px hsl(190 100% 70% / 0.6)) drop-shadow(0 0 60px hsl(20 100% 50% / 0.4))',
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
