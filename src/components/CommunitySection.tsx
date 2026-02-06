import { Twitter } from 'lucide-react';
import { useState } from 'react';

// Import logo images
import mexcLogo from '@/assets/logos/mexc.png';
import lbankLogo from '@/assets/logos/lbank-new.png';
import moonshotLogo from '@/assets/logos/moonshot.png';
import pocketfiLogo from '@/assets/logos/pocketfi.png';
import mobyagentLogo from '@/assets/logos/mobyagent.svg';
import jupiterLogo from '@/assets/logos/jupiter.svg';
import coinmarketcapLogo from '@/assets/logos/coinmarketcap.png';
import coingeckoLogo from '@/assets/logos/coingecko.png';
import bitmartLogo from '@/assets/logos/bitmart.png';
import btseLogo from '@/assets/logos/btse.png';
import blynexLogo from '@/assets/logos/blynex.png';
import weexLogo from '@/assets/logos/weex.png';
import coindarLogo from '@/assets/logos/coindar.png';
import kucoinLogo from '@/assets/logos/kucoin.png';

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
    logo: mexcLogo,
    url: 'https://www.mexc.com/exchange/BIGTROUT_USDT?_from=search_spot_trade',
    alt: 'Trade BIGTROUT on MEXC',
  },
  {
    name: 'LBank',
    logo: lbankLogo,
    url: 'https://www.lbank.com/trade/bigtrout_usdt',
    alt: 'Trade BIGTROUT on LBank',
  },
  {
    name: 'Moonshot',
    logo: moonshotLogo,
    url: 'https://moonshot.money',
    alt: 'Trade BIGTROUT on Moonshot',
  },
  {
    name: 'PocketFi',
    logo: pocketfiLogo,
    url: 'https://pocketfi.org/en/',
    alt: 'Trade BIGTROUT on PocketFi',
  },
  {
    name: 'MobyAgent',
    logo: mobyagentLogo,
    url: 'https://www.mobyscreener.com/solana/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG',
    alt: 'Trade BIGTROUT on MobyAgent',
  },
  {
    name: 'Jupiter',
    logo: jupiterLogo,
    url: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`,
    alt: 'Trade BIGTROUT on Jupiter',
  },
  {
    name: 'CoinMarketCap',
    logo: coinmarketcapLogo,
    url: 'https://coinmarketcap.com/mobile/',
    alt: 'View BIGTROUT on CoinMarketCap',
  },
  {
    name: 'CoinGecko',
    logo: coingeckoLogo,
    url: 'https://www.coingecko.com/en/coins/bigtrout',
    alt: 'View BIGTROUT on CoinGecko',
  },
  {
    name: 'BTSE',
    logo: btseLogo,
    url: 'https://www.btse.com/en/trading/BIGTROUT-USDT',
    alt: 'Trade BIGTROUT on BTSE',
  },
  {
    name: 'BitMart',
    logo: bitmartLogo,
    url: 'https://www.bitmart.com/en-US/trade/BIGTROUT_USDT?type=spot',
    alt: 'Trade BIGTROUT on BitMart',
  },
  {
    name: 'Blynex',
    logo: blynexLogo,
    url: 'https://blynex.com/spot/TheBigTrout_USDT',
    alt: 'Trade BIGTROUT on Blynex',
  },
  {
    name: 'WEEX',
    logo: weexLogo,
    url: 'https://www.weex.com/spot/BIGTROUT-USDT?vipCode=ipqs',
    alt: 'Trade BIGTROUT on WEEX',
  },
  {
    name: 'Coindar',
    logo: coindarLogo,
    url: 'https://coindar.org/en/event/the-big-trout-to-be-listed-on-weex-140441',
    alt: 'View BIGTROUT on Coindar',
  },
  {
    name: 'KuCoin',
    logo: kucoinLogo,
    url: 'https://www.kucoin.com/announcement/en-kucoin-alpha-has-listed-token-bigtrout-and-usor?utm_source=social_listing_2026_twitter&utm_medium=social_media_pos',
    alt: 'Trade BIGTROUT on KuCoin',
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
    hue: 15 + Math.random() * 25,
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
            radial-gradient(ellipse at 20% 30%, hsl(240 60% 15% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(260 50% 12% / 0.5) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(235 35% 8%) 0%, 
              hsl(240 35% 6%) 20%,
              hsl(250 30% 5%) 60%,
              hsl(220 30% 6%) 100%
            )
          `,
        }}
      />

      {/* Top transition from lava/fire section */}
      <div 
        className="absolute top-0 left-0 right-0 h-48 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(20 100% 45% / 0.12) 0%, hsl(25 90% 40% / 0.06) 40%, transparent 100%)',
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

      <div className="relative z-10 max-w-5xl mx-auto text-center">
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
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 mb-10">
            {exchangeLogos.map((exchange, index) => (
              <a
                key={index}
                href={exchange.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-110"
                title={exchange.alt}
              >
                {exchange.logo ? (
                  <img
                    src={exchange.logo}
                    alt={exchange.alt}
                    className="h-10 md:h-12 lg:h-14 w-auto max-w-[120px] md:max-w-[150px] object-contain transition-all duration-300 brightness-90 grayscale-[30%] group-hover:brightness-110 group-hover:grayscale-0"
                    style={{
                      filter: 'drop-shadow(0 0 8px hsl(0 0% 100% / 0.2))',
                    }}
                  />
                ) : (
                  // Text fallback for logos that couldn't be downloaded
                  <div className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80">
                    <span className="font-display font-bold text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors">
                      {exchange.name}
                    </span>
                  </div>
                )}
                
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, hsl(20 100% 50% / 0.25), transparent 70%)',
                    filter: 'blur(15px)',
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
