import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlatformData {
  name: string;
  count: number;
  percentage: number;
}

interface HourlyData {
  hour: string;
  transactions: number;
  deposits: number;
}

interface InflowData {
  wallet: string;
  totalTransactions: number;
  platforms: PlatformData[];
  hourlyActivity: HourlyData[];
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border px-3 py-2 text-xs" style={{
      background: 'hsl(210 25% 10%)',
      borderColor: 'hsl(210 15% 20%)',
    }}>
      <p className="font-mono font-bold" style={{ color: 'hsl(0 0% 70%)' }}>{label} UTC</p>
      <p style={{ color: 'hsl(160 60% 55%)' }}>
        {payload[0].value} txn{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export const InflowTracker = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inflow-tracker'],
    queryFn: fetchInflowData,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const maxCount = data?.platforms?.[0]?.count || 1;
  const hasHourlyData = data?.hourlyActivity?.some(h => h.transactions > 0);

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

        {data && (
          <>
            {/* 24h Activity Chart */}
            <div className="mb-10">
              <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-4 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                24-Hour Deposit Activity
              </h5>
              <div className="w-full h-36 md:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyActivity} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 9, fill: 'hsl(0 0% 35%)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(210 15% 18%)' }}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: 'hsl(0 0% 35%)' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(210 20% 15%)' }} />
                    <Bar dataKey="transactions" radius={[3, 3, 0, 0]} maxBarSize={20}>
                      {data.hourlyActivity.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.transactions > 0 ? 'hsl(160 55% 45%)' : 'hsl(210 15% 15%)'}
                          fillOpacity={entry.transactions > 0 ? 0.8 : 0.4}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!hasHourlyData && (
                <p className="text-center text-muted-foreground/30 text-[10px] mt-2">No transactions in the last 24 hours</p>
              )}
            </div>

            {/* Platform breakdown bars */}
            {data.platforms.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-4 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                  Platform Breakdown
                </h5>
                {data.platforms.map((platform) => {
                  const color = PLATFORM_COLORS[platform.name] || 'hsl(130 40% 45%)';
                  const barWidth = Math.max((platform.count / maxCount) * 100, 8);

                  return (
                    <div key={platform.name} className="group">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium w-28 md:w-36 text-right truncate" style={{ color: 'hsl(0 0% 60%)' }}>
                          {platform.name}
                        </span>
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
                        <span className="text-[10px] font-mono w-8 text-right" style={{ color: 'hsl(0 0% 40%)' }}>
                          {platform.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {data.platforms.length === 0 && (
              <p className="text-center text-muted-foreground/40 text-xs py-6">No recent transactions found</p>
            )}

            {/* Recent transactions list */}
            {data.recentTransactions.length > 0 && (
              <div className="mt-8">
                <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-3 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                  Recent Transactions
                </h5>
                <div className="space-y-1.5">
                  {data.recentTransactions.slice(0, 5).map((tx, i) => {
                    const timeAgo = Math.round((Date.now() - tx.time) / 60000);
                    const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;
                    return (
                      <a
                        key={i}
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-1.5 rounded transition-colors"
                        style={{ background: 'hsl(210 20% 10%)' }}
                      >
                        <span className="text-[10px] font-mono" style={{ color: PLATFORM_COLORS[tx.platform] || 'hsl(0 0% 50%)' }}>
                          {tx.platform}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'hsl(0 0% 35%)' }}>
                          {tx.signature.slice(0, 8)}…{tx.signature.slice(-4)}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'hsl(0 0% 35%)' }}>
                          {timeLabel}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </>
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
