import { Lock, Unlock, Fish, Zap, TrendingUp, Clock, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import snowMountainBg from '@/assets/snow-mountain-bg.jpg';

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
  const [loading, setLoading] = useState(true);
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

  const lockedPercent = vestingData?.lockedPercent || 0;
  const circulatingPercent = vestingData?.circulatingPercent || 100;

  const staticCards = [
    { icon: TrendingUp, title: 'Total Supply', value: '1,000,000,000', description: 'One billion BIGTROUT tokens', gradient: 'green' },
    { icon: Fish, title: 'Tax', value: '0%', description: 'No buy/sell tax - pure trading', gradient: 'green' },
    { icon: Zap, title: 'Contract', value: 'Renounced', description: 'Fully community owned', gradient: 'pink' },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${snowMountainBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateY(${scrollY * -0.5}px) scale(1.2)`,
        willChange: 'transform',
        filter: 'hue-rotate(80deg) saturate(0.6)',
      }} />
      
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(180deg, hsl(150 30% 6% / 0.85) 0%, hsl(140 25% 8% / 0.6) 40%, hsl(140 25% 8% / 0.5) 70%, hsl(140 30% 6% / 0.3) 100%)',
      }} />

      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at center bottom, hsl(130 60% 35% / 0.2), transparent 50%)',
      }} />

      <div className="absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 0%, hsl(340 60% 45% / 0.1) 50%, hsl(340 70% 50% / 0.15) 100%)',
      }} />

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
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="card-volcanic p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-fire" style={{
                background: 'linear-gradient(135deg, hsl(130 60% 35%), hsl(130 70% 50%))',
              }}>
                <Lock className="w-7 h-7 text-garden-dark" />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Locked Supply</p>
              <p className="font-display text-3xl font-bold text-pepe mb-1">{loading ? '...' : formatNumber(vestingData?.totalLocked || 0)}</p>
              <p className="text-muted-foreground text-xs">{loading ? '...' : `${lockedPercent.toFixed(2)}% locked`}</p>
            </div>

            <div className="card-volcanic p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-ice" style={{
                background: 'linear-gradient(135deg, hsl(340 60% 45%), hsl(340 70% 65%))',
              }}>
                <Unlock className="w-7 h-7 text-garden-dark" />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">Circulating Supply</p>
              <p className="font-display text-3xl font-bold text-sakura mb-1">{loading ? '...' : formatNumber(vestingData?.totalUnlocked || 0)}</p>
              <p className="text-muted-foreground text-xs">{loading ? '...' : `${circulatingPercent.toFixed(2)}% circulating`}</p>
            </div>

            <div className="card-volcanic p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(130 60% 35%), hsl(340 60% 45%))',
                boxShadow: '0 0 30px hsl(130 60% 35% / 0.4), 0 0 30px hsl(340 60% 45% / 0.4)',
              }}>
                <FileText className="w-7 h-7 text-garden-dark" />
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
                background: 'linear-gradient(90deg, hsl(130 60% 35%), hsl(130 70% 50%))',
              }} />
              <div className="h-full transition-all duration-1000" style={{
                width: `${circulatingPercent}%`,
                background: 'linear-gradient(90deg, hsl(340 60% 45%), hsl(340 70% 65%))',
              }} />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-pepe flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(130 60% 35%), hsl(130 70% 50%))' }} />
                Locked ({lockedPercent.toFixed(2)}%)
              </span>
              <span className="text-sakura flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(340 60% 45%), hsl(340 70% 65%))' }} />
                Circulating ({circulatingPercent.toFixed(2)}%)
              </span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staticCards.map((item, index) => (
            <div key={index} className="card-volcanic p-6 text-center group">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${item.gradient === 'green' ? 'glow-fire' : 'glow-ice'}`} style={{
                background: item.gradient === 'green' 
                  ? 'linear-gradient(135deg, hsl(130 60% 35%), hsl(130 70% 50%))'
                  : 'linear-gradient(135deg, hsl(340 60% 45%), hsl(340 70% 65%))',
              }}>
                <item.icon className="w-8 h-8 text-garden-dark" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className={`font-display text-2xl font-bold mb-2 ${item.gradient === 'green' ? 'text-pepe' : 'text-sakura'}`}>{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
