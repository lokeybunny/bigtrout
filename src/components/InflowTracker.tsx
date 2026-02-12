import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, ExternalLink } from 'lucide-react';

interface PlatformData {
  name: string;
  count: number;
  percentage: number;
}

interface InflowData {
  wallet: string;
  totalTransactions: number;
  platforms: PlatformData[];
  recentTransactions: Array<{ platform: string; time: number; signature: string }>;
  lastUpdated: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Jupiter': 'hsl(160 60% 50%)',
  'Raydium': 'hsl(270 60% 60%)',
  'Raydium CLMM': 'hsl(280 55% 55%)',
  'PumpSwap': 'hsl(130 55% 50%)',
  'Meteora': 'hsl(200 65% 55%)',
  'Moonshot': 'hsl(45 80% 55%)',
  'Orca': 'hsl(190 70% 50%)',
  'Phoenix': 'hsl(15 70% 55%)',
  'MEXC': 'hsl(210 60% 55%)',
  'Binance': 'hsl(45 90% 50%)',
  'Bybit': 'hsl(35 70% 50%)',
  'Direct Transfer': 'hsl(0 0% 50%)',
};

const fetchInflowData = async (): Promise<InflowData> => {
  const { data, error } = await supabase.functions.invoke('inflow-tracker');
  if (error) throw error;
  return data;
};

export const InflowTracker = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inflow-tracker'],
    queryFn: fetchInflowData,
    refetchInterval: 120_000, // refresh every 2 min
    staleTime: 60_000,
  });

  const maxCount = data?.platforms?.[0]?.count || 1;

  return (
    <section className="relative py-12 px-4 overflow-hidden" style={{ background: 'hsl(210 25% 7%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Activity className="w-4 h-4 text-pepe/60" />
          <h4 className="font-display text-sm md:text-base font-bold tracking-widest uppercase" style={{
            color: 'hsl(0 0% 55%)',
            letterSpacing: '0.15em',
          }}>
            Platform Inflow Tracker
          </h4>
          <TrendingUp className="w-4 h-4 text-sakura/60" />
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mb-8 max-w-lg mx-auto">
          Live analysis of recent $BIGTROUT transactions — see where the community is buying from.
        </p>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-pepe/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-muted-foreground/40 text-xs py-6">Unable to load inflow data</p>
        )}

        {data && data.platforms.length > 0 && (
          <div className="space-y-3">
            {data.platforms.map((platform) => {
              const color = PLATFORM_COLORS[platform.name] || 'hsl(130 40% 45%)';
              const barWidth = Math.max((platform.count / maxCount) * 100, 8);

              return (
                <div key={platform.name} className="group">
                  <div className="flex items-center gap-3">
                    {/* Platform name */}
                    <span className="text-xs font-medium w-28 md:w-36 text-right truncate" style={{ color: 'hsl(0 0% 60%)' }}>
                      {platform.name}
                    </span>

                    {/* Bar */}
                    <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ background: 'hsl(210 20% 12%)' }}>
                      <div
                        className="h-full rounded-sm transition-all duration-700 ease-out flex items-center justify-end pr-2"
                        style={{
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, ${color}33, ${color}aa)`,
                          borderRight: `2px solid ${color}`,
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>
                          {platform.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Count */}
                    <span className="text-[10px] font-mono w-8 text-right" style={{ color: 'hsl(0 0% 40%)' }}>
                      {platform.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data && data.platforms.length === 0 && (
          <p className="text-center text-muted-foreground/40 text-xs py-6">No recent transactions found</p>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/10">
          <span className="text-[10px] font-mono" style={{ color: 'hsl(0 0% 35%)' }}>
            {data ? `${data.totalTransactions} recent txns analyzed` : '—'}
          </span>
          <a
            href={`https://solscan.io/account/2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-mono transition-colors hover:text-pepe/80"
            style={{ color: 'hsl(0 0% 35%)' }}
          >
            View on Solscan <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </section>
  );
};
