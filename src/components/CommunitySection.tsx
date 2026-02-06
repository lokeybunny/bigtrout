import { Twitter, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";

const socialLinks = [
  {
    icon: Twitter,
    name: 'Community',
    handle: 'Join on X',
    url: 'https://x.com/i/communities/2019176023888187687',
    color: 'fire',
  },
];

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

// Generate random shooting stars
const generateShootingStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 50,
    delay: Math.random() * 8,
    duration: 1 + Math.random() * 2,
  }));
};

// Generate fire dust particles
const generateFireDust = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 4,
    hue: 15 + Math.random() * 25, // Orange to red hues
  }));
};

export const CommunitySection = () => {
  const [shootingStars] = useState(() => generateShootingStars(8));
  const [fireDust] = useState(() => generateFireDust(30));

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Night sky background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, hsl(240 60% 15% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, hsl(260 50% 12% / 0.5) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(230 40% 8%) 0%, 
              hsl(240 35% 6%) 30%,
              hsl(250 30% 5%) 60%,
              hsl(220 30% 6%) 100%
            )
          `,
        }}
      />

      {/* Static stars */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: 0.3 + Math.random() * 0.7,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}`}
          className="absolute z-0"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: '100px',
            height: '2px',
            background: 'linear-gradient(90deg, hsl(200 100% 90%), hsl(200 100% 70% / 0.5), transparent)',
            borderRadius: '2px',
            transform: 'rotate(-45deg)',
            animation: `shootingStar ${star.duration}s ease-out infinite`,
            animationDelay: `${star.delay}s`,
            boxShadow: '0 0 10px hsl(200 100% 80% / 0.8), 0 0 20px hsl(200 100% 70% / 0.4)',
          }}
        />
      ))}

      {/* Fire dust particles */}
      {fireDust.map((dust) => (
        <div
          key={`dust-${dust.id}`}
          className="absolute z-0 rounded-full"
          style={{
            left: `${dust.left}%`,
            bottom: '-20px',
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            background: `radial-gradient(circle, hsl(${dust.hue} 100% 60%), hsl(${dust.hue} 100% 40% / 0.5), transparent)`,
            boxShadow: `0 0 ${dust.size * 2}px hsl(${dust.hue} 100% 50% / 0.6)`,
            animation: `fireDustRise ${dust.duration}s ease-out infinite`,
            animationDelay: `${dust.delay}s`,
          }}
        />
      ))}

      {/* Fire glow at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, hsl(20 100% 50% / 0.15), hsl(30 100% 40% / 0.08) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Section header */}
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
          <span className="text-ice">JOIN THE</span>{' '}
          <span className="text-fire">ARMY</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
          The BIGTROUT community is growing stronger. Join us on our quest for volcanic gains.
        </p>

        {/* Social links */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-volcanic px-8 py-6 flex items-center gap-4 group cursor-pointer"
            >
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  social.color === 'fire' ? 'glow-fire group-hover:scale-110' : 'glow-ice group-hover:scale-110'
                }`}
                style={{
                  background: social.color === 'fire' 
                    ? 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))'
                    : 'linear-gradient(135deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                }}
              >
                <social.icon className="w-6 h-6 text-storm-dark" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">{social.name}</p>
                <p className="text-sm text-muted-foreground">{social.handle}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Exchange Logos Section */}
        <div className="mb-12">
          <h3 
            className="text-lg md:text-xl font-bold text-foreground mb-10"
            style={{
              textShadow: '0 0 20px hsl(200 100% 70% / 0.4), 0 0 40px hsl(20 100% 50% / 0.2)',
            }}
          >
            Trade $BIGTROUT on These Platforms:
          </h3>

          {/* Logos Grid */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 lg:gap-10 mb-10">
            {exchangeLogos.map((exchange, index) => (
              <a
                key={index}
                href={exchange.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center transition-all duration-300 hover:scale-110"
                title={exchange.alt}
              >
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80"
                >
                  <span className="font-display font-bold text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors">
                    {exchange.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, hsl(20 100% 50% / 0.2), transparent 70%)',
                    filter: 'blur(10px)',
                  }}
                />
              </a>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-muted-foreground/70 text-xs md:text-sm max-w-2xl mx-auto">
            Always verify the contract address{' '}
            <code className="text-fire/80 font-mono text-xs break-all">
              {CONTRACT_ADDRESS}
            </code>{' '}
            before trading. DYOR.
          </p>
        </div>
      </div>
    </section>
  );
};
