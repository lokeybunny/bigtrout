import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TokenomicsSection } from '@/components/TokenomicsSection';
import { HowToBuySection } from '@/components/HowToBuySection';
import { CommunitySection } from '@/components/CommunitySection';
import { Footer } from '@/components/Footer';
import { ParticleField } from '@/components/ParticleField';

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
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
