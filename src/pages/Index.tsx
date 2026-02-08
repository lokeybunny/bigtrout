import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TokenomicsSection } from '@/components/TokenomicsSection';
import { HowToBuySection } from '@/components/HowToBuySection';
import { CommunitySection } from '@/components/CommunitySection';
import { NewsLoreSection } from '@/components/NewsLoreSection';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';
import { MusicPlayer } from '@/components/MusicPlayer';

const Index = () => {
  const location = useLocation();

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
      <ParticleField />
      <Navbar />
      <main>
        <HeroSection />
        <div id="tokenomics" className="relative z-10 -mt-1" style={{ background: 'hsl(210 25% 10%)' }}>
          <div className="divider-brush h-1" />
          <TokenomicsSection />
        </div>
        <div id="how-to-buy">
          <HowToBuySection />
        </div>
        <div id="community">
          <CommunitySection />
        </div>
        <NewsLoreSection />
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  );
};

export default Index;
