import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import raceHowtoBg from '@/assets/bigtrout-race-howto.png';

interface LeaderboardEntry {
  id: string;
  username: string;
  time_ms: number;
  laps: number;
  created_at: string;
}

interface LeaderboardProps {
  onBack: () => void;
}

const formatTime = (ms: number) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
};

export const Leaderboard = ({ onBack }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('mode', 'multiplayer')
        .order('time_ms', { ascending: true })
        .limit(50);
      if (data) setEntries(data as LeaderboardEntry[]);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <img src={raceHowtoBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/85" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-8 overflow-y-auto max-h-screen">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{
          fontFamily: 'Bangers, cursive',
          color: '#ffcc44',
          textShadow: '0 0 20px rgba(255,204,68,0.3), 3px 3px 0 #000',
          letterSpacing: '0.05em',
        }}>
          🏆 LEADERBOARD
        </h2>

        <div className="rounded-xl overflow-hidden mb-6" style={{
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,204,68,0.2)',
          backdropFilter: 'blur(12px)',
        }}>
          {loading ? (
            <div className="p-8 text-center" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
              No races yet. Be the first to compete!
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex px-4 py-2 text-xs font-bold" style={{
                fontFamily: 'Bangers, cursive',
                color: '#888',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                letterSpacing: '0.05em',
              }}>
                <span className="w-10">#</span>
                <span className="flex-1">PLAYER</span>
                <span className="w-24 text-right">TIME</span>
              </div>

              {entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center px-4 py-2.5" style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: i < 3 ? 'rgba(255,204,68,0.05)' : 'transparent',
                }}>
                  <span className="w-10 text-lg font-bold" style={{
                    fontFamily: 'Bangers',
                    color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#555',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span className="flex-1 text-sm font-bold" style={{
                    fontFamily: 'Rajdhani',
                    color: '#ddd',
                  }}>
                    {entry.username}
                  </span>
                  <span className="w-24 text-right text-sm font-mono" style={{
                    color: i === 0 ? '#ffd700' : '#44ff88',
                  }}>
                    {formatTime(entry.time_ms)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: 'Bangers, cursive',
              background: 'rgba(255,255,255,0.05)',
              color: '#888',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
};
