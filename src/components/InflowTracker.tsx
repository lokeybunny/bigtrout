import { Activity, ExternalLink } from 'lucide-react';

const WALLET = '2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ';

export const InflowTracker = () => {
  return (
    <section className="relative py-12 px-4 overflow-hidden" style={{ background: 'hsl(210 25% 7%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="w-4 h-4 text-pepe/60" />
          <h4 className="font-display text-sm md:text-base font-bold tracking-widest uppercase" style={{
            color: 'hsl(0 0% 55%)',
            letterSpacing: '0.15em',
          }}>
            Dev Wallet Transparency
          </h4>
        </div>

        <p className="text-muted-foreground/50 text-xs mb-6 max-w-lg mx-auto">
          Full transparency — verify every $BIGTROUT transaction from the dev wallet directly on Solscan.
        </p>

        <a
          href={`https://solscan.io/account/${WALLET}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border font-mono text-xs font-bold transition-all hover:brightness-125"
          style={{
            background: 'linear-gradient(135deg, hsl(160 30% 12%), hsl(210 25% 12%))',
            borderColor: 'hsl(160 40% 25%)',
            color: 'hsl(160 60% 55%)',
          }}
        >
          <span className="inline md:hidden">2U4z…zjnJ</span>
          <span className="hidden md:inline">{WALLET}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </section>
  );
};
