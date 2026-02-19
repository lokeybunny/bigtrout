import { Lock, Unlock, Fish, Zap, TrendingUp, Clock, FileText, Flame, Droplets } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import sakuraGardenBg from '@/assets/sakura-garden-bg.jpg';

interface ProtocolData {
  autoLP: { address: string; label: string; balance: number };
  buybackBurn: { address: string; label: string; balance: number; totalBurned: number; currentSupply: number };
  lastUpdated: string;
}

interface VestingData {
  totalLocked: number;
  totalUnlocked: number;
  lockedPercent: number;
  circulatingPercent: number;
  contractCount: number;
  lastUpdated: string;
  source: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toFixed(0);
};

export const TokenomicsSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [protocolLoading, setProtocolLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const parallaxOffset = (window.innerHeight - rect.top) * 0.3;
        setScrollY(parallaxOffset);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchVestingData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('streamflow-vesting');
        if (error) { console.error('Error fetching vesting data:', error); return; }
        if (data?.success && data?.data) setVestingData(data.data);
      } catch (err) { console.error('Error:', err); }
      finally { setLoading(false); }
    };
    fetchVestingData();
    const interval = setInterval(fetchVestingData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProtocolData = async () => {
      try {
        setProtocolLoading(true);
        const { data, error } = await supabase.functions.invoke('protocol-wallets');
        if (error) { console.error('Error fetching protocol data:', error); return; }
        if (data?.success && data?.data) setProtocolData(data.data);
      } catch (err) { console.error('Error:', err); }
      finally { setProtocolLoading(false); }
    };
    fetchProtocolData();
    const interval = setInterval(fetchProtocolData, 300000);
    return () => clearInterval(interval);
  }, []);

  const totalBurned = protocolData?.buybackBurn?.totalBurned || 0;
  const burnedPercent = (totalBurned / 1_000_000_000) * 100;
  const lockedPercent = vestingData?.lockedPercent || 0;
  const circulatingPercent = Math.max(0, (vestingData?.circulatingPercent || 100) - burnedPercent);

  const currentSupply = protocolData?.buybackBurn?.currentSupply || 1_000_000_000;
  const staticCards = [
    { icon: TrendingUp, title: 'Total Supply', value: protocolLoading ? '...' : formatNumber(currentSupply), description: totalBurned > 0 ? `${formatNumber(totalBurned)} burned from 1B` : 'One billion BIGTROUT tokens', color: 'pepe' },
    { icon: Fish, title: 'Tax', value: '0%', description: 'No buy/sell tax - pure trading', color: 'pepe' },
    { icon: Zap, title: 'Contract', value: 'Renounced', description: 'Fully community owned', color: 'sakura' },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${sakuraGardenBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateY(${scrollY * -0.5}px) scale(1.2)`,
        willChange: 'transform',
        filter: 'saturate(0.7) brightness(0.5)',
      }} />
      
      {/* Dark overlay with ukiyo-e tinting */}
      <div className="absolute inset-0 z-0" style={{
        background: `linear-gradient(180deg, 
          hsl(210 25% 10% / 0.88) 0%, 
          hsl(200 22% 12% / 0.7) 40%, 
          hsl(200 22% 12% / 0.65) 70%, 
          hsl(210 25% 10% / 0.88) 100%
        )`,
      }} />

      {/* Decorative brush stroke divider at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-[1] divider-brush" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="text-pepe">TOKEN</span>
            <span className="text-sakura">OMICS</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Community-powered, fully transparent
          </p>
        </div>

        {/* Live Streamflow Data */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm font-display tracking-wider flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              LIVE STREAMFLOW DATA
              {vestingData?.source === 'streamflow-dashboard' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  LIVE
                </span>
              )}
              {vestingData?.source === 'fallback' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground text-xs">
                  CACHED
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="card-ukiyo p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-fire" style={{
                background: 'linear-gradient(135deg, hsl(130 45% 38%), hsl(130 55% 52%))',
              }}>
                <Lock className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Locked Supply</p>
              <p className="font-display text-3xl font-bold text-pepe mb-1">{loading ? '...' : formatNumber(vestingData?.totalLocked || 0)}</p>
              <p className="text-muted-foreground text-xs">{loading ? '...' : `${lockedPercent.toFixed(2)}% locked`}</p>
            </div>

            <div className="card-ukiyo p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-ice" style={{
                background: 'linear-gradient(135deg, hsl(345 45% 50%), hsl(345 55% 70%))',
              }}>
                <Unlock className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Circulating Supply</p>
              <p className="font-display text-3xl font-bold text-sakura mb-1">{loading ? '...' : formatNumber(vestingData?.totalUnlocked || 0)}</p>
              <p className="text-muted-foreground text-xs">{loading ? '...' : `${circulatingPercent.toFixed(2)}% circulating`}</p>
            </div>

            <div className="card-ukiyo p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(130 45% 38%), hsl(345 45% 50%))',
                boxShadow: '0 0 20px hsl(130 45% 38% / 0.3), 0 0 20px hsl(345 45% 50% / 0.3)',
              }}>
                <FileText className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Lock Contracts</p>
              <p className="font-display text-3xl font-bold text-pepe-sakura mb-1">{loading ? '...' : vestingData?.contractCount || 0}</p>
              <p className="text-muted-foreground text-xs">Active on Streamflow</p>
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="h-4 rounded-full overflow-hidden bg-card border border-border/50 flex">
              <div className="h-full transition-all duration-1000" style={{
                width: `${lockedPercent}%`,
                background: 'linear-gradient(90deg, hsl(130 45% 38%), hsl(130 55% 52%))',
              }} />
              <div className="h-full transition-all duration-1000" style={{
                width: `${circulatingPercent}%`,
                background: 'linear-gradient(90deg, hsl(345 45% 50%), hsl(345 55% 70%))',
              }} />
              {burnedPercent > 0 && (
                <div className="h-full transition-all duration-1000" style={{
                  width: `${burnedPercent}%`,
                  background: 'linear-gradient(90deg, hsl(20 80% 50%), hsl(0 70% 55%))',
                }} />
              )}
            </div>
            <div className="flex flex-wrap justify-between mt-3 text-sm gap-2">
              <span className="text-pepe flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(130 45% 38%)' }} />
                Locked ({lockedPercent.toFixed(2)}%)
              </span>
              <span className="text-sakura flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(345 45% 50%)' }} />
                Circulating ({circulatingPercent.toFixed(2)}%)
              </span>
              {burnedPercent > 0 && (
                <span className="flex items-center gap-2" style={{ color: 'hsl(20 80% 50%)' }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(20 80% 50%)' }} />
                  Burned ({burnedPercent.toFixed(2)}%)
                </span>
              )}
            </div>
            
            {vestingData?.lastUpdated && (
              <p className="text-center text-muted-foreground/50 text-xs mt-4">
                Last updated: {new Date(vestingData.lastUpdated).toLocaleString()}
              </p>
            )}

            <div className="text-center mt-4">
              <a href="https://app.streamflow.finance/token-dashboard/solana/mainnet/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                View on Streamflow →
              </a>
            </div>
          </div>
        </div>

        {/* Community Protocol Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm font-display tracking-wider flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              COMMUNITY PROTOCOL
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                LIVE
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Auto LP */}
            <div className="card-ukiyo p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-ice" style={{
                background: 'linear-gradient(135deg, hsl(200 60% 45%), hsl(200 70% 60%))',
              }}>
                <Droplets className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Automatic LP Function</p>
              <p className="font-display text-3xl font-bold text-pepe mb-1">
                {protocolLoading ? '...' : formatNumber(protocolData?.autoLP?.balance || 0)}
              </p>
              <p className="text-muted-foreground text-xs mb-2">BIGTROUT in LP pool</p>
              <a
                href={`https://solscan.io/account/${protocolData?.autoLP?.address || '5tEJqt89SqJGGycow9vJezKfDfnRUUKU9DFAS9J9YiMT'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                View on Solscan →
              </a>
            </div>

            {/* Buyback/Burn */}
            <div className="card-ukiyo p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-fire" style={{
                background: 'linear-gradient(135deg, hsl(20 80% 50%), hsl(0 70% 55%))',
              }}>
                <Flame className="w-7 h-7" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Automatic Buyback/Burn</p>
              <p className="font-display text-3xl font-bold text-sakura mb-1">
                {protocolLoading ? '...' : formatNumber(protocolData?.buybackBurn?.totalBurned || 0)}
              </p>
              <p className="text-muted-foreground text-xs mb-1">BIGTROUT burned</p>
              {!protocolLoading && protocolData?.buybackBurn?.balance ? (
                <p className="text-muted-foreground/70 text-xs mb-2">
                  {formatNumber(protocolData.buybackBurn.balance)} pending burn
                </p>
              ) : <div className="mb-2" />}
              <a
                href={`https://solscan.io/account/${protocolData?.buybackBurn?.address || '9zTWFwMGaTJWRjTupmD8kG7jKXCKYzQdmFziVbFn8mme'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                View on Solscan →
              </a>
            </div>
          </div>

          {protocolData?.lastUpdated && (
            <p className="text-center text-muted-foreground/50 text-xs mt-4">
              Last updated: {new Date(protocolData.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staticCards.map((item, index) => (
            <div key={index} className="card-ukiyo p-6 text-center group">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${item.color === 'pepe' ? 'glow-fire' : 'glow-ice'}`} style={{
                background: item.color === 'pepe' 
                  ? 'linear-gradient(135deg, hsl(130 45% 38%), hsl(130 55% 52%))'
                  : 'linear-gradient(135deg, hsl(345 45% 50%), hsl(345 55% 70%))',
              }}>
                <item.icon className="w-8 h-8" style={{ color: 'hsl(210 25% 10%)' }} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className={`font-display text-2xl font-bold mb-2 ${item.color === 'pepe' ? 'text-pepe' : 'text-sakura'}`}>{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom brush stroke divider */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-[1] divider-brush" />
    </section>
  );
};
