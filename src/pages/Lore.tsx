import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';
import { loreChapters } from '@/data/loreContent';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import snowMountainBg from '@/assets/snow-mountain-bg.jpg';

const Lore = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Parallax icy mountain background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${snowMountainBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          transform: `translateY(${scrollY * -0.12}px) scale(1.15)`,
          willChange: 'transform',
        }}
      />
      {/* Dark icy overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 15%, hsl(195 90% 45% / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, hsl(200 80% 40% / 0.08) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(220 30% 6% / 0.88) 0%, 
              hsl(220 30% 6% / 0.82) 20%,
              hsl(220 30% 6% / 0.85) 60%, 
              hsl(220 30% 6% / 0.92) 100%
            )
          `,
        }}
      />

      {/* Snowfall particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`snow-${i}`}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              animation: `snowFall ${6 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

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
              className="w-14 h-14 rounded-xl flex items-center justify-center glow-ice"
              style={{
                background: 'linear-gradient(135deg, hsl(195 90% 45%), hsl(190 100% 70%))',
              }}
            >
              <BookOpen className="w-7 h-7 text-storm-dark" />
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black">
              <span className="text-ice">THE</span>{' '}
              <span className="text-fire">LORE</span>
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
                  background: 'linear-gradient(180deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="card-volcanic p-8 relative overflow-hidden">
                {/* Subtle ice shimmer on top edge */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, hsl(195 90% 45% / 0.5), hsl(190 100% 70% / 0.3), transparent)',
                  }}
                />

                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{chapter.emoji}</span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-ice">
                    {chapter.title}
                  </h2>
                </div>

                {/* Paragraphs */}
                <div className="space-y-4">
                  {chapter.paragraphs.map((para, pIdx) => {
                    // Style quotes differently
                    const isQuote = para.startsWith('"') && para.endsWith('"');
                    return isQuote ? (
                      <blockquote
                        key={pIdx}
                        className="border-l-2 border-primary/50 pl-4 py-1 italic text-fire font-display text-lg"
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
              textShadow: '0 0 30px hsl(195 90% 45% / 0.3)',
            }}
          >
            <span className="text-ice">Trust is the ultimate bait.</span>
          </p>
          <a
            href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ice inline-flex items-center gap-3"
          >
            Join the Trout Squad
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Lore;
