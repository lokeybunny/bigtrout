import { Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewsSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(20 100% 50% / 0.08) 0%, transparent 50%),
            linear-gradient(180deg, hsl(235 35% 8%) 0%, hsl(220 30% 6%) 100%)
          `,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
          <span className="text-fire">LATEST</span>{' '}
          <span className="text-ice">NEWS</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          Follow BigTrout's trust-building journey — transparency, listings, and community moves.
        </p>

        <Link
          to="/news"
          className="btn-fire inline-flex items-center gap-3 text-base"
        >
          <Newspaper className="w-5 h-5" />
          View All Updates
        </Link>
      </div>
    </section>
  );
};
