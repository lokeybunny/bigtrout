import { useEffect, useState, useRef, ReactNode } from 'react';

interface Parallax3DProps {
  children: ReactNode;
  intensity?: number;
}

export const Parallax3D = ({ children, intensity = 20 }: Parallax3DProps) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = ((e.clientX - centerX) / (window.innerWidth / 2)) * intensity;
      const y = ((e.clientY - centerY) / (window.innerHeight / 2)) * intensity;
      
      setTransform({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      className="transition-transform duration-200 ease-out"
      style={{
        transform: `perspective(1000px) rotateY(${transform.x}deg) rotateX(${-transform.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};
