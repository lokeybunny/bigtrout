import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, hsl(140 25% 15%), hsl(140 30% 20%))',
        border: '2px solid hsl(140 20% 30%)',
        boxShadow: '0 0 20px hsl(0 0% 0% / 0.3)',
      }}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
};
