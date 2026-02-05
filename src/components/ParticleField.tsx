import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  type: 'snow' | 'ember';
}

export const ParticleField = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const snowParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      type: 'snow' as const,
    }));

    const emberParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 30,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      size: 3 + Math.random() * 5,
      type: 'ember' as const,
    }));

    setParticles([...snowParticles, ...emberParticles]);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'snow' ? 'animate-snow' : 'animate-ember'}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: particle.type === 'snow' ? '-10px' : '100%',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: particle.type === 'snow' 
              ? 'radial-gradient(circle, hsl(200 30% 95%) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(30 100% 60%) 0%, hsl(20 100% 50%) 50%, transparent 70%)',
            boxShadow: particle.type === 'ember' 
              ? '0 0 10px hsl(25 100% 50% / 0.8), 0 0 20px hsl(35 100% 55% / 0.5)'
              : '0 0 5px hsl(200 30% 95% / 0.5)',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
