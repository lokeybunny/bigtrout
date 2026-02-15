import { Twitter } from 'lucide-react';
import { useState } from 'react';
import heroBanner from '@/assets/bigtrout-hero-banner.jpg';

// Import logo images
import mexcLogo from '@/assets/logos/mexc.png';
import lbankLogo from '@/assets/logos/lbank-2026.png';
import moonshotLogo from '@/assets/logos/moonshot.png';
import pocketfiLogo from '@/assets/logos/pocketfi.png';
import mobyagentLogo from '@/assets/logos/mobyagent.svg';
import jupiterLogo from '@/assets/logos/jupiter.svg';
import coinmarketcapLogo from '@/assets/logos/coinmarketcap.png';
import coingeckoLogo from '@/assets/logos/coingecko.png';
import bitmartLogo from '@/assets/logos/bitmart-2025.png';
import btseLogo from '@/assets/logos/btse-2026.png';
import blynexLogo from '@/assets/logos/blynex.png';
import weexLogo from '@/assets/logos/weex.png';
import coindarLogo from '@/assets/logos/coindar.png';
import kucoinLogo from '@/assets/logos/kucoin.png';
import dexscreenerLogo from '@/assets/logos/dexscreener.png';
import poloniexLogo from '@/assets/logos/poloniex.png';
const bitrueLogo = 'data:image/jpeg;base64,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';
import ourbitLogo from '@/assets/logos/ourbit.svg';
import moontokLogo from '@/assets/logos/moontok.svg';
import binanceLogo from '@/assets/logos/binance.png';
import phantomLogo from '@/assets/logos/phantom.png';
import okxLogo from '@/assets/logos/okx.png';
import coin98Logo from '@/assets/logos/coin98.png';
import cryptoComLogo from '@/assets/logos/crypto-com.png';
import kcexLogo from '@/assets/logos/kcex.png';
import bilaxyLogo from '@/assets/logos/bilaxy.png';
import bigoneLogo from '@/assets/logos/bigone.svg';
import pumpswapLogo from '@/assets/logos/pumpswap.png';
import meteoraLogo from '@/assets/logos/meteora.svg';
import raydiumLogo from '@/assets/logos/raydium.png';
import fomoLogo from '@/assets/logos/fomo.png';
import solflareLogo from '@/assets/logos/solflare.png';
import solanaWalletLogo from '@/assets/logos/solana-wallet.png';
import bitgetWalletLogo from '@/assets/logos/bitget-wallet.png';
import pionexLogo from '@/assets/logos/pionex.png';
import bingxLogo from '@/assets/logos/bingx.png';
import phemexLogo from '@/assets/logos/phemex.png';
import tangemLogo from '@/assets/logos/tangem.png';
import wasabiLogo from '@/assets/logos/wasabi.svg';

const CONTRACT_ADDRESS = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const socialLinks = [
  { icon: Twitter, name: 'Community', handle: 'Join on X', url: 'https://x.com/i/communities/2019176023888187687', color: 'green' },
  { icon: TelegramIcon, name: 'Telegram', handle: 'Join on Telegram', url: 'https://t.me/BigTrout300Solana', color: 'blue' },
  { icon: Twitter, name: 'X Raid Chat', handle: 'Join Raid Chat', url: 'https://x.com/i/chat/group_join/g2021055493003936099/214SHu5krJ', color: 'green' },
];

type FilterCategory = 'all' | 'cex' | 'dex';

