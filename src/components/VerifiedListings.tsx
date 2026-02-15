import { ExternalLink, Shield, Wallet, BarChart3, Globe, Copy, Check, TrendingUp, Layers } from 'lucide-react';
import { useState } from 'react';

const CA = 'EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG';

interface ListingItem {
  name: string;
  detail: string;
  badge?: string;
}

const spotListings: ListingItem[] = [
  { name: 'LBank', detail: 'USDT', badge: 'highest vol' },
  { name: 'BitMart', detail: 'USDT' },
  { name: 'KuCoin Alpha', detail: 'USDT' },
  { name: 'Poloniex', detail: 'USDT' },
  { name: 'KCEX', detail: 'USDT' },
  { name: 'WEEX', detail: 'USDT' },
  { name: 'Bilaxy', detail: 'USDT' },
  { name: 'Ourbit', detail: 'USDT' },
  { name: 'BTSE', detail: 'USDT' },
  { name: 'Blynex', detail: 'USDT' },
  { name: 'BigONE Alpha', detail: '' },
  { name: 'MEXC', detail: 'Meme+' },
  { name: 'Bitrue Alpha', detail: '' },
  { name: 'Pionex', detail: 'USDT Spot', badge: 'live Feb 12' },
  { name: 'PumpSwap', detail: 'SOL', badge: 'main DEX pool' },
  { name: 'Meteora', detail: 'multiple SOL/USDC pools' },
  { name: 'Raydium', detail: 'supported pairs' },
  { name: 'Jupiter', detail: 'aggregator' },
  { name: 'Moonshot', detail: 'supported' },
  { name: 'Fomo', detail: 'verified + tracked' },
  { name: 'Moby', detail: 'tracked + trading + airdrops' },
  { name: 'Phemex Onchain', detail: 'supported spot trading (zero-gas)' },
  { name: 'CoinGecko', detail: 'fully tracked (live chart, MC, 18+ markets)' },
];

const perpsListings: ListingItem[] = [
  { name: 'BingX', detail: 'Perpetual Futures + ChainSpot', badge: 'live' },
];

const walletListings: ListingItem[] = [
  { name: 'Phantom', detail: 'purple checkmark + full UI' },
  { name: 'Solflare', detail: 'official support' },
  { name: 'Solana Wallet', detail: 'officially verified' },
  { name: 'OKX Wallet', detail: 'officially verified' },
  { name: 'Crypto.com Wallet', detail: 'officially verified' },
  { name: 'Coin98 Wallet', detail: 'officially verified' },
  { name: 'Binance Web3 Wallet', detail: 'full DEX swaps' },
  { name: 'Bitget Wallet', detail: 'in-wallet Solana DEX' },
  { name: 'Tangem Hardware Wallet', detail: 'dedicated coin page + full Solana support' },
];

const stakingLpListings: ListingItem[] = [
  { name: 'Meteora', detail: 'SOL/USDC liquidity pools' },
  { name: 'Raydium', detail: 'LP farming pairs' },
  { name: 'PumpSwap', detail: 'SOL liquidity pool' },
];

const CategoryCard = ({
  icon: Icon,
  title,
  subtitle,
  items,
  accentClass,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  items: ListingItem[];
  accentClass: string;
}) => (
  <div className="card-volcanic p-6 md:p-8">
    <div className="flex items-center gap-3 mb-1">
      <Icon className={`w-5 h-5 ${accentClass}`} />
      <h3 className={`font-display text-xl md:text-2xl font-bold ${accentClass}`}>{title}</h3>
    </div>
    <p className="text-muted-foreground text-sm mb-6 ml-8">{subtitle}</p>

    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={item.name}
          className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        >
          <span className="text-muted-foreground text-xs font-mono w-6 text-right shrink-0">
            {i + 1}.
          </span>
          <span className="font-display text-sm text-foreground font-semibold">{item.name}</span>
          {item.detail && (
            <span className="text-muted-foreground text-xs">— {item.detail}</span>
          )}
          {item.badge && (
            <span
              className={`ml-auto text-[10px] font-display tracking-wider uppercase px-2 py-0.5 rounded-full border ${accentClass} border-current/20 bg-current/5 shrink-0`}
            >
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const VerifiedListings = () => {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative mt-20 pt-16 border-t border-white/[0.06]">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-black mb-3">
          <span className="text-pepe">VERIFIED</span>{' '}
          <span className="text-sakura">LISTINGS</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Complete as of Feb 10, 2026 EET
        </p>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
          <a
            href="https://t.me/BigTrout300Solana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-fire hover:text-ember transition-colors font-display tracking-wider"
          >
            Telegram Updates <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-white/10">|</span>
          <a
            href="https://BigTrout.Fun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ice hover:text-foreground transition-colors font-display tracking-wider"
          >
            BigTrout.Fun <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryCard
          icon={BarChart3}
          title="Spot Trading"
          subtitle={`${spotListings.length} CEX & DEX platforms`}
          items={spotListings}
          accentClass="text-fire"
        />
        <CategoryCard
          icon={TrendingUp}
          title="Perpetual Futures"
          subtitle={`${perpsListings.length} platform`}
          items={perpsListings}
          accentClass="text-pepe"
        />
        <CategoryCard
          icon={Wallet}
          title="Web3 Wallets"
          subtitle="Officially verified & supported"
          items={walletListings}
          accentClass="text-sakura"
        />
        <CategoryCard
          icon={Layers}
          title="Staking & LP Providers"
          subtitle="Liquidity pools & yield"
          items={stakingLpListings}
          accentClass="text-ice"
        />
      </div>

      {/* Contract Address */}
      <div className="mt-10 text-center">
        <p className="text-muted-foreground text-xs font-display tracking-widest uppercase mb-2">
          Contract Address
        </p>
        <button
          onClick={copyCA}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors group"
        >
          <code className="text-xs md:text-sm text-foreground/80 break-all font-mono">
            {CA}
          </code>
          {copied ? (
            <Check className="w-4 h-4 text-pepe shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
          )}
        </button>
      </div>
    </section>
  );
};
