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
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
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
        const sectionTop = rect.top;
        const windowHeight = window.innerHeight;
        const parallaxOffset = (windowHeight - sectionTop) * 0.3;
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
        
        if (error) {
          console.error('Error fetching vesting data:', error);
          return;
        }

        if (data?.success && data?.data) {
          setVestingData(data.data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVestingData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchVestingData, 300000);
    return () => clearInterval(interval);
  }, []);

  const lockedPercent = vestingData?.lockedPercent || 0;
  const circulatingPercent = vestingData?.circulatingPercent || 100;

  const staticCards = [
    {
      icon: TrendingUp,
      title: 'Total Supply',
      value: '1,000,000,000',
      description: 'One billion BIGTROUT tokens',
      gradient: 'fire',
    },
    {
      icon: Fish,
      title: 'Tax',
      value: '0%',
      description: 'No buy/sell tax - pure trading',
      gradient: 'fire',
    },
    {
      icon: Zap,
      title: 'Contract',
      value: 'Renounced',
      description: 'Fully community owned',
      gradient: 'ice',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      {/* Parallax background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${snowMountainBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * -0.5}px) scale(1.2)`,
          willChange: 'transform',
        }}
      />
      
      {/* Dark overlay for readability */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, hsl(220 30% 6% / 0.85) 0%, hsl(220 30% 6% / 0.7) 50%, hsl(220 30% 6% / 0.85) 100%)',
        }}
      />

      {/* Ice glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center bottom, hsl(195 90% 45% / 0.15), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="text-fire">TOKEN</span>
            <span className="text-ice">OMICS</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Forged in volcanic fire, preserved in eternal ice
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
            {/* Locked Supply Card */}
            <div className="card-volcanic p-6 text-center">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-fire"
                style={{
                  background: 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))',
                }}
              >
                <Lock className="w-7 h-7 text-storm-dark" />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">
                Locked Supply
              </p>
              <p className="font-display text-3xl font-bold text-fire mb-1">
                {loading ? '...' : formatNumber(vestingData?.totalLocked || 0)}
              </p>
              <p className="text-muted-foreground text-xs">
                {loading ? '...' : `${lockedPercent.toFixed(2)}% locked`}
              </p>
            </div>

            {/* Circulating Supply Card */}
            <div className="card-volcanic p-6 text-center">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center glow-ice"
                style={{
                  background: 'linear-gradient(135deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                }}
              >
                <Unlock className="w-7 h-7 text-storm-dark" />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">
                Circulating Supply
              </p>
              <p className="font-display text-3xl font-bold text-ice mb-1">
                {loading ? '...' : formatNumber(vestingData?.totalUnlocked || 0)}
              </p>
              <p className="text-muted-foreground text-xs">
                {loading ? '...' : `${circulatingPercent.toFixed(2)}% circulating`}
              </p>
            </div>

            {/* Lock Contracts Card */}
            <div className="card-volcanic p-6 text-center">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(20 100% 50%), hsl(195 90% 45%))',
                  boxShadow: '0 0 30px hsl(20 100% 50% / 0.4), 0 0 30px hsl(195 90% 45% / 0.4)',
                }}
              >
                <FileText className="w-7 h-7 text-storm-dark" />
              </div>
              <p className="text-muted-foreground text-sm mb-1 font-display tracking-wider">
                Lock Contracts
              </p>
              <p className="font-display text-3xl font-bold text-fire-ice mb-1">
                {loading ? '...' : vestingData?.contractCount || 0}
              </p>
              <p className="text-muted-foreground text-xs">
                Active on Streamflow
              </p>
            </div>
          </div>

          {/* Visual breakdown bar */}
          <div className="max-w-xl mx-auto">
            <div className="h-4 rounded-full overflow-hidden bg-card border border-border/50 flex">
              <div 
                className="h-full transition-all duration-1000"
                style={{
                  width: `${lockedPercent}%`,
                  background: 'linear-gradient(90deg, hsl(20 100% 50%), hsl(35 100% 55%))',
                }}
              />
              <div 
                className="h-full transition-all duration-1000"
                style={{
                  width: `${circulatingPercent}%`,
                  background: 'linear-gradient(90deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-fire flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(20 100% 50%), hsl(35 100% 55%))' }} />
                Locked ({lockedPercent.toFixed(2)}%)
              </span>
              <span className="text-ice flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(195 90% 45%), hsl(190 100% 70%))' }} />
                Circulating ({circulatingPercent.toFixed(2)}%)
              </span>
            </div>
            
            {vestingData?.lastUpdated && (
              <p className="text-center text-muted-foreground/50 text-xs mt-4">
                Last updated: {new Date(vestingData.lastUpdated).toLocaleString()}
              </p>
            )}

            {/* Link to Streamflow */}
            <div className="text-center mt-4">
              <a 
                href="https://app.streamflow.finance/token-dashboard/solana/mainnet/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                View on Streamflow →
              </a>
            </div>
          </div>
        </div>

        {/* Static tokenomics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staticCards.map((item, index) => (
            <div
              key={index}
              className="card-volcanic p-6 text-center group"
            >
              <div 
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  item.gradient === 'fire' ? 'glow-fire' : 'glow-ice'
                }`}
                style={{
                  background: item.gradient === 'fire' 
                    ? 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))'
                    : 'linear-gradient(135deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                }}
              >
                <item.icon className="w-8 h-8 text-storm-dark" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className={`font-display text-2xl font-bold mb-2 ${
                item.gradient === 'fire' ? 'text-fire' : 'text-ice'
              }`}>
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
