import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import axiomLogo from '@/assets/logos/axiom.png';
import padreLogo from '@/assets/logos/padre.png';
import photonLogo from '@/assets/logos/photon.png';
import pumpfunLogo from '@/assets/logos/pumpfun.png';

const platforms = [
  {
    name: 'Axiom',
    logo: axiomLogo,
    url: 'https://axiom.trade/meme/84Q5fsB6dhvsYHqDfkBXDvdfmSiweLeZwGmUtD1fUBAc?chain=sol/@bigtrout',
  },
  {
    name: 'Terminal (Padre)',
    logo: padreLogo,
    url: 'https://trade.padre.gg/trade/solana/84Q5fsB6dhvsYHqDfkBXDvdfmSiweLeZwGmUtD1fUBAc/@bigtrout',
  },
  {
    name: 'Photon SOL',
    logo: photonLogo,
    url: 'https://photon-sol.tinyastro.io/en/lp/84Q5fsB6dhvsYHqDfkBXDvdfmSiweLeZwGmUtD1fUBAc?handle=319106305b9f28998a6031/@bigtrout',
  },
  {
    name: 'Pump.fun',
    logo: pumpfunLogo,
    url: 'https://pump.fun/coin/EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG',
  },
];

const PlatformGrid = () => (
  <div className="grid grid-cols-2 gap-3 py-4">
    {platforms.map((p) => (
      <a
        key={p.name}
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-pepe/40 transition-all duration-200 group"
      >
        <img src={p.logo} alt={p.name} className="w-10 h-10 rounded-lg object-contain" />
        <span className="text-sm font-semibold text-foreground/80 group-hover:text-pepe transition-colors">
          {p.name}
        </span>
      </a>
    ))}
  </div>
);

interface BuyNowPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BuyNowPopup = ({ open, onOpenChange }: BuyNowPopupProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-[hsl(210,25%,10%)] border-white/10">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg font-bold">Buy $BIGTROUT</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <PlatformGrid />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(210,25%,10%)] border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">Buy $BIGTROUT</DialogTitle>
        </DialogHeader>
        <PlatformGrid />
      </DialogContent>
    </Dialog>
  );
};
