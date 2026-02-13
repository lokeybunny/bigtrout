import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TRACKED_WALLET = "2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// Known program IDs mapped to platform names
const PROGRAM_MAP: Record<string, string> = {
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcPX7rE": "Jupiter",
  "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uN9CFi": "Jupiter",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium",
  "routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS": "Raydium",
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK": "Raydium CLMM",
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P": "PumpSwap",
  "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA": "PumpSwap",
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo": "Meteora",
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB": "Meteora",
  "MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG": "Moonshot",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca",
  "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY": "Phoenix",
};

const CEX_WALLETS: Record<string, string> = {
  "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9": "Binance",
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM": "Binance",
  "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S": "Bybit",
  "AC5RDfQFmDS1deWZos921JfqscXdByf6BKHAbXh2pVnD": "MEXC",
  "ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ": "MEXC",
};

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function classifyTransaction(tx: any): string {
  let platform = "Direct Transfer";

  const instructions = tx.transaction?.message?.instructions || [];
  const innerInstructions = tx.meta?.innerInstructions || [];
  const accountKeys = tx.transaction?.message?.accountKeys || [];

  const allProgramIds = new Set<string>();
  for (const ix of instructions) {
    const programId = ix.programId?.toString() || ix.program;
    if (programId) allProgramIds.add(programId);
  }
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions || []) {
      const programId = ix.programId?.toString() || ix.program;
      if (programId) allProgramIds.add(programId);
    }
  }

  for (const pid of allProgramIds) {
    if (PROGRAM_MAP[pid]) {
      platform = PROGRAM_MAP[pid];
      break;
    }
  }

  if (platform === "Direct Transfer") {
    for (const key of accountKeys) {
      const pubkey = key.pubkey?.toString() || key;
      if (CEX_WALLETS[pubkey]) {
        platform = CEX_WALLETS[pubkey];
        break;
      }
    }
  }

  return platform;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Get recent transaction signatures
    const signatures = await rpcCall("getSignaturesForAddress", [
      TRACKED_WALLET,
      { limit: 100 },
    ]);

    const platformCounts: Record<string, number> = {};
    const recentTxs: Array<{ platform: string; time: number; signature: string }> = [];
    // Hourly buckets for the last 24 hours
    const hourlyActivity: Record<string, { hour: string; count: number; deposits: number }> = {};

    // Initialize 24 hourly buckets
    for (let i = 23; i >= 0; i--) {
      const bucketTime = new Date(now - i * 60 * 60 * 1000);
      const hourKey = bucketTime.toISOString().slice(0, 13); // e.g. "2026-02-13T01"
      const hourLabel = bucketTime.getUTCHours().toString().padStart(2, '0') + ':00';
      hourlyActivity[hourKey] = { hour: hourLabel, count: 0, deposits: 0 };
    }

    let processedCount = 0;

    // Process transactions (up to 50 to avoid rate limits)
    const batch = signatures.slice(0, 50);

    for (const sig of batch) {
      try {
        const blockTimeMs = sig.blockTime * 1000;

        // Skip transactions older than 24h for hourly chart (but still count for platform bars)
        const isWithin24h = blockTimeMs >= twentyFourHoursAgo;

        const tx = await rpcCall("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta || tx.meta.err) continue;

        const platform = classifyTransaction(tx);

        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        recentTxs.push({
          platform,
          time: blockTimeMs,
          signature: sig.signature,
        });
        processedCount++;

        // Add to hourly bucket if within 24h
        if (isWithin24h) {
          const txDate = new Date(blockTimeMs);
          const hourKey = txDate.toISOString().slice(0, 13);
          if (hourlyActivity[hourKey]) {
            hourlyActivity[hourKey].count += 1;
            // Count deposits (incoming = not Direct Transfer or any platform swap into wallet)
            hourlyActivity[hourKey].deposits += 1;
          }
        }
      } catch (_e) {
        continue;
      }
    }

    // Sort platforms by count
    const platforms = Object.entries(platformCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: processedCount > 0 ? Math.round((count / processedCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Convert hourly activity to sorted array
    const hourlyData = Object.values(hourlyActivity).map(h => ({
      hour: h.hour,
      transactions: h.count,
      deposits: h.deposits,
    }));

    return new Response(
      JSON.stringify({
        wallet: TRACKED_WALLET,
        totalTransactions: processedCount,
        platforms,
        hourlyActivity: hourlyData,
        recentTransactions: recentTxs.slice(0, 10),
        lastUpdated: Date.now(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Inflow tracker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
