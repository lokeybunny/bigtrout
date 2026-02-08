import { Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => setIsLoaded(true));
    audio.addEventListener('error', (e) => console.error('Audio loading error:', e));
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play().catch((err) => console.error('Playback failed:', err)); }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      style={{
        background: isPlaying 
          ? 'linear-gradient(135deg, hsl(130 60% 35%), hsl(130 70% 50%))'
          : 'linear-gradient(135deg, hsl(140 25% 15%), hsl(140 30% 20%))',
        border: isPlaying 
          ? '2px solid hsl(130 70% 50%)' 
          : '2px solid hsl(140 20% 30%)',
        boxShadow: isPlaying
          ? '0 0 30px hsl(130 60% 40% / 0.6), 0 0 60px hsl(130 70% 50% / 0.3)'
          : '0 0 20px hsl(0 0% 0% / 0.3)',
      }}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      title={isPlaying ? 'Pause epic music' : 'Play epic music'}
    >
      {isPlaying ? (
        <Volume2 className="w-6 h-6 text-garden-dark" />
      ) : (
        <VolumeX className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
      
      {isPlaying && (
        <>
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{
            background: 'linear-gradient(135deg, hsl(130 60% 35%), hsl(130 70% 50%))',
          }} />
          <span className="absolute inset-[-4px] rounded-full opacity-50" style={{
            background: 'radial-gradient(circle, hsl(130 60% 40% / 0.4), transparent)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </>
      )}
    </button>
  );
};
