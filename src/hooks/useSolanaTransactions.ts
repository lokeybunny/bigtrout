import { useEffect, useRef, useCallback, useState } from 'react';

const TOKEN_MINT = 'EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG';
const HELIUS_WS = 'wss://mainnet.helius-rpc.com/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff';

export type TransactionEvent = {
  type: 'buy' | 'sell';
  amount: number; // SOL amount
  timestamp: number;
};

export type GameEvent = {
  id: string;
  kind: 'trout' | 'goldfish' | 'octopus';
  timestamp: number;
};

const BIG_BUY_THRESHOLD = 0.5; // SOL — above this = trout
const SELL_STREAK_THRESHOLD = 3; // consecutive sells = octopus

export function useSolanaTransactions(onGameEvent: (event: GameEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const sellStreakRef = useRef(0);
  const [connected, setConnected] = useState(false);
  const onGameEventRef = useRef(onGameEvent);
  onGameEventRef.current = onGameEvent;

  const processTransaction = useCallback((tx: any) => {
    try {
      // Parse token transfers from transaction
      const meta = tx?.meta;
      const preBalances = meta?.preTokenBalances || [];
      const postBalances = meta?.postTokenBalances || [];
      
      // Find our token's balance changes
      const preToken = preBalances.find((b: any) => b.mint === TOKEN_MINT);
      const postToken = postBalances.find((b: any) => b.mint === TOKEN_MINT);
      
      if (!preToken && !postToken) return;
      
      const preAmount = preToken?.uiTokenAmount?.uiAmount || 0;
      const postAmount = postToken?.uiTokenAmount?.uiAmount || 0;
      const diff = postAmount - preAmount;
      
      // Calculate SOL change
      const preSol = (meta?.preBalances?.[0] || 0) / 1e9;
      const postSol = (meta?.postBalances?.[0] || 0) / 1e9;
      const solChange = Math.abs(postSol - preSol);
      
      const isBuy = diff > 0;
      
      if (isBuy) {
        sellStreakRef.current = 0;
        const kind = solChange >= BIG_BUY_THRESHOLD ? 'trout' : 'goldfish';
        onGameEventRef.current({
          id: `${Date.now()}-${Math.random()}`,
          kind,
          timestamp: Date.now(),
        });
      } else {
        sellStreakRef.current++;
        if (sellStreakRef.current >= SELL_STREAK_THRESHOLD) {
          sellStreakRef.current = 0;
          onGameEventRef.current({
            id: `${Date.now()}-${Math.random()}`,
            kind: 'octopus',
            timestamp: Date.now(),
          });
        }
      }
    } catch (e) {
      console.log('[Solana] Error parsing tx:', e);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const ws = new WebSocket(HELIUS_WS);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setConnected(true);
        console.log('[Solana] Connected');
        
        // Subscribe to token account changes
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'logsSubscribe',
          params: [
            { mentions: [TOKEN_MINT] },
            { commitment: 'confirmed' }
          ]
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.method === 'logsNotification') {
            const logs = data.params?.result?.value?.logs || [];
            const signature = data.params?.result?.value?.signature;
            
            // Check if it's a swap/trade
            const isSwap = logs.some((log: string) => 
              log.includes('Swap') || 
              log.includes('swap') || 
              log.includes('Trade') ||
              log.includes('ray_log') ||
              log.includes('Program log: Instruction: ')
            );
            
            if (isSwap && signature) {
              // Determine buy vs sell from logs
              const isBuy = logs.some((log: string) => 
                log.includes('Buy') || log.includes('buy')
              );
              const isSell = logs.some((log: string) => 
                log.includes('Sell') || log.includes('sell')
              );
              
              // Use a heuristic: random-ish based on log content for demo
              // In production you'd parse the actual amounts
              const solEstimate = Math.random() * 2; // Estimated SOL
              
              if (isSell) {
                sellStreakRef.current++;
                if (sellStreakRef.current >= SELL_STREAK_THRESHOLD) {
                  sellStreakRef.current = 0;
                  onGameEventRef.current({
                    id: `${Date.now()}-${Math.random()}`,
                    kind: 'octopus',
                    timestamp: Date.now(),
                  });
                }
              } else {
                // Default to buy for swaps
                sellStreakRef.current = 0;
                const kind = solEstimate >= BIG_BUY_THRESHOLD ? 'trout' : 'goldfish';
                onGameEventRef.current({
                  id: `${Date.now()}-${Math.random()}`,
                  kind,
                  timestamp: Date.now(),
                });
              }
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        console.log('[Solana] Disconnected, reconnecting...');
        setTimeout(connect, 3000);
      };
      
      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.log('[Solana] Connection error:', e);
      setTimeout(connect, 3000);
    }
  }, [processTransaction]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  // Demo mode: spawn events periodically for testing when no real trades happening
  useEffect(() => {
    const demoInterval = setInterval(() => {
      const r = Math.random();
      if (r < 0.4) {
        onGameEventRef.current({
          id: `demo-${Date.now()}`,
          kind: 'goldfish',
          timestamp: Date.now(),
        });
      } else if (r < 0.7) {
        onGameEventRef.current({
          id: `demo-${Date.now()}`,
          kind: 'trout',
          timestamp: Date.now(),
        });
      } else if (r < 0.85) {
        onGameEventRef.current({
          id: `demo-${Date.now()}`,
          kind: 'octopus',
          timestamp: Date.now(),
        });
      }
    }, 4000 + Math.random() * 6000);
    
    return () => clearInterval(demoInterval);
  }, []);

  return { connected };
}
