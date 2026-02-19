import { useEffect, useState } from 'react';
import type { QualityLevel } from '@/hooks/usePerformanceMode';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  type: 'rain' | 'firefly';
}

interface ParticleFieldProps {
  quality?: QualityLevel;
}

export const ParticleField = ({ quality = 'high' }: ParticleFieldProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const rainCount = quality === 'high' ? 50 : 20;
    const fireflyCount = quality === 'high' ? 10 : 4;

    const rain: Particle[] = Array.from({ length: rainCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 1.2 + Math.random() * 1.8,
      size: 1 + Math.random() * 2,
      type: 'rain' as const,
    }));

    const fireflies: Particle[] = Array.from({ length: fireflyCount }, (_, i) => ({
      id: i + rainCount,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      type: 'firefly' as const,
    }));

    setParticles([...rain, ...fireflies]);
  }, [quality]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'rain' ? 'animate-petal' : 'animate-firefly'}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: particle.type === 'rain' ? '-10px' : '100%',
            width: particle.type === 'rain' ? `${particle.size}px` : `${particle.size}px`,
            height: particle.type === 'rain' ? `${particle.size * 12}px` : `${particle.size}px`,
            borderRadius: particle.type === 'rain' ? '2px' : '50%',
            background: particle.type === 'rain' 
              ? `linear-gradient(180deg, transparent, hsl(345 50% 75% / 0.6) 30%, hsl(345 60% 80% / 0.3))`
              : `radial-gradient(circle, hsl(130 55% 58%) 0%, hsl(130 50% 42%) 50%, transparent 70%)`,
            boxShadow: particle.type === 'firefly' 
              ? '0 0 8px hsl(130 55% 50% / 0.6), 0 0 16px hsl(130 50% 45% / 0.3)'
              : 'none',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
