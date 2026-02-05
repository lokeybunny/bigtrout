import { useEffect, useState } from 'react';
import heroGif from '@/assets/bigtrout-hero.gif';

interface FireParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  type: 'fire' | 'ember' | 'spark';
  side: 'left' | 'right';
}

export const HologramModel = () => {
  const [particles, setParticles] = useState<FireParticle[]>([]);

  useEffect(() => {
    // Generate fire particles for bottom-left side
    const leftParticles: FireParticle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 25, // 15-40% from left
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 12,
      type: Math.random() > 0.6 ? 'fire' : Math.random() > 0.5 ? 'ember' : 'spark',
      side: 'left' as const,
    }));

    // Generate fire particles for bottom-right side
    const rightParticles: FireParticle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 25,
      x: 60 + Math.random() * 25, // 60-85% from left
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 12,
      type: Math.random() > 0.6 ? 'fire' : Math.random() > 0.5 ? 'ember' : 'spark',
      side: 'right' as const,
    }));

    setParticles([...leftParticles, ...rightParticles]);
  }, []);

  const getParticleStyle = (particle: FireParticle) => {
    const colors = {
      fire: {
        bg: 'radial-gradient(circle, hsl(25 100% 60%) 0%, hsl(15 100% 50%) 40%, transparent 70%)',
        glow: '0 0 15px hsl(25 100% 55%), 0 0 30px hsl(15 100% 50% / 0.6)',
      },
      ember: {
        bg: 'radial-gradient(circle, hsl(35 100% 65%) 0%, hsl(25 100% 55%) 50%, transparent 70%)',
        glow: '0 0 10px hsl(35 100% 60%), 0 0 20px hsl(25 100% 50% / 0.5)',
      },
      spark: {
        bg: 'radial-gradient(circle, hsl(45 100% 80%) 0%, hsl(35 100% 60%) 40%, transparent 70%)',
        glow: '0 0 8px hsl(45 100% 70%), 0 0 15px hsl(35 100% 55% / 0.4)',
      },
    };

    return colors[particle.type];
  };

  return (
    <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]">
      {/* Fire particles rising from bottom sides */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {particles.map((particle) => {
          const style = getParticleStyle(particle);
          return (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                bottom: '10%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: style.bg,
                boxShadow: style.glow,
                animation: `fireParticleRise ${particle.duration}s ease-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Additional larger ember particles */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {[...Array(12)].map((_, i) => {
          const isLeft = i < 6;
          const xPos = isLeft ? 20 + (i % 6) * 5 : 60 + (i % 6) * 5;
          return (
            <div
              key={`large-ember-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${xPos}%`,
                bottom: '15%',
                width: `${16 + (i % 4) * 4}px`,
                height: `${16 + (i % 4) * 4}px`,
                background: 'radial-gradient(circle, hsl(30 100% 60%) 0%, hsl(20 100% 50%) 30%, hsl(10 100% 45%) 60%, transparent 70%)',
                boxShadow: '0 0 20px hsl(25 100% 55%), 0 0 40px hsl(15 100% 50% / 0.5), 0 0 60px hsl(10 100% 45% / 0.3)',
                animation: `fireParticleRiseSlow ${3 + (i % 3)}s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          );
        })}
      </div>

      {/* Fire glow at bottom sides */}
      <div 
        className="absolute bottom-[5%] left-[10%] w-[30%] h-[20%] rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse, hsl(25 100% 50% / 0.6) 0%, hsl(15 100% 45% / 0.3) 40%, transparent 70%)',
          filter: 'blur(20px)',
          animation: 'pulseGlow 2s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[5%] right-[10%] w-[30%] h-[20%] rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse, hsl(25 100% 50% / 0.6) 0%, hsl(15 100% 45% / 0.3) 40%, transparent 70%)',
          filter: 'blur(20px)',
          animation: 'pulseGlow 2s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />

      {/* Glass sphere effect */}
      <div 
        className="absolute inset-[5%] rounded-full pointer-events-none z-5"
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
      <div className="relative w-full h-full animate-float flex items-center justify-center z-30">
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
