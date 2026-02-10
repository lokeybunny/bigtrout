import { Twitter } from 'lucide-react';
import { useState } from 'react';
import heroBanner from '@/assets/bigtrout-hero-banner.jpg';

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
import dexscreenerLogo from '@/assets/logos/dexscreener.png';
import poloniexLogo from '@/assets/logos/poloniex.png';
import bitrueLogo from '@/assets/logos/bitrue.svg';
import moontokLogo from '@/assets/logos/moontok.svg';
import binanceLogo from '@/assets/logos/binance.png';
import phantomLogo from '@/assets/logos/phantom.png';
import okxLogo from '@/assets/logos/okx.png';
import coin98Logo from '@/assets/logos/coin98.png';
import cryptoComLogo from '@/assets/logos/crypto-com.png';
import kcexLogo from '@/assets/logos/kcex.png';
import bilaxyLogo from '@/assets/logos/bilaxy.png';
import bigoneLogo from '@/assets/logos/bigone.png';
import pumpswapLogo from '@/assets/logos/pumpswap.png';
import raydiumLogo from '@/assets/logos/raydium.png';
import fomoLogo from '@/assets/logos/fomo.png';
import solflareLogo from '@/assets/logos/solflare.png';
import solanaWalletLogo from '@/assets/logos/solana-wallet.png';
import bitgetWalletLogo from '@/assets/logos/bitget-wallet.png';
import pionexLogo from '@/assets/logos/pionex.png';

const CONTRACT_ADDRESS = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";

const socialLinks = [
  { icon: Twitter, name: 'Community', handle: 'Join on X', url: 'https://x.com/i/communities/2019176023888187687', color: 'green' },
];

