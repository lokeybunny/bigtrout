import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TokenomicsSection } from '@/components/TokenomicsSection';
import { HowToBuySection } from '@/components/HowToBuySection';
import { CommunitySection } from '@/components/CommunitySection';
import { NewsLoreSection } from '@/components/NewsLoreSection';
import { InflowTracker } from '@/components/InflowTracker';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

const Index = () => {
  const location = useLocation();
  const quality = usePerformanceMode();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {quality !== 'low' && <ParticleField quality={quality} />}
      <Navbar />
      <main>
        <HeroSection quality={quality} />
        <div id="tokenomics" className="relative z-10 -mt-8" style={{ background: 'hsl(210 25% 10%)' }}>
          <div className="divider-brush h-1" />
          <TokenomicsSection />
        </div>
        <div id="how-to-buy">
          <HowToBuySection quality={quality} />
        </div>
        <div id="community">
          <CommunitySection />
        </div>
        <NewsLoreSection />
        <InflowTracker />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
