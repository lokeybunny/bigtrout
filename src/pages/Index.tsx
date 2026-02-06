import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TokenomicsSection } from '@/components/TokenomicsSection';
import { HowToBuySection } from '@/components/HowToBuySection';
import { CommunitySection } from '@/components/CommunitySection';
import { NewsSection } from '@/components/NewsSection';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';
import { MusicPlayer } from '@/components/MusicPlayer';

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Particle effects layer */}
      <ParticleField />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main>
        <HeroSection />
        
        <div id="tokenomics">
          <TokenomicsSection />
        </div>
        
        <div id="how-to-buy">
          <HowToBuySection />
        </div>
        
        <div id="community">
          <CommunitySection />
        </div>

        <div id="news">
          <NewsSection />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};

export default Index;
