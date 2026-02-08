import { useState, useRef, useCallback } from 'react';

interface RadioStation {
  name: string;
  url: string;
  genre: string;
}

const STATIONS: RadioStation[] = [
  // Lo-Fi / Chill
  { name: 'Lofi Girl', url: 'https://usa9.fastcast4u.com/proxy/jamz?mp=/1', genre: 'Lo-Fi' },
  { name: 'Chillout', url: 'https://ais-sa3.cdnstream1.com/2606_128.mp3', genre: 'Lo-Fi' },
  // Electronic / Dance
  { name: 'Dance Wave!', url: 'https://dancewave.online/dance.mp3', genre: 'Electronic' },
  { name: 'Electronic', url: 'https://0n-electroswing.radionetz.de/0n-electroswing.mp3', genre: 'Electronic' },
  // Hip Hop
  { name: 'Hip Hop Hits', url: 'https://streams.fluxfm.de/hiphop/mp3-320/streams.fluxfm.de/', genre: 'Hip Hop' },
  { name: 'Rap Classics', url: 'https://0n-oldschoolrap.radionetz.de/0n-oldschoolrap.mp3', genre: 'Hip Hop' },
  // Rock
  { name: 'Classic Rock', url: 'https://0n-classicrock.radionetz.de/0n-classicrock.mp3', genre: 'Rock' },
  { name: 'Rock Hits', url: 'https://0n-rock.radionetz.de/0n-rock.mp3', genre: 'Rock' },
  // Jazz
  { name: 'Smooth Jazz', url: 'https://0n-smoothjazz.radionetz.de/0n-smoothjazz.mp3', genre: 'Jazz' },
  { name: 'Jazz Cafe', url: 'https://0n-jazz.radionetz.de/0n-jazz.mp3', genre: 'Jazz' },
  // Reggae
  { name: 'Reggae', url: 'https://0n-reggae.radionetz.de/0n-reggae.mp3', genre: 'Reggae' },
  // Ambient
  { name: 'Ambient', url: 'https://0n-ambient.radionetz.de/0n-ambient.mp3', genre: 'Ambient' },
];

const GENRES = [...new Set(STATIONS.map(s => s.genre))];

const GENRE_EMOJI: Record<string, string> = {
  'Lo-Fi': '🎧',
  'Electronic': '⚡',
  'Hip Hop': '🎤',
  'Rock': '🎸',
  'Jazz': '🎷',
  'Reggae': '🌴',
  'Ambient': '🌊',
};

export const GameRadio = () => {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [vinylSpin, setVinylSpin] = useState(false);

  const playStation = useCallback((station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.5;
    audio.src = station.url;
    audioRef.current = audio;
    setCurrentStation(station);
    setPlaying(true);
    setVinylSpin(true);
    // Small delay to avoid AbortError race condition
    setTimeout(() => {
      audio.play().catch(e => console.warn('Radio playback failed:', e));
    }, 100);
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlaying(false);
    setVinylSpin(false);
  }, []);

  const togglePanel = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const filteredStations = STATIONS.filter(s => s.genre === selectedGenre);

  return (
    <>
      {/* Vinyl DJ Button — next to chart icon */}
      <div className="absolute bottom-2 left-16 z-10">
        <button
          onClick={togglePanel}
          className="w-12 h-12 rounded-lg flex items-center justify-center relative"
          style={{
            background: playing ? 'rgba(68,255,136,0.15)' : 'rgba(0,0,0,0.7)',
            border: playing ? '1px solid rgba(68,255,136,0.5)' : '1px solid rgba(255,204,68,0.4)',
            cursor: 'pointer',
            boxShadow: playing ? '0 0 15px rgba(68,255,136,0.3)' : '0 0 12px rgba(255,204,68,0.2)',
          }}
          title="Open Radio"
        >
          {/* Vinyl disc icon */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #333 20%, #111 22%, #222 40%, #111 42%, #1a1a1a 60%, #333 62%, #222 80%, #111 100%)',
            border: '2px solid #444',
            animation: vinylSpin ? 'spin 2s linear infinite' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: playing ? '#44ff88' : '#ffcc44',
            }} />
          </div>
          {playing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{
              background: '#44ff88',
              boxShadow: '0 0 6px rgba(68,255,136,0.8)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )}
        </button>
      </div>

      {/* Radio Panel */}
      {open && (
        <div className="absolute bottom-16 left-16 z-20" style={{
          width: 280,
          background: 'rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,204,68,0.3)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2" style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>🎵</span>
              <span style={{ fontFamily: 'Bangers', color: '#ffcc44', fontSize: 16, letterSpacing: '0.05em' }}>
                WORLD RADIO
              </span>
            </div>
            <button onClick={togglePanel} style={{
              background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16,
            }}>✕</button>
          </div>

          {/* Now playing */}
          {currentStation && (
            <div className="px-3 py-2 flex items-center gap-2" style={{
              background: 'rgba(68,255,136,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'radial-gradient(circle, #333 30%, #111 100%)',
                border: '1px solid #444',
                animation: vinylSpin ? 'spin 1.5s linear infinite' : 'none',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#44ff88' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani', color: '#44ff88', fontSize: 12, fontWeight: 'bold' }}>
                  NOW PLAYING
                </div>
                <div style={{ fontFamily: 'Rajdhani', color: '#fff', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentStation.name}
                </div>
              </div>
              <button onClick={stopPlayback} style={{
                background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.3)',
                borderRadius: 6, padding: '4px 8px', color: '#ff6644', cursor: 'pointer',
                fontFamily: 'Bangers', fontSize: 11,
              }}>STOP</button>
            </div>
          )}

          {/* Genre tabs */}
          <div className="flex flex-wrap gap-1 px-2 py-2" style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  background: selectedGenre === genre ? 'rgba(255,204,68,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selectedGenre === genre ? '1px solid rgba(255,204,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  color: selectedGenre === genre ? '#ffcc44' : '#888',
                  cursor: 'pointer',
                  fontFamily: 'Rajdhani',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              >
                {GENRE_EMOJI[genre] || '🎵'} {genre}
              </button>
            ))}
          </div>

          {/* Station list */}
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {filteredStations.map((station, i) => {
              const isActive = currentStation?.url === station.url && playing;
              return (
                <button
                  key={i}
                  onClick={() => playStation(station)}
                  className="w-full text-left px-3 py-2 flex items-center gap-2"
                  style={{
                    background: isActive ? 'rgba(68,255,136,0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#44ff88' : '#555',
                    boxShadow: isActive ? '0 0 6px rgba(68,255,136,0.6)' : 'none',
                  }} />
                  <span style={{
                    fontFamily: 'Rajdhani', fontSize: 13,
                    color: isActive ? '#44ff88' : '#ccc',
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}>
                    {station.name}
                  </span>
                  {isActive && <span style={{ fontSize: 10, marginLeft: 'auto' }}>🔊</span>}
                </button>
              );
            })}
          </div>

          {/* Volume */}
          <div className="px-3 py-2 flex items-center gap-2" style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 12, color: '#888' }}>🔈</span>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              onChange={e => {
                if (audioRef.current) audioRef.current.volume = parseInt(e.target.value) / 100;
              }}
              style={{ flex: 1, accentColor: '#44ff88', height: 4 }}
            />
            <span style={{ fontSize: 12, color: '#888' }}>🔊</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
