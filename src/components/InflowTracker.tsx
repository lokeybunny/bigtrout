import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, TrendingDown, ExternalLink, Fish } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PlatformData {
  name: string;
  count: number;
  percentage: number;
}

interface ActivityData {
  label: string;
  transactions: number;
  buys: number;
  sells: number;
  buyAmount: number;
  sellAmount: number;
}

interface InflowData {
  wallet: string;
  range: string;
  totalTransactions: number;
  totalBought: number;
  totalSold: number;
  platforms: PlatformData[];
  activityData: ActivityData[];
  recentTransactions: Array<{ platform: string; time: number; signature: string; amount: number; type: string }>;
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

type RangeKey = '24h' | '7d' | '30d';

const RANGE_LABELS: Record<RangeKey, string> = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
};

const fetchInflowData = async (range: RangeKey): Promise<InflowData> => {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${projectUrl}/functions/v1/inflow-tracker?range=${range}`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch inflow data');
  return res.json();
};

function formatNumber(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  if (n > 0 && n < 1) return n.toFixed(4);
  return n.toFixed(0);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="rounded-md border px-3 py-2 text-xs" style={{
      background: 'hsl(210 25% 10%)',
      borderColor: 'hsl(210 15% 20%)',
    }}>
      <p className="font-mono font-bold mb-1" style={{ color: 'hsl(0 0% 70%)' }}>{label} UTC</p>
      {data?.buys > 0 && (
        <p style={{ color: 'hsl(160 60% 55%)' }}>
          🟢 {data.buys} buy{data.buys !== 1 ? 's' : ''} · +{formatNumber(data.buyAmount)}
        </p>
      )}
      {data?.sells > 0 && (
        <p style={{ color: 'hsl(0 65% 55%)' }}>
          🔴 {data.sells} sell{data.sells !== 1 ? 's' : ''} · -{formatNumber(data.sellAmount)}
        </p>
      )}
      {data?.buys === 0 && data?.sells === 0 && (
        <p style={{ color: 'hsl(0 0% 40%)' }}>No $BIGTROUT activity</p>
      )}
    </div>
  );
};

export const InflowTracker = () => {
  const [range, setRange] = useState<RangeKey>('24h');

  const { data, isLoading, error } = useQuery({
    queryKey: ['inflow-tracker', range],
    queryFn: () => fetchInflowData(range),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const maxCount = data?.platforms?.[0]?.count || 1;
  const hasActivityData = data?.activityData?.some(h => h.transactions > 0);

  return (
    <section className="relative py-12 px-4 overflow-hidden" style={{ background: 'hsl(210 25% 7%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="w-4 h-4 text-pepe/60" />
          <h4 className="font-display text-sm md:text-base font-bold tracking-widest uppercase" style={{
            color: 'hsl(0 0% 55%)',
            letterSpacing: '0.15em',
          }}>
            Dev Wallet Transparency Tracker
          </h4>
          <TrendingUp className="w-4 h-4 text-sakura/60" />
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mb-6 max-w-lg mx-auto">
          Full transparency — every $BIGTROUT buy & sell from the dev wallet, verified on-chain.
        </p>

        {/* Range Toggle */}
        <div className="flex justify-center mb-6">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(val) => val && setRange(val as RangeKey)}
            className="rounded-lg p-0.5"
            style={{ background: 'hsl(210 20% 12%)' }}
          >
            {(['24h', '7d', '30d'] as RangeKey[]).map((r) => (
              <ToggleGroupItem
                key={r}
                value={r}
                className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-md transition-all data-[state=on]:text-white"
                style={{
                  color: range === r ? 'white' : 'hsl(0 0% 40%)',
                  background: range === r ? 'hsl(160 50% 30%)' : 'transparent',
                }}
              >
                {r}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Live Stats Counter */}
        {data && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4 sm:gap-6 px-5 py-3 rounded-xl border" style={{
              background: 'linear-gradient(135deg, hsl(160 30% 10%), hsl(210 25% 10%))',
              borderColor: 'hsl(160 40% 25%)',
            }}>
              {/* Buys */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: 'hsl(160 60% 50%)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'hsl(0 0% 45%)' }}>
                    Bought
                  </p>
                </div>
                <p className="text-lg md:text-xl font-display font-bold tabular-nums" style={{
                  color: 'hsl(160 60% 55%)',
                  textShadow: '0 0 20px hsl(160 60% 40% / 0.3)',
                }}>
                  {formatNumber(data.totalBought)}
                </p>
              </div>

              <div className="w-px h-10" style={{ background: 'hsl(210 15% 20%)' }} />

              {/* Sells */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <TrendingDown className="w-3.5 h-3.5" style={{ color: 'hsl(0 65% 55%)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'hsl(0 0% 45%)' }}>
                    Sold
                  </p>
                </div>
                <p className="text-lg md:text-xl font-display font-bold tabular-nums" style={{
                  color: 'hsl(0 65% 55%)',
                }}>
                  {formatNumber(data.totalSold)}
                </p>
              </div>

              <div className="w-px h-10" style={{ background: 'hsl(210 15% 20%)' }} />

              {/* Txns */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <Fish className="w-3.5 h-3.5" style={{ color: 'hsl(45 80% 55%)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'hsl(0 0% 45%)' }}>
                    Txns
                  </p>
                </div>
                <p className="text-lg md:text-xl font-display font-bold tabular-nums" style={{ color: 'hsl(45 80% 55%)' }}>
                  {data.totalTransactions}
                </p>
              </div>
            </div>
          </div>
        )}

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
            {/* Activity Chart - Stacked buys/sells */}
            <div className="mb-10">
              <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-4 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                {range === '24h' ? '24-Hour' : range === '7d' ? '7-Day' : '30-Day'} Buy/Sell Activity
              </h5>
              <div className="flex justify-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'hsl(160 55% 50%)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(160 55% 45%)' }} /> Buys
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'hsl(0 65% 50%)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(0 55% 45%)' }} /> Sells
                </span>
              </div>
              <div className="w-full h-36 md:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: 'hsl(0 0% 35%)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(210 15% 18%)' }}
                      interval={range === '24h' ? 2 : range === '7d' ? 0 : 3}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: 'hsl(0 0% 35%)' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(210 20% 15%)' }} />
                    <Bar dataKey="buys" stackId="a" fill="hsl(160 55% 45%)" radius={[0, 0, 0, 0]} maxBarSize={20} fillOpacity={0.85} />
                    <Bar dataKey="sells" stackId="a" fill="hsl(0 55% 45%)" radius={[3, 3, 0, 0]} maxBarSize={20} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!hasActivityData && (
                <p className="text-center text-muted-foreground/30 text-[10px] mt-2">No transactions in this period</p>
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
                  Recent $BIGTROUT Transactions
                </h5>
                <div className="space-y-1.5">
                  {data.recentTransactions.slice(0, 8).map((tx, i) => {
                    const timeAgo = Math.round((Date.now() - tx.time) / 60000);
                    const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;
                    const isBuy = tx.type === 'buy';
                    const isSell = tx.type === 'sell';
                    return (
                      <a
                        key={i}
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded transition-colors hover:brightness-110"
                        style={{
                          background: isBuy ? 'hsl(160 30% 10%)' : isSell ? 'hsl(0 30% 10%)' : 'hsl(210 20% 10%)',
                          borderLeft: `3px solid ${isBuy ? 'hsl(160 60% 45%)' : isSell ? 'hsl(0 60% 45%)' : 'hsl(210 20% 25%)'}`,
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold" style={{
                          color: isBuy ? 'hsl(160 60% 55%)' : isSell ? 'hsl(0 65% 55%)' : 'hsl(0 0% 50%)',
                        }}>
                          {isBuy ? '🟢 BUY' : isSell ? '🔴 SELL' : '⚪ TXN'}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: PLATFORM_COLORS[tx.platform] || 'hsl(0 0% 50%)' }}>
                          {tx.platform}
                        </span>
                        {tx.amount !== 0 && (
                          <span className="text-[10px] font-mono font-bold" style={{
                            color: tx.amount > 0 ? 'hsl(160 55% 50%)' : 'hsl(0 60% 50%)',
                          }}>
                            {tx.amount > 0 ? '+' : ''}{formatNumber(Math.abs(tx.amount))}
                          </span>
                        )}
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
            Verify on Solscan <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </section>
  );
};
