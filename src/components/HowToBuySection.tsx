import { Wallet, ArrowRightLeft, Coins, Trophy } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import lavaTrailBg from '@/assets/lava-trail-bg.jpg';

const steps = [
  {
    icon: Wallet,
    step: '01',
    title: 'Get a Wallet',
    description: 'Download Phantom or Solflare wallet and set it up securely.',
  },
  {
    icon: Coins,
    step: '02',
    title: 'Get SOL',
    description: 'Buy SOL from an exchange and send it to your wallet.',
  },
  {
    icon: ArrowRightLeft,
    step: '03',
    title: 'Swap for $BIGTROUT',
    description: 'Connect to Raydium or Jupiter, paste the contract address, and swap.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'HODL & Win',
    description: 'Join the legendary army and hold for volcanic gains.',
  },
];

export const HowToBuySection = () => {
  const [scrollY, setScrollY] = useState(0);
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

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      {/* Parallax lava background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${lavaTrailBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          transform: `translateY(${scrollY * -0.5}px) scale(1.2)`,
          willChange: 'transform',
        }}
      />
      
      {/* Top transition from ice section */}
      <div 
        className="absolute top-0 left-0 right-0 h-48 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(195 90% 50% / 0.15) 0%, hsl(200 80% 45% / 0.08) 40%, transparent 100%)',
        }}
      />

      {/* Gradient overlay for content readability */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(180deg, 
            hsl(220 30% 6% / 0.5) 0%, 
            hsl(220 30% 6% / 0.4) 30%, 
            hsl(220 30% 6% / 0.5) 60%, 
            hsl(230 35% 8% / 0.7) 100%
          )`,
        }}
      />

      {/* Fire glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center 30%, hsl(20 100% 50% / 0.2), transparent 50%)',
        }}
      />

      {/* Bottom transition to night sky */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(240 40% 10% / 0.4) 50%, hsl(235 35% 8% / 0.8) 100%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="text-hero">HOW TO BUY</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join the legendary BIGTROUT army in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden lg:block absolute top-12 left-full w-full h-0.5 -translate-y-1/2 z-0" 
                  style={{
                    background: 'linear-gradient(90deg, hsl(20 100% 50% / 0.6), hsl(35 100% 55% / 0.3), transparent)',
                  }}
                />
              )}
              
              <div className="card-volcanic p-6 relative z-10">
                {/* Step number */}
                <span className="font-display text-6xl font-black text-fire opacity-20 absolute top-4 right-4">
                  {item.step}
                </span>
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 glow-ember">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contract address */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4 font-display text-sm tracking-wider">CONTRACT ADDRESS</p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-card/80 border border-primary/30 backdrop-blur-xl glow-ember">
            <code className="font-mono text-sm md:text-base text-fire break-all">
              EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG
            </code>
            <button 
              className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              onClick={() => navigator.clipboard.writeText('EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG')}
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
