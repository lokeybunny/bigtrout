import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TRACKED_WALLET = "2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ";
const BIGTROUT_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

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
    const accountKeys = tx.transaction?.message?.accountKeys || [];
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

// Extract BIGTROUT token change amount from a transaction (positive = buy, negative = sell)
function extractTokenChange(tx: any, signature: string): number {
  const preBalances = tx.meta?.preTokenBalances || [];
  const postBalances = tx.meta?.postTokenBalances || [];

  const preAmountByOwner: Record<string, number> = {};
  const postAmountByOwner: Record<string, number> = {};

  for (const bal of preBalances) {
    if (bal.mint === BIGTROUT_MINT) {
      const owner = bal.owner || "";
      const amount = parseFloat(bal.uiTokenAmount?.uiAmountString || bal.uiTokenAmount?.uiAmount?.toString() || "0");
      preAmountByOwner[owner] = (preAmountByOwner[owner] || 0) + amount;
    }
  }
  for (const bal of postBalances) {
    if (bal.mint === BIGTROUT_MINT) {
      const owner = bal.owner || "";
      const amount = parseFloat(bal.uiTokenAmount?.uiAmountString || bal.uiTokenAmount?.uiAmount?.toString() || "0");
      postAmountByOwner[owner] = (postAmountByOwner[owner] || 0) + amount;
    }
  }

  const pre = preAmountByOwner[TRACKED_WALLET] || 0;
  const post = postAmountByOwner[TRACKED_WALLET] || 0;
  const delta = post - pre;

  if (delta !== 0) {
    console.log(`[${signature.slice(0, 8)}] BIGTROUT ${delta > 0 ? 'BUY' : 'SELL'}: ${Math.abs(delta).toFixed(2)} tokens`);
  }

  return delta; // positive = buy, negative = sell
}

type RangeKey = "24h" | "7d" | "30d";

const RANGE_CONFIG: Record<RangeKey, { ms: number; sigLimit: number; bucketType: "hourly" | "daily" }> = {
  "24h": { ms: 24 * 60 * 60 * 1000, sigLimit: 100, bucketType: "hourly" },
  "7d":  { ms: 7 * 24 * 60 * 60 * 1000, sigLimit: 200, bucketType: "daily" },
  "30d": { ms: 30 * 24 * 60 * 60 * 1000, sigLimit: 500, bucketType: "daily" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get("range") || "24h") as RangeKey;
    const config = RANGE_CONFIG[range] || RANGE_CONFIG["24h"];

    const now = Date.now();
    const rangeStart = now - config.ms;

    // Get recent transaction signatures
    const signatures = await rpcCall("getSignaturesForAddress", [
      TRACKED_WALLET,
      { limit: config.sigLimit },
    ]);

    const platformCounts: Record<string, number> = {};
    const recentTxs: Array<{ platform: string; time: number; signature: string; amount: number; type: string }> = [];
    let totalBought = 0;
    let totalSold = 0;

    // Build time buckets
    const buckets: Record<string, { label: string; count: number; buys: number; sells: number; buyAmount: number; sellAmount: number }> = {};

    if (config.bucketType === "hourly") {
      for (let i = 23; i >= 0; i--) {
        const t = new Date(now - i * 60 * 60 * 1000);
        const key = t.toISOString().slice(0, 13);
        buckets[key] = { label: t.getUTCHours().toString().padStart(2, '0') + ':00', count: 0, buys: 0, sells: 0, buyAmount: 0, sellAmount: 0 };
      }
    } else {
      const days = range === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const t = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = t.toISOString().slice(0, 10);
        const label = `${(t.getUTCMonth() + 1).toString().padStart(2, '0')}/${t.getUTCDate().toString().padStart(2, '0')}`;
        buckets[key] = { label, count: 0, buys: 0, sells: 0, buyAmount: 0, sellAmount: 0 };
      }
    }

    let processedCount = 0;
    const batch = signatures.slice(0, Math.min(signatures.length, 80));

    for (const sig of batch) {
      try {
        const blockTimeMs = sig.blockTime * 1000;
        if (blockTimeMs < rangeStart) continue; // Skip out-of-range

        const tx = await rpcCall("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta || tx.meta.err) continue;

        const platform = classifyTransaction(tx);
        const tokenChange = extractTokenChange(tx, sig.signature);
        const txType = tokenChange > 0 ? "buy" : tokenChange < 0 ? "sell" : "other";

        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        if (tokenChange > 0) totalBought += tokenChange;
        if (tokenChange < 0) totalSold += Math.abs(tokenChange);

        recentTxs.push({
          platform,
          time: blockTimeMs,
          signature: sig.signature,
          amount: tokenChange,
          type: txType,
        });
        processedCount++;

        // Bucket assignment
        const txDate = new Date(blockTimeMs);
        const bucketKey = config.bucketType === "hourly"
          ? txDate.toISOString().slice(0, 13)
          : txDate.toISOString().slice(0, 10);

        if (buckets[bucketKey]) {
          buckets[bucketKey].count += 1;
          if (tokenChange > 0) {
            buckets[bucketKey].buys += 1;
            buckets[bucketKey].buyAmount += tokenChange;
          } else if (tokenChange < 0) {
            buckets[bucketKey].sells += 1;
            buckets[bucketKey].sellAmount += Math.abs(tokenChange);
          }
        }
      } catch (_e) {
        continue;
      }
    }

    const platforms = Object.entries(platformCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: processedCount > 0 ? Math.round((count / processedCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const activityData = Object.values(buckets).map(b => ({
      label: b.label,
      transactions: b.count,
      buys: b.buys,
      sells: b.sells,
      buyAmount: b.buyAmount,
      sellAmount: b.sellAmount,
    }));

    return new Response(
      JSON.stringify({
        wallet: TRACKED_WALLET,
        range,
        totalTransactions: processedCount,
        totalBought,
        totalSold,
        platforms,
        activityData,
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
