import { Flame, Snowflake, Fish, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import snowMountainBg from '@/assets/snow-mountain-bg.jpg';

const tokenomicsData = [
  {
    icon: Flame,
    title: 'Total Supply',
    value: '1,000,000,000',
    description: 'One billion BIGTROUT tokens',
    gradient: 'fire',
  },
  {
    icon: Snowflake,
    title: 'Liquidity Locked',
    value: '100%',
    description: 'Burned forever in the frozen depths',
    gradient: 'ice',
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

export const TokenomicsSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top;
        const windowHeight = window.innerHeight;
        // Calculate parallax offset based on section position
        const parallaxOffset = (windowHeight - sectionTop) * 0.3;
        setScrollY(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tokenomicsData.map((item, index) => (
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
