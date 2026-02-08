import { Wallet, ArrowRightLeft, Coins, Trophy } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import sakuraPathBg from '@/assets/sakura-path-bg.jpg';

const steps = [
  { icon: Wallet, step: '01', title: 'Get a Wallet', description: 'Download Phantom or Solflare wallet and set it up securely.' },
  { icon: Coins, step: '02', title: 'Get SOL', description: 'Buy SOL from an exchange and send it to your wallet.' },
  { icon: ArrowRightLeft, step: '03', title: 'Swap for $BIGTROUT', description: 'Connect to Raydium or Jupiter, paste the contract address, and swap.' },
  { icon: Trophy, step: '04', title: 'HODL & Win', description: 'Join the legendary army and hold for based gains.' },
];

export const HowToBuySection = () => {
  const [scrollY, setScrollY] = useState(0);
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

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${sakuraPathBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        transform: `translateY(${scrollY * -0.5}px) scale(1.2)`,
        willChange: 'transform',
        filter: 'saturate(0.8) brightness(0.8)',
      }} />
      
      <div className="absolute top-0 left-0 right-0 h-48 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(180deg, hsl(130 60% 40% / 0.15) 0%, hsl(130 50% 35% / 0.08) 40%, transparent 100%)',
      }} />

      <div className="absolute inset-0 z-0" style={{
        background: `linear-gradient(180deg, hsl(150 30% 6% / 0.5) 0%, hsl(140 25% 8% / 0.4) 30%, hsl(140 30% 6% / 0.5) 60%, hsl(150 30% 8% / 0.7) 100%)`,
      }} />

      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at center 30%, hsl(340 60% 50% / 0.15), transparent 50%)',
      }} />

      <div className="absolute bottom-0 left-0 right-0 h-64 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 0%, hsl(150 30% 8% / 0.5) 50%, hsl(150 30% 6% / 0.8) 100%)',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="text-hero">HOW TO BUY</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join the legendary BIGTROUT army in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 -translate-y-1/2 z-0" style={{
                  background: 'linear-gradient(90deg, hsl(130 60% 40% / 0.6), hsl(130 70% 50% / 0.3), transparent)',
                }} />
              )}
              
              <div className="card-volcanic p-6 relative z-10">
                <span className="font-display text-6xl font-black text-pepe opacity-20 absolute top-4 right-4">{item.step}</span>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 glow-ember">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4 font-display text-sm tracking-wider">CONTRACT ADDRESS</p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-card/80 border border-primary/30 backdrop-blur-xl glow-ember">
            <code className="font-mono text-sm md:text-base text-pepe break-all">
              EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG
            </code>
            <button className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors" onClick={() => navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG')}>
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div id="live-chart" className="mt-16 scroll-mt-24">
          <h3 className="text-center font-display text-2xl md:text-3xl font-bold mb-6">
            <span className="text-sakura">LIVE</span>{' '}
            <span className="text-pepe">CHART</span>
          </h3>
          <div className="rounded-xl overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm">
            <iframe
              src="https://www.gmgn.cc/kline/sol/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG?theme=dark"
              title="BIGTROUT Trading Chart"
              className="w-full h-[400px] sm:h-[500px] md:h-[600px]"
              style={{ border: 'none' }}
              allow="clipboard-write"
              loading="lazy"
            />
          </div>
          <p className="text-center text-muted-foreground/60 text-xs mt-3">Chart powered by GMGN • Always DYOR</p>
        </div>
      </div>
    </section>
  );
};