const exchangeLogos = [
  { name: 'MEXC', logo: mexcLogo, url: 'https://www.mexc.com/exchange/BIGTROUT_USDT?_from=search_spot_trade', alt: 'Trade BIGTROUT on MEXC' },
  { name: 'LBank', logo: lbankLogo, url: 'https://www.lbank.com/trade/bigtrout_usdt', alt: 'Trade BIGTROUT on LBank' },
  { name: 'Moonshot', logo: moonshotLogo, url: 'https://moonshot.money', alt: 'Trade BIGTROUT on Moonshot' },
  { name: 'PocketFi', logo: pocketfiLogo, url: 'https://pocketfi.org/en/', alt: 'Trade BIGTROUT on PocketFi' },
  { name: 'MobyAgent', logo: mobyagentLogo, url: 'https://www.mobyscreener.com/solana/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG', alt: 'Trade BIGTROUT on MobyAgent' },
  { name: 'Jupiter', logo: jupiterLogo, url: `https://jup.ag/tokens/${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Jupiter' },
  { name: 'CoinMarketCap', logo: coinmarketcapLogo, url: 'https://coinmarketcap.com/mobile/', alt: 'View BIGTROUT on CoinMarketCap' },
  { name: 'CoinGecko', logo: coingeckoLogo, url: 'https://www.coingecko.com/en/coins/bigtrout', alt: 'View BIGTROUT on CoinGecko' },
  { name: 'BTSE', logo: btseLogo, url: 'https://www.btse.com/en/trading/BIGTROUT-USDT', alt: 'Trade BIGTROUT on BTSE' },
  { name: 'BitMart', logo: bitmartLogo, url: 'https://www.bitmart.com/en-US/trade/BIGTROUT_USDT?type=spot', alt: 'Trade BIGTROUT on BitMart' },
  { name: 'Blynex', logo: blynexLogo, url: 'https://blynex.com/spot/TheBigTrout_USDT', alt: 'Trade BIGTROUT on Blynex' },
  { name: 'WEEX', logo: weexLogo, url: 'https://www.weex.com/spot/BIGTROUT-USDT?vipCode=ipqs', alt: 'Trade BIGTROUT on WEEX' },
  { name: 'Coindar', logo: coindarLogo, url: 'https://coindar.org/en/event/the-big-trout-to-be-listed-on-weex-140441', alt: 'View BIGTROUT on Coindar' },
  { name: 'KuCoin', logo: kucoinLogo, url: 'https://www.kucoin.com/announcement/en-kucoin-alpha-has-listed-token-bigtrout-and-usor?utm_source=social_listing_2026_twitter&utm_medium=social_media_pos', alt: 'Trade BIGTROUT on KuCoin' },
  { name: 'DexScreener', logo: dexscreenerLogo, url: 'https://dexscreener.com/solana/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG', alt: 'View BIGTROUT on DexScreener' },
  { name: 'Poloniex', logo: poloniexLogo, url: 'https://www.poloniex.com/trade/BIGTROUT_USDT', alt: 'Trade BIGTROUT on Poloniex' },
  { name: 'Bitrue', logo: bitrueLogo, url: 'https://www.bitrue.com/alpha/sol/bigtrout-EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG', alt: 'Trade BIGTROUT on Bitrue', hasBorder: true },
  { name: 'Moontok', logo: moontokLogo, url: 'https://moontok.io/coins/the-big-trout', alt: 'View BIGTROUT on Moontok' },
  { name: 'Binance', logo: binanceLogo, url: 'https://web3.binance.com/en/token/sol/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG', alt: 'Trade BIGTROUT on Binance' },
  { name: 'Phantom', logo: phantomLogo, url: `https://phantom.app/tokens/solana/${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on Phantom' },
  { name: 'OKX', logo: okxLogo, url: `https://www.okx.com/web3/dex-swap#inputChain=501&inputCurrency=${CONTRACT_ADDRESS}`, alt: 'View BIGTROUT on OKX' },
  { name: 'Coin98', logo: coin98Logo, url: `https://coin98.com/`, alt: 'View BIGTROUT on Coin98' },
  { name: 'Crypto.com', logo: cryptoComLogo, url: `https://crypto.com/`, alt: 'View BIGTROUT on Crypto.com' },
  { name: 'KCEX', logo: kcexLogo, url: `https://www.kcex.com/exchange/BIGTROUT_USDT`, alt: 'Trade BIGTROUT on KCEX' },
  { name: 'Bilaxy', logo: bilaxyLogo, url: `https://bilaxy.com/trade/BIGTROUT_USDT`, alt: 'Trade BIGTROUT on Bilaxy' },
  { name: 'Ourbit', logo: null, url: `https://www.ourbit.com/exchange/BIGTROUT_USDT`, alt: 'Trade BIGTROUT on Ourbit' },
  { name: 'BigONE', logo: bigoneLogo, url: `https://big.one/en/trade/BIGTROUT-USDT`, alt: 'Trade BIGTROUT on BigONE' },
  { name: 'PumpSwap', logo: pumpswapLogo, url: `https://pump.fun/coin/${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on PumpSwap' },
  { name: 'Meteora', logo: null, url: `https://app.meteora.ag/pools?token=${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Meteora' },
  { name: 'Raydium', logo: raydiumLogo, url: `https://raydium.io/swap/?inputMint=sol&outputMint=${CONTRACT_ADDRESS}`, alt: 'Trade BIGTROUT on Raydium' },
  { name: 'Fomo', logo: fomoLogo, url: `https://fomo.family/`, alt: 'Trade BIGTROUT on Fomo' },
  { name: 'Solflare', logo: solflareLogo, url: `https://solflare.com/`, alt: 'BIGTROUT on Solflare' },
  { name: 'Solana Wallet', logo: solanaWalletLogo, url: `https://solana.com/`, alt: 'BIGTROUT on Solana Wallet' },
  { name: 'Bitget Wallet', logo: bitgetWalletLogo, url: `https://web3.bitget.com/en/swap/solana?toToken=${CONTRACT_ADDRESS}`, alt: 'BIGTROUT on Bitget Wallet' },
  { name: 'Pionex', logo: pionexLogo, url: `https://www.pionex.com/en/trade/BIGTROUT_USDT/Bot`, alt: 'Trade BIGTROUT on Pionex' },
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

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 mb-10">
            {exchangeLogos.map((exchange, index) => (
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
