
-- Leaderboard for race times
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  laps INTEGER NOT NULL DEFAULT 5,
  mode TEXT NOT NULL DEFAULT 'multiplayer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can view leaderboard
CREATE POLICY "Leaderboard is publicly readable"
ON public.leaderboard FOR SELECT USING (true);

-- Anyone can insert (no auth required for game)
CREATE POLICY "Anyone can submit times"
ON public.leaderboard FOR INSERT WITH CHECK (true);

-- Matchmaking rooms
CREATE TABLE public.matchmaking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player1_fish TEXT NOT NULL DEFAULT 'trout',
  player2_id TEXT,
  player2_name TEXT,
  player2_fish TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matchmaking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matchmaking is publicly readable"
ON public.matchmaking FOR SELECT USING (true);

CREATE POLICY "Anyone can create a match"
ON public.matchmaking FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
ON public.matchmaking FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete matches"
ON public.matchmaking FOR DELETE USING (true);

-- Multiplayer race positions (for realtime sync)
CREATE TABLE public.race_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matchmaking(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  pos_x FLOAT NOT NULL DEFAULT 0,
  pos_z FLOAT NOT NULL DEFAULT 0,
  heading FLOAT NOT NULL DEFAULT 0,
  lap INTEGER NOT NULL DEFAULT 0,
  finished BOOLEAN NOT NULL DEFAULT false,
  finish_time_ms INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.race_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Race positions publicly readable"
ON public.race_positions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert race positions"
ON public.race_positions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update race positions"
ON public.race_positions FOR UPDATE USING (true);

-- Enable realtime for matchmaking and race positions
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_positions;
