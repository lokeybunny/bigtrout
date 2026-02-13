import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ExternalLink } from 'lucide-react';

const TWEETS = [
  '1886879224939327489',
  '1886879224939327489',
  '1887185046248239104',
  '1887529397310378192',
  '1887529397310378192',
  '1887836457839358345',
];

const Meme = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: 'hsl(210 25% 10%)' }}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              🐟 MEME STREAM
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              The latest <span className="text-pepe-glow font-bold">$BIGTROUT</span> posts from X
            </p>
            <a
              href="https://x.com/search?q=%24BIGTROUT&src=typed_query&f=live"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fire text-sm py-2 px-6 inline-flex items-center gap-2"
            >
              Search $BIGTROUT on X <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-4">
            {TWEETS.map((id, i) => (
              <div key={`${id}-${i}`} className="rounded-xl overflow-hidden">
                <blockquote className="twitter-tweet" data-theme="dark" data-conversation="none">
                  <a href={`https://twitter.com/x/status/${id}`}>Loading tweet...</a>
                </blockquote>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://x.com/search?q=%24BIGTROUT&src=typed_query&f=live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-pepe-glow transition-colors inline-flex items-center gap-2 text-sm"
            >
              View all $BIGTROUT posts on X <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Meme;
