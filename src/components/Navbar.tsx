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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10" style={{
      background: 'linear-gradient(180deg, hsl(200 30% 85% / 0.35), hsl(210 25% 75% / 0.2))',
    }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Fish className="w-8 h-8 text-pepe-glow" strokeWidth={2.5} />
        </Link>

        {/* Desktop Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Tokenomics', hash: '#tokenomics' },
            { label: 'How to Buy', hash: '#how-to-buy' },
            { label: 'Community', hash: '#community' },
          ].map(item => (
            <a key={item.hash} href={item.hash} onClick={(e) => handleAnchorClick(e, item.hash)} className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-sm tracking-wide">
              {item.label}
            </a>
          ))}
          <Link to="/news" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-sm tracking-wide">News</Link>
          <Link to="/lore" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-sm tracking-wide">Lore</Link>
          <Link to="/live" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold relative text-sm tracking-wide">
            Live
            <span className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-pepe-glow" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
        <div className="md:hidden absolute top-16 left-0 right-0 backdrop-blur-md border-b border-white/10 py-4" style={{
          background: 'hsl(200 30% 85% / 0.4)',
        }}>
          <div className="flex flex-col items-center gap-4">
            <a href="#tokenomics" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg" onClick={(e) => { handleAnchorClick(e, '#tokenomics'); setIsMenuOpen(false); }}>Tokenomics</a>
            <a href="#how-to-buy" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg" onClick={(e) => { handleAnchorClick(e, '#how-to-buy'); setIsMenuOpen(false); }}>How to Buy</a>
            <a href="#community" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg" onClick={(e) => { handleAnchorClick(e, '#community'); setIsMenuOpen(false); }}>Community</a>
            <Link to="/news" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg" onClick={() => setIsMenuOpen(false)}>News</Link>
            <Link to="/lore" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg" onClick={() => setIsMenuOpen(false)}>Lore</Link>
            <Link to="/live" className="text-pepe-glow hover:text-pepe-light transition-colors font-bold text-lg relative" onClick={() => setIsMenuOpen(false)}>
              Live
              <span className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </Link>
            <a href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG" target="_blank" rel="noopener noreferrer" className="btn-fire text-sm py-2 px-4 w-full max-w-[200px] text-center" onClick={() => setIsMenuOpen(false)}>Buy Now</a>
          </div>
        </div>
      )}
    </nav>
  );
};
