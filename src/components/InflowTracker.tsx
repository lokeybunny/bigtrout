import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, TrendingDown, ExternalLink, Fish, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  addLp: number;
  buyAmount: number;
  sellAmount: number;
  lpAmount: number;
}

interface InflowData {
  wallet: string;
  range: string;
  totalTransactions: number;
  totalBought: number;
  totalSold: number;
  totalAddedLP: number;
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

const TX_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  buy: { label: 'BUY', emoji: '🟢', color: 'hsl(160 60% 55%)' },
  sell: { label: 'SELL', emoji: '🔴', color: 'hsl(0 65% 55%)' },
  add_lp: { label: 'ADD LP', emoji: '🔵', color: 'hsl(200 65% 55%)' },
  other: { label: 'TXN', emoji: '⚪', color: 'hsl(0 0% 50%)' },
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
      {data?.addLp > 0 && (
        <p style={{ color: 'hsl(200 65% 55%)' }}>
          🔵 {data.addLp} LP add{data.addLp !== 1 ? 's' : ''} · {formatNumber(data.lpAmount)} to pool
        </p>
      )}
      {data?.sells > 0 && (
        <p style={{ color: 'hsl(0 65% 55%)' }}>
          🔴 {data.sells} sell{data.sells !== 1 ? 's' : ''} · -{formatNumber(data.sellAmount)}
        </p>
      )}
      {(!data?.buys && !data?.sells && !data?.addLp) && (
        <p style={{ color: 'hsl(0 0% 40%)' }}>No $BIGTROUT activity</p>
      )}
    </div>
  );
};

export const InflowTracker = () => {
  const [range, setRange] = useState<RangeKey>('7d');

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

        <p className="text-center text-muted-foreground/50 text-xs mb-2 max-w-lg mx-auto">
          Full transparency — every $BIGTROUT buy, sell & LP addition from the dev wallet, verified on-chain.
        </p>
        <a
          href="https://solscan.io/account/2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 mb-6 transition-colors hover:text-pepe/80"
          style={{ color: 'hsl(0 0% 45%)' }}
        >
          <span className="font-mono text-[11px] inline md:hidden">2U4z…zjnJ</span>
          <span className="font-mono text-[11px] hidden md:inline">2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ</span>
          <ExternalLink className="w-3 h-3" />
        </a>

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
            <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 rounded-xl border flex-wrap justify-center" style={{
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

              {/* Added LP */}
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <Droplets className="w-3.5 h-3.5" style={{ color: 'hsl(200 65% 55%)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'hsl(0 0% 45%)' }}>
                    Added LP
                  </p>
                </div>
                <p className="text-lg md:text-xl font-display font-bold tabular-nums" style={{
                  color: 'hsl(200 65% 55%)',
                }}>
                  {formatNumber(data.totalAddedLP)}
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
            {/* Activity Chart - Stacked buys/sells/LP */}
            <div className="mb-10">
              <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-4 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                {RANGE_LABELS[range]} Activity
              </h5>
              <div className="flex justify-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'hsl(160 55% 50%)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(160 55% 45%)' }} /> Buys
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'hsl(200 65% 55%)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(200 55% 45%)' }} /> Add LP
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
                    <Bar dataKey="addLp" stackId="a" fill="hsl(200 55% 45%)" radius={[0, 0, 0, 0]} maxBarSize={20} fillOpacity={0.85} />
                    <Bar dataKey="sells" stackId="a" fill="hsl(0 55% 45%)" radius={[3, 3, 0, 0]} maxBarSize={20} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!hasActivityData && (
                <p className="text-center text-muted-foreground/30 text-[10px] mt-2">No transactions in this period</p>
              )}
            </div>


            {/* Recent transactions list */}
            {data.recentTransactions.length > 0 && (
              <div className="mt-8">
                <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider mb-3 text-center" style={{ color: 'hsl(0 0% 45%)' }}>
                  Recent $BIGTROUT Transactions
                </h5>
                <div className="space-y-1.5">
                  {data.recentTransactions.slice(0, 10).map((tx, i) => {
                    const timeAgo = Math.round((Date.now() - tx.time) / 60000);
                    const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : timeAgo < 1440 ? `${Math.round(timeAgo / 60)}h ago` : `${Math.round(timeAgo / 1440)}d ago`;
                    const typeConfig = TX_TYPE_CONFIG[tx.type] || TX_TYPE_CONFIG.other;
                    const bgColor = tx.type === 'buy' ? 'hsl(160 30% 10%)' 
                      : tx.type === 'add_lp' ? 'hsl(200 30% 10%)' 
                      : tx.type === 'sell' ? 'hsl(0 30% 10%)' 
                      : 'hsl(210 20% 10%)';
                    const borderColor = tx.type === 'buy' ? 'hsl(160 60% 45%)' 
                      : tx.type === 'add_lp' ? 'hsl(200 60% 45%)' 
                      : tx.type === 'sell' ? 'hsl(0 60% 45%)' 
                      : 'hsl(210 20% 25%)';

                    return (
                      <a
                        key={i}
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded transition-colors hover:brightness-110"
                        style={{
                          background: bgColor,
                          borderLeft: `3px solid ${borderColor}`,
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold min-w-[60px]" style={{ color: typeConfig.color }}>
                          {typeConfig.emoji} {typeConfig.label}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: PLATFORM_COLORS[tx.platform] || 'hsl(0 0% 50%)' }}>
                          {tx.platform}
                        </span>
                        {tx.amount !== 0 && (
                          <span className="text-[10px] font-mono font-bold" style={{ color: typeConfig.color }}>
                            {tx.type === 'buy' ? '+' : tx.type === 'add_lp' ? '→LP ' : '-'}{formatNumber(Math.abs(tx.amount))}
                          </span>
                        )}
                        <span className="text-[10px] font-mono hidden sm:inline" style={{ color: 'hsl(0 0% 35%)' }}>
                          {tx.signature.slice(0, 8)}…
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
            {data ? `${data.totalTransactions} txns analyzed · ATA + wallet` : '—'}
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
