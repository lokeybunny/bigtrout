import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import streamThumb1 from '@/assets/stream-thumb-1.jpg';
import pondBg from '@/assets/live-pond-bg.jpg';

interface StreamEntry {
  title: string;
  date: string;
  thumbnail: string;
  url: string;
  description: string;
}

const streams: StreamEntry[] = [
  {
    title: 'BigTrout300 Live — Community Session',
    date: 'Feb 9, 2026',
    thumbnail: streamThumb1,
    url: 'https://x.com/i/broadcasts/1BRKjgmAEnWGw',
    description: 'Latest live broadcast with the Trout Squad — updates, vibes, and community hang.',
  },
  {
    title: 'BigTrout300 Live — Pump.fun Chart Session',
    date: 'Feb 2026',
    thumbnail: streamThumb1,
    url: 'https://x.com/i/broadcasts/1ZkKzZYoRQDKv',
    description: 'Live charting session with the Trout Squad — market updates, community Q&A, and full transparency.',
  },
];

const Live = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Pond background */}
      <div className="fixed inset-0 z-0">
        <img src={pondBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, hsl(220 40% 4% / 0.75) 0%, hsl(220 40% 4% / 0.6) 50%, hsl(220 40% 4% / 0.85) 100%)',
        }} />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-sm tracking-wider">BACK HOME</span>
          </Link>

          <h1 className="font-display text-5xl md:text-7xl font-black mb-2">
            <span className="text-fire">LIVE</span>{' '}
            <span className="text-ice">ARCHIVE</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-12">
            Catch up on past @bigtrout300 livestreams — market updates, dev sessions, and community hangs.
          </p>

          {/* Stream grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((stream, i) => (
              <a
                key={i}
                href={stream.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl overflow-hidden border border-white/10 hover:border-pepe/40 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-pepe/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-storm-dark fill-storm-dark ml-1" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 font-display tracking-wider">{stream.date}</p>
                  <h3 className="font-display font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-pepe transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{stream.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-pepe font-bold">
                    Watch on X <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Live;
