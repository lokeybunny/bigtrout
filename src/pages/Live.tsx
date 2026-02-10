import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import liveArchiveBg from '@/assets/live-archive-bg.jpg';

interface Broadcast {
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  url: string;
}

const BROADCASTS: Broadcast[] = [
  {
    title: 'BigTrout300 Live — Community Session',
    date: 'FEB 9, 2026',
    description: 'Latest live broadcast with the Trout Squad — updates, vibes, and community hang.',
    thumbnail: 'https://pbs.twimg.com/broadcast_thumbnail/live_video_thumb/1mnxeNARBBQKX/img/eLj8VqZkm3GpKABb.jpg',
    url: 'https://x.com/i/broadcasts/1BRKjgmAEnWGw',
  },
  {
    title: 'BigTrout300 Live — Pump.fun Chart Session',
    date: 'FEB 2026',
    description: 'Live charting session with the Trout Squad — market updates, community Q&A, and full transparency.',
    thumbnail: 'https://pbs.twimg.com/broadcast_thumbnail/live_video_thumb/1mnxeNARBBQKX/img/eLj8VqZkm3GpKABb.jpg',
    url: 'https://x.com/i/broadcasts/1ZkKzZYoRQDKv',
  },
];

const Live = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${liveArchiveBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay for readability */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: `linear-gradient(180deg, 
            hsl(210 25% 6% / 0.75) 0%, 
            hsl(210 25% 6% / 0.6) 40%,
            hsl(210 25% 6% / 0.7) 70%, 
            hsl(210 25% 6% / 0.85) 100%
          )`,
        }}
      />

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

          <h1 className="font-display text-5xl md:text-7xl font-black mb-4">
            <span className="text-fire">LIVE</span>{' '}
            <span className="text-ice">ARCHIVE</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-12">
            Catch up on past @bigtrout300 livestreams — market updates, dev sessions, and community hangs.
          </p>

          {/* Broadcast grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BROADCASTS.map((broadcast, i) => (
              <div key={i} className="card-volcanic overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={broadcast.thumbnail}
                    alt={broadcast.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" fillOpacity={0.8} />
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <p className="text-xs font-display tracking-widest text-muted-foreground mb-1">
                    {broadcast.date}
                  </p>
                  <h3 className="font-display text-sm md:text-base font-bold text-foreground uppercase tracking-wide mb-2">
                    {broadcast.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {broadcast.description}
                  </p>
                  <a
                    href={broadcast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-display tracking-wider text-pepe hover:underline"
                  >
                    Watch on X
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Live;
