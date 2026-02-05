import { Twitter } from 'lucide-react';

const socialLinks = [
  {
    icon: Twitter,
    name: 'Community',
    handle: 'Join on X',
    url: 'https://x.com/i/communities/2019176023888187687',
    color: 'fire',
  },
];

export const CommunitySection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section header */}
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
          <span className="text-ice">JOIN THE</span>{' '}
          <span className="text-fire">ARMY</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
          The BIGTROUT community is growing stronger. Join us on our quest for volcanic gains.
        </p>

        {/* Social links */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              className="card-volcanic px-8 py-6 flex items-center gap-4 group cursor-pointer"
            >
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  social.color === 'fire' ? 'glow-fire group-hover:scale-110' : 'glow-ice group-hover:scale-110'
                }`}
                style={{
                  background: social.color === 'fire' 
                    ? 'linear-gradient(135deg, hsl(20 100% 50%), hsl(35 100% 55%))'
                    : 'linear-gradient(135deg, hsl(195 90% 45%), hsl(190 100% 70%))',
                }}
              >
                <social.icon className="w-6 h-6 text-storm-dark" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">{social.name}</p>
                <p className="text-sm text-muted-foreground">{social.handle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
