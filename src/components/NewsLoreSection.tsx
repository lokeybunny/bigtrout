import { Newspaper, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewsLoreSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0" style={{
        background: `
          radial-gradient(ellipse at 30% 40%, hsl(200 25% 16% / 0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, hsl(345 20% 14% / 0.4) 0%, transparent 50%),
          linear-gradient(180deg, hsl(210 25% 10%) 0%, hsl(210 22% 9%) 50%, hsl(210 25% 10%) 100%)
        `,
      }} />

      <div className="absolute top-0 left-0 right-0 h-1 z-[1] divider-brush" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div id="news" className="text-center">
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

          <div id="lore" className="text-center">
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
