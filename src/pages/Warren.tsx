import { useEffect, useState } from 'react';

const Warren = () => {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = 'https://warren.guru';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-2xl text-center space-y-8">
        <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
          "A great dev can make a great project but a good bundler can make a great allot of money."
        </p>
        <p className="text-xl md:text-2xl text-pepe font-bold italic">
          — Warren Guru
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting in {countdown}s…
        </p>
      </div>
    </div>
  );
};

export default Warren;
