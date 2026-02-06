import { ExternalLink } from 'lucide-react';

const CONTRACT_ADDRESS = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";

const exchangeLogos = [
  {
    name: 'MEXC',
    url: `https://www.mexc.com/price/BIGTROUT`,
    alt: 'Trade BIGTROUT on MEXC',
  },
  {
    name: 'LBank',
    url: 'https://www.lbank.com/',
    alt: 'Trade BIGTROUT on LBank',
  },
  {
    name: 'Moonshot',
    url: `https://moonshot.money/${CONTRACT_ADDRESS}`,
    alt: 'Trade BIGTROUT on Moonshot',
  },
  {
    name: 'PocketFi',
    url: 'https://pocketfi.org/',
    alt: 'Trade BIGTROUT on PocketFi',
  },
  {
    name: 'MobyAgent',
    url: 'https://mobyagent.com/',
    alt: 'Trade BIGTROUT on MobyAgent',
  },
  {
    name: 'Jupiter',
    url: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
    alt: 'Trade BIGTROUT on Jupiter',
  },
  {
    name: 'CoinMarketCap',
    url: 'https://coinmarketcap.com/currencies/bigtrout/',
    alt: 'View BIGTROUT on CoinMarketCap',
  },
  {
    name: 'CoinGecko',
    url: 'https://www.coingecko.com/en/coins/bigtrout',
    alt: 'View BIGTROUT on CoinGecko',
  },
];

export const Footer = () => {
  return (
    <footer className="relative">
      {/* Exchange Logos Section */}
      <section 
        className="relative py-16 px-4"
        style={{
          background: 'linear-gradient(180deg, hsl(220 30% 6% / 0.95) 0%, hsl(225 35% 8%) 50%, hsl(220 30% 6%) 100%)',
        }}
      >
        {/* Subtle top border glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(195 90% 45% / 0.5), hsl(20 100% 50% / 0.5), transparent)',
          }}
        />

        <div className="max-w-[1400px] mx-auto">
          {/* Header Text */}
          <h3 
            className="text-center text-lg md:text-xl font-bold text-foreground mb-10"
            style={{
              textShadow: '0 0 20px hsl(200 100% 70% / 0.4), 0 0 40px hsl(20 100% 50% / 0.2)',
            }}
          >
            Trade $BIGTROUT on These Platforms:
          </h3>

          {/* Logos Grid */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 mb-10">
            {exchangeLogos.map((exchange, index) => (
              <a
                key={index}
                href={exchange.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 hover:scale-110"
                title={exchange.alt}
              >
                {/* Logo placeholder with text - styled as premium badges */}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80"
                  style={{
                    filter: 'grayscale(0.3) brightness(0.9)',
                  }}
                >
                  <span 
                    className="font-display font-bold text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors"
                    style={{
                      filter: 'none',
                    }}
                  >
                    {exchange.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, hsl(20 100% 50% / 0.15), transparent 70%)',
                    filter: 'blur(10px)',
                  }}
                />
              </a>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-center text-muted-foreground/70 text-xs md:text-sm max-w-2xl mx-auto">
            Always verify the contract address{' '}
            <code className="text-fire/80 font-mono text-xs break-all">
              {CONTRACT_ADDRESS}
            </code>{' '}
            before trading. DYOR.
          </p>
        </div>
      </section>

      {/* Main Footer */}
      <div 
        className="relative py-12 px-4 border-t border-border/30"
        style={{
          background: 'hsl(220 30% 5%)',
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <h3 className="font-display text-3xl font-black text-fire-ice mb-4">
            $BIGTROUT
          </h3>
          
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            Disclaimer: $BIGTROUT is a meme coin with no intrinsic value or expectation of financial return. 
            This is not financial advice. Trade at your own risk.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2025 $BIGTROUT</span>
            <span className="hidden sm:inline">•</span>
            <span>All Rights Reserved</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-fire">Fire</span>
            <span>&</span>
            <span className="text-ice">Ice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
