import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TRACKED_WALLET = "2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ";
const TOKEN_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// Known program IDs mapped to platform names
const PROGRAM_MAP: Record<string, string> = {
  // DEX Aggregators
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcPX7rE": "Jupiter",
  "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uN9CFi": "Jupiter",
  // Raydium
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium",
  "routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS": "Raydium",
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK": "Raydium CLMM",
  // Pump.fun / PumpSwap
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P": "PumpSwap",
  "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA": "PumpSwap",
  // Meteora
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo": "Meteora",
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB": "Meteora",
  // Moonshot
  "MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG": "Moonshot",
  // Orca
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca",
  // Phoenix
  "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY": "Phoenix",
};

// Known CEX hot wallets (partial list)
const CEX_WALLETS: Record<string, string> = {
  // These are commonly known CEX hot wallets
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get recent transaction signatures for the wallet
    const signatures = await rpcCall("getSignaturesForAddress", [
      TRACKED_WALLET,
      { limit: 50 },
    ]);

    const platformCounts: Record<string, number> = {};
    const recentTxs: Array<{ platform: string; time: number; signature: string }> = [];
    let processedCount = 0;

    // Process transactions
    const batch = signatures.slice(0, 35);

    for (const sig of batch) {
      try {
        const tx = await rpcCall("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta || tx.meta.err) continue;

        // Check all account keys / program IDs in the transaction
        let platform = "Direct Transfer";

        // Check program IDs in the transaction instructions
        const accountKeys = tx.transaction?.message?.accountKeys || [];
        const instructions = tx.transaction?.message?.instructions || [];
        const innerInstructions = tx.meta?.innerInstructions || [];

        // Collect all program IDs from instructions
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

        // Match against known programs
        for (const pid of allProgramIds) {
          if (PROGRAM_MAP[pid]) {
            platform = PROGRAM_MAP[pid];
            break;
          }
        }

        // If still direct transfer, check if sender is a known CEX wallet
        if (platform === "Direct Transfer") {
          for (const key of accountKeys) {
            const pubkey = key.pubkey?.toString() || key;
            if (CEX_WALLETS[pubkey]) {
              platform = CEX_WALLETS[pubkey];
              break;
            }
          }
        }

        // Count all transactions that go through this wallet (not just token-specific)
        // since the wallet is token-specific already
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        recentTxs.push({
          platform,
          time: sig.blockTime * 1000,
          signature: sig.signature,
        });
        processedCount++;
      } catch (_e) {
        // Skip failed transaction fetches (rate limit, etc.)
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

    return new Response(
      JSON.stringify({
        wallet: TRACKED_WALLET,
        totalTransactions: processedCount,
        platforms,
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
