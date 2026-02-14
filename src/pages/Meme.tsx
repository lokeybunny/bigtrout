import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ExternalLink, Search, Fish } from 'lucide-react';
import MemeGenerator from '@/components/MemeGenerator';

const Meme = () => {
  return (
    <div className="relative min-h-screen" style={{ background: 'hsl(210 25% 10%)' }}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              🐟 MEME STREAM
            </h1>
            <p className="text-muted-foreground text-lg">
              Create & share <span className="text-pepe-glow font-bold">$BIGTROUT</span> memes
            </p>
          </div>

          {/* Meme Generator */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-foreground text-center mb-2">
              🎨 Meme Generator
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Add stickers, text & bling to the BigTrout — then download & share!
            </p>
            <MemeGenerator />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-12" />

          {/* Community Links */}
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-foreground mb-6">Browse Community Memes</h2>

            <a
              href="https://x.com/search?q=%24BIGTROUT&src=typed_query&f=live"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 md:p-14 hover:border-pepe/40 hover:bg-pepe/5 transition-all duration-300 mb-6"
            >
              <Search className="w-12 h-12 text-pepe-glow mx-auto mb-5 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl md:text-3xl font-black text-foreground mb-3">
                Search <span className="text-pepe-glow">$BIGTROUT</span> on X
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                View the latest memes, community posts, and alpha — all in real time on X.
              </p>
              <span className="btn-fire text-sm py-3 px-8 inline-flex items-center gap-2">
                Open on X <ExternalLink className="w-4 h-4" />
              </span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <a
                href="https://x.com/BigTrout300"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-pepe/30 hover:bg-pepe/5 transition-all duration-300 group"
              >
                <Fish className="w-8 h-8 text-pepe-glow mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-foreground mb-1">@BigTrout300</h3>
                <p className="text-muted-foreground text-sm">Official BigTrout account</p>
              </a>
              <a
                href="https://x.com/search?q=%23BIGTROUT&src=typed_query&f=media"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-pepe/30 hover:bg-pepe/5 transition-all duration-300 group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform inline-block">🖼️</span>
                <h3 className="font-bold text-foreground mb-1">#BIGTROUT Media</h3>
                <p className="text-muted-foreground text-sm">Meme images & videos</p>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Meme;
