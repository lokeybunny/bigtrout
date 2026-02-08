import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  type: 'petal' | 'firefly';
}

export const ParticleField = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const petals: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 6 + Math.random() * 6,
      size: 5 + Math.random() * 7,
      type: 'petal' as const,
    }));

    const fireflies: Particle[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 20,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      type: 'firefly' as const,
    }));

    setParticles([...petals, ...fireflies]);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'petal' ? 'animate-petal' : 'animate-firefly'}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: particle.type === 'petal' ? '-10px' : '100%',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: particle.type === 'petal' ? '50% 0 50% 0' : '50%',
            background: particle.type === 'petal' 
              ? `radial-gradient(circle, hsl(345 65% 82%) 0%, hsl(345 55% 70% / 0.5) 70%)`
              : `radial-gradient(circle, hsl(130 55% 58%) 0%, hsl(130 50% 42%) 50%, transparent 70%)`,
            boxShadow: particle.type === 'firefly' 
              ? '0 0 8px hsl(130 55% 50% / 0.6), 0 0 16px hsl(130 50% 45% / 0.3)'
              : 'none',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: particle.type === 'petal' ? 'rotate(45deg)' : undefined,
          }}
        />
      ))}
    </div>
  );
};