const exchangeLogos = [
  // CEX & Trading Platforms
  { name: 'LBank', logo: lbankLogo, url: 'https://www.lbank.com/trade/bigtrout_usdt', alt: 'Trade BIGTROUT on LBank', category: 'cex' as const },
  { name: 'BitMart', logo: bitmartLogo, url: 'https://www.bitmart.com/en-US/trade/BIGTROUT_USDT?type=spot', alt: 'Trade BIGTROUT on BitMart', category: 'cex' as const },
  { name: 'KuCoin', logo: kucoinLogo, url: 'https://www.kucoin.com/announcement/en-kucoin-alpha-has-listed-token-bigtrout-and-usor?utm_source=social_listing_2026_twitter&utm_medium=social_media_pos', alt: 'Trade BIGTROUT on KuCoin Alpha', category: 'cex' as const },
  { name: 'Poloniex', logo: poloniexLogo, url: 'https://www.poloniex.com/trade/BIGTROUT_USDT', alt: 'Trade BIGTROUT on Poloniex', category: 'cex' as const },
  { name: 'KCEX', logo: kcexLogo, url: 'https://www.kcex.com/exchange/BIGTROUT_USDT', alt: 'Trade BIGTROUT on KCEX', category: 'cex' as const },
  { name: 'WEEX', logo: weexLogo, url: 'https://www.weex.com/spot/BIGTROUT-USDT?vipCode=ipqs', alt: 'Trade BIGTROUT on WEEX', category: 'cex' as const },
  { name: 'Bilaxy', logo: bilaxyLogo, url: 'https://bilaxy.com/trade/BIGTROUT_USDT', alt: 'Trade BIGTROUT on Bilaxy', category: 'cex' as const },
  { name: 'Ourbit', logo: ourbitLogo, url: 'https://www.ourbit.com/exchange/BIGTROUT_USDT', alt: 'Trade BIGTROUT on Ourbit', category: 'cex' as const },
  { name: 'BTSE', logo: btseLogo, url: 'https://www.btse.com/en/trading/BIGTROUT-USDT', alt: 'Trade BIGTROUT on BTSE', category: 'cex' as const },
  { name: 'Blynex', logo: blynexLogo, url: 'https://blynex.com/spot/TheBigTrout_USDT', alt: 'Trade BIGTROUT on Blynex', category: 'cex' as const },
  { name: 'BigONE', logo: bigoneLogo, url: 'https://big.one/en/trade/BIGTROUT-USDT', alt: 'Trade BIGTROUT on BigONE Alpha', category: 'cex' as const },
  { name: 'MEXC', logo: mexcLogo, url: 'https://www.mexc.com/exchange/BIGTROUT_USDT?_from=search_spot_trade', alt: 'Trade BIGTROUT on MEXC Meme+', category: 'cex' as const },
  { name: 'Bitrue', logo: bitrueLogo, url: 'https://www.bitrue.com/alpha/sol/bigtrout-EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG', alt: 'Trade BIGTROUT on Bitrue Alpha', category: 'cex' as const },
  { name: 'BingX', logo: bingxLogo, url: 'https://bingx.com/en/perpetual/BIGTROUT-USDT', alt: 'Trade BIGTROUT on BingX', category: 'cex' as const },
  { name: 'Pionex', logo: pionexLogo, url: 'https://www.pionex.com/en/trade/BIGTROUT_USDT/Bot', alt: 'Trade BIGTROUT on Pionex', category: 'cex' as const },
  // DEX & Platforms
  { name: 'PumpSwap', logo: pumpswapLogo, url: `https://pump.fun/coin/${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on PumpSwap', category: 'dex' as const },
  { name: 'Meteora', logo: meteoraLogo, url: `https://app.meteora.ag/pools?token=${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Meteora', category: 'dex' as const },
  { name: 'Raydium', logo: raydiumLogo, url: `https://raydium.io/swap/?inputMint=sol&outputMint=${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Raydium', category: 'dex' as const },
  { name: 'Jupiter', logo: jupiterLogo, url: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Jupiter', category: 'dex' as const },
  { name: 'Moonshot', logo: moonshotLogo, url: 'https://moonshot.money', alt: 'Trade BIGTROUT on Moonshot', category: 'dex' as const },
  { name: 'Fomo', logo: fomoLogo, url: 'https://fomo.family/', alt: 'Trade BIGTROUT on Fomo', category: 'dex' as const },
  { name: 'MobyAgent', logo: mobyagentLogo, url: `https://www.mobyscreener.com/solana/${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on MobyAgent', category: 'dex' as const },
  { name: 'Phemex', logo: phemexLogo, url: 'https://phemex.com/', alt: 'Trade BIGTROUT on Phemex Onchain', category: 'dex' as const },
  { name: 'Wasabi', logo: wasabiLogo, url: 'https://app.wasabi.xyz/?market=BigTroutUSDC&network=solana', alt: 'Trade BIGTROUT on Wasabi', category: 'dex' as const },
  // Listed & Verified
  { name: 'CoinGecko', logo: coingeckoLogo, url: 'https://www.coingecko.com/en/coins/the-big-trout', alt: 'View BIGTROUT on CoinGecko', category: 'dex' as const },
  { name: 'CoinMarketCap', logo: coinmarketcapLogo, url: 'https://coinmarketcap.com/mobile/', alt: 'View BIGTROUT on CoinMarketCap', category: 'dex' as const },
  { name: 'DexScreener', logo: dexscreenerLogo, url: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`, alt: 'View BIGTROUT on DexScreener', category: 'dex' as const },
  { name: 'Coindar', logo: coindarLogo, url: 'https://coindar.org/en/event/the-big-trout-to-be-listed-on-weex-140441', alt: 'View BIGTROUT on Coindar', category: 'dex' as const },
  { name: 'Moontok', logo: moontokLogo, url: 'https://moontok.io/coins/the-big-trout', alt: 'View BIGTROUT on Moontok', category: 'dex' as const },
  { name: 'PocketFi', logo: pocketfiLogo, url: 'https://pocketfi.org/en/', alt: 'Trade BIGTROUT on PocketFi', category: 'dex' as const },
  // Wallets
  { name: 'Phantom', logo: phantomLogo, url: `https://phantom.app/tokens/solana/${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on Phantom', category: 'dex' as const },
  { name: 'Solflare', logo: solflareLogo, url: 'https://solflare.com/', alt: 'BIGTROUT on Solflare', category: 'dex' as const },
  { name: 'Solana Wallet', logo: solanaWalletLogo, url: 'https://solana.com/', alt: 'BIGTROUT on Solana Wallet', category: 'dex' as const },
  { name: 'OKX', logo: okxLogo, url: `https://www.okx.com/web3/dex-swap#inputChain=501&inputCurrency=${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on OKX Wallet', category: 'dex' as const },
  { name: 'Crypto.com', logo: cryptoComLogo, url: 'https://crypto.com/', alt: 'BIGTROUT on Crypto.com Wallet', category: 'dex' as const },
  { name: 'Coin98', logo: coin98Logo, url: 'https://coin98.com/', alt: 'BIGTROUT on Coin98 Wallet', category: 'dex' as const },
  { name: 'Binance', logo: binanceLogo, url: `https://web3.binance.com/en/token/sol/${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on Binance Web3 Wallet', category: 'dex' as const },
  { name: 'Bitget Wallet', logo: bitgetWalletLogo, url: `https://web3.bitget.com/en/swap/solana?toToken=${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on Bitget Wallet', category: 'dex' as const },
  { name: 'Tangem', logo: tangemLogo, url: 'https://tangem.com/en/coins/the-big-trout/', alt: 'BIGTROUT on Tangem', category: 'dex' as const },
];

// Generate fireflies
const generateFireflies = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: 20 + Math.random() * 60,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 3,
  }));
};

// Generate sakura petals
const generatePetals = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
  }));
};

export const CommunitySection = () => {
  const [fireflies] = useState(() => generateFireflies(15));
  const [petals] = useState(() => generatePetals(10));
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background — faded hero art as ambient texture */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${heroBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        filter: 'blur(40px) saturate(0.4) brightness(0.2)',
        transform: 'scale(1.3)',
      }} />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0" style={{
        background: `
          radial-gradient(ellipse at 20% 30%, hsl(200 30% 18% / 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, hsl(345 25% 15% / 0.4) 0%, transparent 50%),
          linear-gradient(180deg, hsl(210 25% 10% / 0.9) 0%, hsl(210 22% 9% / 0.85) 50%, hsl(210 25% 10% / 0.9) 100%)
        `,
      }} />

      {/* Brush stroke divider at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-[1] divider-brush" />

      {/* Fireflies */}
      {fireflies.map((fly) => (
        <div key={`fly-${fly.id}`} className="absolute z-[2] rounded-full" style={{
          left: `${fly.left}%`,
          top: `${fly.top}%`,
          width: `${fly.size}px`,
          height: `${fly.size}px`,
          background: `radial-gradient(circle, hsl(130 60% 60%), hsl(130 50% 45% / 0.5), transparent)`,
          boxShadow: `0 0 ${fly.size * 3}px hsl(130 55% 50% / 0.5)`,
          animation: `twinkle ${fly.duration}s ease-in-out infinite`,
          animationDelay: `${fly.delay}s`,
        }} />
      ))}

      {/* Sakura petals */}
      {petals.map((petal) => (
        <div key={`petal-${petal.id}`} className="absolute z-[2] animate-petal" style={{
          left: `${petal.left}%`,
          top: '-10px',
          width: `${petal.size}px`,
          height: `${petal.size}px`,
          borderRadius: '50% 0 50% 0',
          background: `radial-gradient(circle, hsl(345 65% 82%), hsl(345 55% 70% / 0.5))`,
          animationDelay: `${petal.delay}s`,
          animationDuration: `${petal.duration}s`,
          transform: 'rotate(45deg)',
        }} />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
          <span className="text-sakura">JOIN THE</span>{' '}
          <span className="text-pepe">ARMY</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
          The BIGTROUT community is growing stronger. Join the most based army in crypto.
        </p>

        {/* Social links */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          {socialLinks.map((social, index) => (
            <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="card-ukiyo px-8 py-6 flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center glow-fire group-hover:scale-110 transition-all" style={{
                background: 'linear-gradient(135deg, hsl(130 45% 38%), hsl(130 55% 52%))',
              }}>
                <social.icon className="w-6 h-6" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">{social.name}</p>
                <p className="text-sm text-muted-foreground">{social.handle}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Exchange Logos Section */}
        <div id="listings" className="mb-12">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-10" style={{
            textShadow: '0 0 15px hsl(130 45% 38% / 0.3), 0 0 30px hsl(345 45% 55% / 0.15)',
          }}>
            Trade $BIGTROUT on These Platforms:
          </h3>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-2 mb-8">
            {([
              { key: 'all' as FilterCategory, label: 'All' },
              { key: 'cex' as FilterCategory, label: 'CEX' },
              { key: 'dex' as FilterCategory, label: 'DEX & Web3' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-5 py-2 rounded-full text-sm font-display font-bold tracking-wide transition-all duration-300 border ${
                  activeFilter === key
                    ? 'border-primary/60 bg-primary/15 text-foreground shadow-[0_0_12px_hsl(130_45%_38%/0.3)]'
                    : 'border-border/40 bg-card/30 text-muted-foreground hover:border-border/70 hover:bg-card/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 mb-10">
            {exchangeLogos.filter(e => activeFilter === 'all' || e.category === activeFilter).map((exchange, index) => (
              <a key={index} href={exchange.url} target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-110" title={exchange.alt}>
                {exchange.logo ? (
                  <img
                    src={exchange.logo}
                    alt={exchange.alt}
                    className={`h-10 md:h-12 lg:h-14 w-auto max-w-[120px] md:max-w-[150px] object-contain transition-all duration-300 brightness-90 grayscale-[30%] group-hover:brightness-110 group-hover:grayscale-0 ${(exchange as any).hasBorder ? 'border-2 border-white/80 rounded-lg p-1' : ''}`}
                    style={{ filter: 'drop-shadow(0 0 6px hsl(0 0% 100% / 0.15))' }}
                  />
                ) : (
                  <div className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80">
                    <span className="font-display font-bold text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors">{exchange.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                  background: 'radial-gradient(circle, hsl(130 45% 42% / 0.2), transparent 70%)',
                  filter: 'blur(15px)',
                }} />
              </a>
            ))}
          </div>

          <p className="font-display text-2xl md:text-3xl font-bold tracking-wider mt-8 mb-6" style={{
            color: 'hsl(0 0% 80%)',
            textShadow: '0 0 20px hsl(0 0% 100% / 0.15), 0 2px 4px hsl(0 0% 0% / 0.5)',
            letterSpacing: '0.12em',
          }}>
            + MORE ON THE WAY
          </p>

          <p className="text-muted-foreground/70 text-xs md:text-sm max-w-2xl mx-auto">
            Always verify the contract address{' '}
            <code className="text-pepe/80 font-mono text-xs break-all">{CONTRACT_ADDRESS}</code>{' '}
            before trading. DYOR.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 z-[1] divider-brush" />
    </section>
  );
};
