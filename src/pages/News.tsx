import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VerifiedListings } from '@/components/VerifiedListings';
import { ParticleField } from '@/components/ParticleField';
import { timelineEntries } from '@/data/newsTimeline';
import { ArrowLeft, ExternalLink, Calendar, Clock, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import sakuraPathBg from '@/assets/sakura-path-bg.jpg';
import sakuraGardenBg from '@/assets/sakura-garden-bg.jpg';

const News = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden">
      {/* First parallax layer: sakura path (fades out) */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-100"
        style={{
          backgroundImage: `url(${sakuraPathBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * -0.15}px) scale(1.15)`,
          willChange: 'transform',
          opacity: 1 - dissolveProgress,
          filter: 'saturate(0.8) brightness(0.6)',
        }}
      />
      {/* Second parallax layer: sakura garden (fades in) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${sakuraGardenBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * -0.08}px) scale(1.1)`,
          willChange: 'transform',
          opacity: dissolveProgress,
          filter: 'saturate(0.7) brightness(0.5)',
        }}
      />
      {/* Dark overlay for readability */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 20%, hsl(345 55% 70% / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 80%, hsl(130 45% 38% / 0.05) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(210 25% 10% / 0.88) 0%, 
              hsl(210 25% 10% / 0.82) 30%, 
              hsl(210 25% 10% / 0.8) 60%, 
              hsl(210 25% 10% / 0.88) 100%
            )
          `,
        }}
      />
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

          <h1 className="font-display text-5xl md:text-7xl font-black mb-4">
            <span className="text-pepe">TRUST</span>{' '}
            <span className="text-sakura">TIMELINE</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            BigTrout's Trust-Building Adventure! Dive into this splashy summary of all the
            awesome ways{' '}
            <a
              href="https://x.com/BigTrout300"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fire hover:underline"
            >
              @BigTrout300
            </a>{' '}
            has been building trust with the $BIGTROUT community.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
            style={{
              background:
                'linear-gradient(180deg, hsl(130 45% 38% / 0.6), hsl(345 55% 70% / 0.6), hsl(130 45% 38% / 0.3))',
            }}
          />

          {timelineEntries.map((entry, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={entry.id}
                className={`relative flex items-start mb-12 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-row`}
              >
                {/* Fish icon on the line */}
                <div
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full z-10 mt-6 flex items-center justify-center"
                  style={{
                    background:
                      index % 2 === 0
                        ? 'linear-gradient(135deg, hsl(130 45% 38%), hsl(130 55% 52%))'
                        : 'linear-gradient(135deg, hsl(345 55% 70%), hsl(345 65% 82%))',
                    boxShadow:
                      index % 2 === 0
                        ? '0 0 15px hsl(130 45% 38% / 0.8)'
                        : '0 0 15px hsl(345 55% 70% / 0.8)',
                  }}
                >
                  <Fish className="w-4 h-4" style={{ color: 'hsl(210 25% 10%)' }} />
                </div>

                {/* Card */}
                <div
                  className={`ml-14 md:ml-0 md:w-[45%] ${
                    isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  }`}
                >
                  <div className="card-volcanic p-6">
                    {/* Emoji + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{entry.emoji}</span>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {entry.title}
                      </h3>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {entry.time}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {entry.description}
                    </p>

                    {/* Tweet link */}
                    <a
                      href={entry.tweetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-display tracking-wider text-fire hover:text-ember transition-colors"
                    >
                      Check the tweet
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="max-w-4xl mx-auto text-center mt-16">
          <p className="text-muted-foreground text-lg">
            These moves show BigTrout's all about{' '}
            <span className="text-fire">transparency</span>,{' '}
            <span className="text-ice">engagement</span>, and real-deal growth.
            <br />
            Keep swimming strong with <span className="text-fire-ice font-bold">$BIGTROUT</span> –
            more updates coming soon! 🐟
          </p>
        </div>

        {/* Verified Listings */}
        <div className="max-w-4xl mx-auto mt-8">
          <VerifiedListings />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
