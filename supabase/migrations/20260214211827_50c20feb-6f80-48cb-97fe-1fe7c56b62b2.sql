
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can update matches" ON public.matchmaking;
DROP POLICY IF EXISTS "Anyone can delete matches" ON public.matchmaking;

-- Allow updates only when match is in 'waiting' status (joining a match)
-- This prevents tampering with active/completed matches
CREATE POLICY "Can only join waiting matches"
ON public.matchmaking
FOR UPDATE
USING (status = 'waiting')
WITH CHECK (status IN ('waiting', 'matched'));

-- Allow deleting only waiting matches (cleanup stale lobbies)
CREATE POLICY "Can only delete waiting matches"
ON public.matchmaking
FOR DELETE
USING (status = 'waiting');
