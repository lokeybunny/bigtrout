export const Footer = () => {
  return (
    <footer className="relative py-12 px-4 border-t border-border/30" style={{ background: 'hsl(150 30% 5%)' }}>
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="font-display text-3xl font-black text-pepe-sakura mb-4">
          $BIGTROUT
        </h3>
        
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
          Disclaimer: $BIGTROUT is a meme coin with no intrinsic value or expectation of financial return. 
          This is not financial advice. Trade at your own risk.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <span>© 2025 $BIGTROUT</span>
          <span className="hidden sm:inline">•</span>
          <span>All Rights Reserved</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-pepe">Based</span>
          <span>&</span>
          <span className="text-sakura">Beautiful</span>
        </div>
      </div>
    </footer>
  );
};
