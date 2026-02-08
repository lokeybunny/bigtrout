import { Newspaper, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export const NewsLoreSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const parallaxOffset = (window.innerHeight - rect.top) * 0.15;
        setScrollY(parallaxOffset);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        transform: `translateY(${scrollY * -0.4}px) scale(1.15)`,
        willChange: 'transform',
        background: `
          radial-gradient(ellipse at 30% 20%, hsl(130 50% 30% / 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, hsl(340 50% 40% / 0.08) 0%, transparent 50%),
          linear-gradient(180deg, hsl(150 30% 6%) 0%, hsl(145 25% 5%) 50%, hsl(150 30% 6%) 100%)
        `,
      }} />

      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center 50%, hsl(130 50% 35% / 0.06), transparent 60%)',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div id="news" className="text-center md:text-left">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-pepe">LATEST</span>{' '}
              <span className="text-sakura">NEWS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0 mb-8">
              Follow BigTrout's trust-building journey — transparency, listings, and community moves.
            </p>
            <Link to="/news" className="btn-fire inline-flex items-center gap-3 text-base">
              <Newspaper className="w-5 h-5" />
              View All Updates
            </Link>
          </div>

          <div id="lore" className="text-center md:text-left">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-sakura">THE</span>{' '}
              <span className="text-pepe">LORE</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0 mb-8">
              Discover the legendary origin of $BIGTROUT — from accidental creation to community-driven movement.
            </p>
            <Link to="/lore" className="btn-ice inline-flex items-center gap-3 text-base">
              <BookOpen className="w-5 h-5" />
              Read the Legend
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
