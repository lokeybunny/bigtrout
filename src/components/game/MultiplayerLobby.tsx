import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import raceHowtoBg from '@/assets/bigtrout-race-howto.png';

const FISH_HEADS = [
  { id: 'trout', emoji: '🐟', name: 'Big Trout', color: '#2d8a4e' },
  { id: 'blowfish', emoji: '🐡', name: 'Blowfish', color: '#cc9933' },
  { id: 'shark', emoji: '🦈', name: 'Shark', color: '#5566aa' },
  { id: 'octopus', emoji: '🐙', name: 'Octopus', color: '#9933cc' },
];

interface MultiplayerLobbyProps {
  onStartMatch: (matchId: string, playerId: string, playerName: string, playerFish: string, opponentName: string, opponentFish: string, isPlayer1: boolean) => void;
  onBack: () => void;
}

export const MultiplayerLobby = ({ onStartMatch, onBack }: MultiplayerLobbyProps) => {
  const [username, setUsername] = useState('');
  const [selectedFish, setSelectedFish] = useState('trout');
  const [step, setStep] = useState<'setup' | 'searching'>('setup');
  const [status, setStatus] = useState('Looking for opponent...');
  const [dots, setDots] = useState('');
  const playerIdRef = useRef(crypto.randomUUID());
  const matchIdRef = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const cleanedUpRef = useRef(false);

  // Dots animation
  useEffect(() => {
    if (step !== 'searching') return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (matchIdRef.current && !cleanedUpRef.current) {
        supabase.from('matchmaking').delete().eq('id', matchIdRef.current).then(() => {});
      }
    };
  }, []);

  const startSearching = async () => {
    if (!username.trim()) return;
    setStep('searching');
    const playerId = playerIdRef.current;

    // Check for existing waiting room
    const { data: waiting } = await supabase
      .from('matchmaking')
      .select('*')
      .eq('status', 'waiting')
      .neq('player1_id', playerId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (waiting && waiting.length > 0) {
      const match = waiting[0];
      // Join existing match
      await supabase.from('matchmaking').update({
        player2_id: playerId,
        player2_name: username.trim(),
        player2_fish: selectedFish,
        status: 'matched',
      }).eq('id', match.id);

      cleanedUpRef.current = true;
      matchIdRef.current = match.id;

      // Create race positions for both players
      await supabase.from('race_positions').insert([
        { match_id: match.id, player_id: match.player1_id },
        { match_id: match.id, player_id: playerId },
      ]);

      onStartMatch(
        match.id,
        playerId,
        username.trim(),
        selectedFish,
        match.player1_name,
        match.player1_fish,
        false
      );
      return;
    }

    // Create new room
    const { data: newMatch } = await supabase.from('matchmaking').insert({
      player1_id: playerId,
      player1_name: username.trim(),
      player1_fish: selectedFish,
      status: 'waiting',
    }).select().single();

    if (!newMatch) {
      setStatus('Error creating room. Try again.');
      setStep('setup');
      return;
    }

    matchIdRef.current = newMatch.id;
    setStatus('Waiting for opponent');

    // Subscribe to changes on this match
    const channel = supabase
      .channel(`match-${newMatch.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matchmaking',
        filter: `id=eq.${newMatch.id}`,
      }, async (payload) => {
        const updated = payload.new as any;
        if (updated.status === 'matched' && updated.player2_id) {
          cleanedUpRef.current = true;

          // Create race positions
          await supabase.from('race_positions').insert([
            { match_id: newMatch.id, player_id: playerId },
            { match_id: newMatch.id, player_id: updated.player2_id },
          ]);

          onStartMatch(
            newMatch.id,
            playerId,
            username.trim(),
            selectedFish,
            updated.player2_name,
            updated.player2_fish,
            true
          );
        }
      })
      .subscribe();

    channelRef.current = channel;
  };

  if (step === 'searching') {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <img src={raceHowtoBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/85" />
        <div className="relative z-10 text-center px-6">
          <div className="text-5xl mb-6 animate-pulse">⚔️</div>
          <h2 className="text-2xl font-bold mb-4" style={{
            fontFamily: 'Bangers, cursive',
            color: '#ffcc44',
            textShadow: '2px 2px 0 #000',
            letterSpacing: '0.05em',
          }}>
            {status}{dots}
          </h2>
          <p className="text-sm mb-8" style={{ fontFamily: 'Rajdhani', color: '#888' }}>
            You: <span style={{ color: '#44ff88' }}>{username}</span> {FISH_HEADS.find(f => f.id === selectedFish)?.emoji}
          </p>
          <button
            onClick={() => {
              setStep('setup');
              if (matchIdRef.current) {
                supabase.from('matchmaking').delete().eq('id', matchIdRef.current).then(() => {});
                matchIdRef.current = null;
              }
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
            }}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              fontFamily: 'Bangers, cursive',
              background: 'rgba(255,68,68,0.2)',
              color: '#ff6644',
              cursor: 'pointer',
              border: '1px solid rgba(255,68,68,0.3)',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <img src={raceHowtoBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/85" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6" style={{
          fontFamily: 'Bangers, cursive',
          color: '#ffcc44',
          textShadow: '0 0 20px rgba(255,204,68,0.3), 3px 3px 0 #000',
          letterSpacing: '0.05em',
        }}>
          ⚔️ MULTIPLAYER SETUP
        </h2>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-xs font-bold mb-2" style={{
            fontFamily: 'Bangers, cursive',
            color: '#44ff88',
            letterSpacing: '0.05em',
          }}>
            YOUR NAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 20))}
            placeholder="Enter a display name..."
            maxLength={20}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: '1px solid rgba(68,255,136,0.3)',
              caretColor: '#44ff88',
            }}
          />
        </div>

        {/* Fish Head Picker */}
        <div className="mb-8">
          <label className="block text-xs font-bold mb-3" style={{
            fontFamily: 'Bangers, cursive',
            color: '#44ff88',
            letterSpacing: '0.05em',
          }}>
            CHOOSE YOUR FISH HEAD
          </label>
          <div className="grid grid-cols-4 gap-3">
            {FISH_HEADS.map((fish) => (
              <button
                key={fish.id}
                onClick={() => setSelectedFish(fish.id)}
                className="rounded-xl p-3 text-center transition-all duration-200 hover:scale-105"
                style={{
                  background: selectedFish === fish.id ? `rgba(68,255,136,0.15)` : 'rgba(0,0,0,0.5)',
                  border: selectedFish === fish.id ? '2px solid #44ff88' : '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                <div className="text-3xl mb-1">{fish.emoji}</div>
                <div className="text-xs font-bold" style={{
                  fontFamily: 'Bangers',
                  color: selectedFish === fish.id ? '#44ff88' : '#888',
                  letterSpacing: '0.03em',
                }}>
                  {fish.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={startSearching}
            disabled={!username.trim()}
            className="w-full px-10 py-4 rounded-xl font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            style={{
              fontFamily: 'Bangers, cursive',
              background: username.trim() ? 'linear-gradient(135deg, #1a6b3a, #44ff88)' : 'rgba(68,255,136,0.2)',
              color: '#0a1525',
              letterSpacing: '0.1em',
              cursor: username.trim() ? 'pointer' : 'not-allowed',
              border: 'none',
              boxShadow: username.trim() ? '0 0 30px rgba(68,255,136,0.3), 0 4px 20px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            🔍 FIND MATCH
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              fontFamily: 'Bangers, cursive',
              background: 'rgba(255,255,255,0.05)',
              color: '#888',
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

export { FISH_HEADS };
