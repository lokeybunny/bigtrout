import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { loreChapters } from '@/data/loreContent';
import { ArrowLeft, BookOpen, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import sakuraGardenBg from '@/assets/sakura-garden-bg.jpg';
import sakuraPathBg from '@/assets/sakura-path-bg.jpg';

const LorePetals = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 4}px`,
        height: `${3 + Math.random() * 4}px`,
        background: i % 2 === 0 ? 'hsl(345 55% 70% / 0.5)' : 'hsl(130 45% 38% / 0.4)',
        animation: `snowFall ${6 + Math.random() * 6}s linear infinite`,
        animationDelay: `${Math.random() * 8}s`,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {petals.map((style, i) => (
        <div key={`petal-${i}`} className="absolute rounded-full" style={style} />
      ))}
    </div>
  );
};

const Lore = () => {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const dissolveProgress = Math.min(scrollY / 800, 1);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* First parallax layer: sakura garden (fades out) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${sakuraGardenBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          transform: `translateY(${scrollY * -0.15}px) scale(1.15)`,
          willChange: 'transform',
          opacity: 1 - dissolveProgress,
          filter: 'saturate(0.8) brightness(0.6)',
        }}
      />
      {/* Second parallax layer: sakura path (fades in) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${sakuraPathBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * -0.08}px) scale(1.1)`,
          willChange: 'transform',
          opacity: dissolveProgress,
          filter: 'saturate(0.7) brightness(0.5)',
        }}
      />
      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 15%, hsl(345 55% 70% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, hsl(130 45% 38% / 0.05) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(210 25% 10% / 0.88) 0%, 
              hsl(210 25% 10% / 0.82) 20%,
              hsl(210 25% 10% / 0.8) 60%, 
              hsl(210 25% 10% / 0.88) 100%
            )
          `,
        }}
      />

      {/* Sakura petal particles instead of snow */}
      <LorePetals />

      <ParticleField />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-sm tracking-wider">BACK HOME</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center glow-ember"
              style={{
                background: 'linear-gradient(135deg, hsl(130 45% 38%), hsl(130 55% 52%))',
              }}
            >
              <Fish className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black">
              <span className="text-sakura">THE</span>{' '}
              <span className="text-pepe">LORE</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The legendary tale of how an accidental memecoin became a movement built on
            trust, transparency, and one honest trader's integrity.
          </p>
        </div>

        {/* Chapters */}
        <div className="max-w-3xl mx-auto space-y-12">
          {loreChapters.map((chapter, index) => (
            <div key={chapter.id} className="relative">
              {/* Chapter number accent */}
              <span
                className="font-display text-8xl font-black absolute -left-4 -top-6 opacity-[0.06] select-none pointer-events-none"
                style={{
                  background: index % 2 === 0
                    ? 'linear-gradient(180deg, hsl(130 45% 38%), hsl(130 55% 52%))'
                    : 'linear-gradient(180deg, hsl(345 55% 70%), hsl(345 65% 82%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="card-ukiyo p-8 relative overflow-hidden">
                {/* Subtle shimmer on top edge */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, hsl(130 45% 38% / 0.4), hsl(345 55% 70% / 0.3), transparent)',
                  }}
                />

                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{chapter.emoji}</span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-sakura">
                    {chapter.title}
                  </h2>
                </div>

                {/* Paragraphs */}
                <div className="space-y-4">
                  {chapter.paragraphs.map((para, pIdx) => {
                    const isQuote = para.startsWith('"') && para.endsWith('"');
                    return isQuote ? (
                      <blockquote
                        key={pIdx}
                        className="border-l-2 border-primary/50 pl-4 py-1 italic text-pepe font-display text-lg"
                      >
                        {para}
                      </blockquote>
                    ) : (
                      <p
                        key={pIdx}
                        className="text-muted-foreground leading-relaxed"
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto text-center mt-20">
          <p
            className="font-display text-2xl md:text-3xl font-bold mb-6"
            style={{
              textShadow: '0 0 30px hsl(130 45% 38% / 0.3)',
            }}
          >
            <span className="text-pepe-sakura">Trust is the ultimate bait.</span>
          </p>
          <a
            href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fire inline-flex items-center gap-3"
          >
            Join the Trout Squad
          </a>
        </div>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Lore;
