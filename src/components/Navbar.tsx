import { Fish, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-fire" style={{
            background: 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))'
          }}>
            <Fish className="w-6 h-6 text-storm-dark" />
          </div>
          <Link to="/" className="font-display text-xl font-bold text-fire-ice">$BIGTROUT</Link>
        </div>

        {/* Desktop Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#tokenomics" onClick={(e) => handleAnchorClick(e, '#tokenomics')} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Tokenomics
          </a>
          <a href="#how-to-buy" onClick={(e) => handleAnchorClick(e, '#how-to-buy')} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            How to Buy
          </a>
          <a href="#community" onClick={(e) => handleAnchorClick(e, '#community')} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Community
          </a>
          <Link to="/news" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            News
          </Link>
          <Link to="/lore" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Lore
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* CTA */}
        <a 
          href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block btn-fire text-sm py-2 px-4"
        >
          Buy Now
        </a>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 py-4">
          <div className="flex flex-col items-center gap-4">
            <a 
              href="#tokenomics" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={(e) => { handleAnchorClick(e, '#tokenomics'); setIsMenuOpen(false); }}
            >
              Tokenomics
            </a>
            <a 
              href="#how-to-buy" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={(e) => { handleAnchorClick(e, '#how-to-buy'); setIsMenuOpen(false); }}
            >
              How to Buy
            </a>
            <a 
              href="#community" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={(e) => { handleAnchorClick(e, '#community'); setIsMenuOpen(false); }}
            >
              Community
            </a>
            <Link 
              to="/news" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link 
              to="/lore" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Lore
            </Link>
            <a 
              href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fire text-sm py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Buy Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
