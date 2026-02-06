import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoreSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(195 90% 45% / 0.06) 0%, transparent 50%),
            linear-gradient(180deg, hsl(220 30% 6%) 0%, hsl(235 35% 8%) 100%)
          `,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
          <span className="text-ice">THE</span>{' '}
          <span className="text-fire">LORE</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          Discover the legendary origin of $BIGTROUT — from accidental creation to community-driven movement.
        </p>

        <Link
          to="/lore"
          className="btn-ice inline-flex items-center gap-3 text-base"
        >
          <BookOpen className="w-5 h-5" />
          Read the Legend
        </Link>
      </div>
    </section>
  );
};
