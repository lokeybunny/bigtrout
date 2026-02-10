import { Fish, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const scrolled = true;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const linkColor = scrolled ? 'text-foreground' : 'text-ukiyo-ink';
  const mobileMenuBg = scrolled
    ? 'hsl(210 25% 10% / 0.95)'
    : 'hsl(200 30% 85% / 0.4)';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-500" style={{
      background: scrolled
        ? 'linear-gradient(180deg, hsl(210 25% 10% / 0.9), hsl(210 25% 10% / 0.8))'
        : 'linear-gradient(180deg, hsl(200 30% 85% / 0.35), hsl(210 25% 75% / 0.2))',
      borderColor: scrolled ? 'hsl(200 18% 22% / 0.4)' : 'hsl(0 0% 100% / 0.1)',
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
            <a key={item.hash} href={item.hash} onClick={(e) => handleAnchorClick(e, item.hash)} className={`${linkColor} hover:scale-110 transition-all duration-300 font-bold text-sm tracking-wide`}>
              {item.label}
            </a>
          ))}
          <Link to="/news" className={`${linkColor} hover:scale-110 transition-all duration-300 font-bold text-sm tracking-wide`}>News</Link>
          <Link to="/lore" className={`${linkColor} hover:scale-110 transition-all duration-300 font-bold text-sm tracking-wide`}>Lore</Link>
          <Link to="/game" className={`${linkColor} hover:scale-110 transition-all duration-300 font-bold text-sm tracking-wide`}>Game</Link>
          <Link to="/live" className={`${linkColor} hover:scale-110 transition-all duration-300 font-bold text-sm tracking-wide inline-flex items-center gap-1.5`}>
            Live
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className={`md:hidden p-2 ${linkColor} transition-colors duration-300`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href="#listings"
            onClick={(e) => handleAnchorClick(e, '#listings')}
            className="text-sm py-2 px-4 font-bold border border-pepe/50 rounded-md text-pepe hover:bg-pepe/10 transition-all duration-300"
          >
            Listings
          </a>
          <a
            href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fire text-sm py-2 px-4"
          >
            Buy Now
          </a>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 backdrop-blur-md border-b border-white/10 py-4 transition-colors duration-300" style={{
          background: mobileMenuBg,
        }}>
          <div className="flex flex-col items-center gap-4">
            <a href="#tokenomics" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={(e) => { handleAnchorClick(e, '#tokenomics'); setIsMenuOpen(false); }}>Tokenomics</a>
            <a href="#how-to-buy" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={(e) => { handleAnchorClick(e, '#how-to-buy'); setIsMenuOpen(false); }}>How to Buy</a>
            <a href="#community" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={(e) => { handleAnchorClick(e, '#community'); setIsMenuOpen(false); }}>Community</a>
            <Link to="/news" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={() => setIsMenuOpen(false)}>News</Link>
            <Link to="/lore" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={() => setIsMenuOpen(false)}>Lore</Link>
            <Link to="/game" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={() => setIsMenuOpen(false)}>Game</Link>
            <Link to="/live" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg inline-flex items-center gap-1.5`} onClick={() => setIsMenuOpen(false)}>
              Live
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </Link>
            <a href="#listings" className={`${linkColor} hover:scale-110 transition-all font-bold text-lg`} onClick={(e) => { handleAnchorClick(e, '#listings'); setIsMenuOpen(false); }}>Listings</a>
            <a href="https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG" target="_blank" rel="noopener noreferrer" className="btn-fire text-sm py-2 px-4 w-full max-w-[200px] text-center" onClick={() => setIsMenuOpen(false)}>Buy Now</a>
          </div>
        </div>
      )}
    </nav>
  );
};
