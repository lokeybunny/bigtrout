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
        filter: 'saturate(0.7) brightness(0.45)',
      }} />
      
      {/* Ukiyo-e overlay */}
      <div className="absolute inset-0 z-0" style={{
        background: `linear-gradient(180deg, 
          hsl(210 25% 10% / 0.85) 0%, 
          hsl(200 20% 13% / 0.65) 30%, 
          hsl(200 22% 12% / 0.6) 60%, 
          hsl(210 25% 10% / 0.85) 100%
        )`,
      }} />

      {/* Pond glow accent */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at center 30%, hsl(345 40% 55% / 0.08), transparent 50%)',
      }} />

      {/* Decorative brush stroke divider at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-[1] divider-brush" />

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
                  background: 'linear-gradient(90deg, hsl(130 45% 38% / 0.4), hsl(200 35% 45% / 0.2), transparent)',
                }} />
              )}
              
              <div className="card-ukiyo p-6 relative z-10">
                <span className="font-display text-6xl font-black text-pepe opacity-15 absolute top-4 right-4">{item.step}</span>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 glow-ember" style={{
                  background: 'linear-gradient(135deg, hsl(130 45% 38% / 0.3), hsl(200 35% 45% / 0.3))',
                  border: '1px solid hsl(130 45% 38% / 0.3)',
                }}>
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sakura text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4 font-display text-sm tracking-wider">CONTRACT ADDRESS</p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl border border-primary/20 backdrop-blur-xl card-ukiyo">
            <code className="font-mono text-sm md:text-base text-pepe break-all">
              EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG
            </code>
            <button className="p-2 rounded-lg bg-primary/15 hover:bg-primary/25 transition-colors border border-primary/20" onClick={() => navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG')}>
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
          <div className="rounded-xl overflow-hidden border border-border/30 card-ukiyo">
            <iframe
              src="https://www.gmgn.cc/kline/sol/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG?theme=dark"
              title="BIGTROUT Trading Chart"
              className="w-full h-[400px] sm:h-[500px] md:h-[600px]"
              style={{ border: 'none' }}
              allow="clipboard-write"
              loading="lazy"
            />
          </div>
          <p className="text-center text-muted-foreground/50 text-xs mt-3">Chart powered by GMGN • Always DYOR</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 z-[1] divider-brush" />
    </section>
  );
};
