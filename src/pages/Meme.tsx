import { useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Meme = () => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: 'hsl(210 25% 10%)' }}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              🐟 MEME STREAM
            </h1>
            <p className="text-muted-foreground text-lg">
              The latest <span className="text-pepe-glow font-bold">$BIGTROUT</span> posts from X
            </p>
          </div>

          {/* X Embed Timeline */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm">
            <div ref={embedRef}>
              <a
                className="twitter-timeline"
                data-theme="dark"
                data-chrome="noheader nofooter noborders transparent"
                data-height="800"
                data-link-color="#4ADE80"
                href="https://twitter.com/search?q=%24BIGTROUT"
              >
                Loading $BIGTROUT tweets...
              </a>
            </div>
          </div>

          {/* Fallback CTA */}
          <div className="text-center mt-8">
            <a
              href="https://twitter.com/search?q=%24BIGTROUT"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fire text-sm py-2 px-6 inline-block"
            >
              View on X →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Meme;
