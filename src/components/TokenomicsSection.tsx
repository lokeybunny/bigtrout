import { Flame, Snowflake, Fish, Zap } from 'lucide-react';

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
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
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
