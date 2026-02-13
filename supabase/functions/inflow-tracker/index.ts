import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TRACKED_WALLET = "2U4zpVocENRnsotRZ1jmxf4zQ5w7k6YeZX5o2ZenzjnJ";
const BIGTROUT_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// LP / AMM programs — token outflows to these are "Add Liquidity", not sells
const LP_PROGRAMS = new Set([
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", // Meteora
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB", // Meteora
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", // Raydium CLMM
]);

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

async function rpcCall(method: string, params: unknown[], retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(SOLANA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, waiting ${wait}ms (attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.result;
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

function getProgramIds(tx: any): Set<string> {
  const allProgramIds = new Set<string>();
  const instructions = tx.transaction?.message?.instructions || [];
  const innerInstructions = tx.meta?.innerInstructions || [];
  for (const ix of instructions) {
    const pid = ix.programId?.toString() || ix.program;
    if (pid) allProgramIds.add(pid);
  }
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions || []) {
      const pid = ix.programId?.toString() || ix.program;
      if (pid) allProgramIds.add(pid);
    }
  }
  return allProgramIds;
}

function classifyTransaction(tx: any): string {
  let platform = "Direct Transfer";
  const allProgramIds = getProgramIds(tx);

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

// Determine if this is an LP operation (add/remove liquidity) vs a swap/sell
function isLPOperation(tx: any): boolean {
  const programIds = getProgramIds(tx);
  for (const pid of programIds) {
    if (LP_PROGRAMS.has(pid)) return true;
  }
  return false;
}

// Extract BIGTROUT token change for the tracked wallet
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
  return post - pre;
}

// Classify the transaction type based on token change and program
function classifyTxType(tokenChange: number, isLP: boolean): string {
  if (tokenChange > 0) return "buy";
  if (tokenChange < 0 && isLP) return "add_lp";
  if (tokenChange < 0) return "sell";
  return "other";
}

type RangeKey = "24h" | "7d" | "30d";

const RANGE_CONFIG: Record<RangeKey, { ms: number; sigLimit: number; batchSize: number; bucketType: "hourly" | "daily" }> = {
  "24h": { ms: 24 * 60 * 60 * 1000, sigLimit: 200, batchSize: 30, bucketType: "hourly" },
  "7d":  { ms: 7 * 24 * 60 * 60 * 1000, sigLimit: 500, batchSize: 60, bucketType: "daily" },
  "30d": { ms: 30 * 24 * 60 * 60 * 1000, sigLimit: 1000, batchSize: 100, bucketType: "daily" },
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

    // Step 1: Find the wallet's BIGTROUT Associated Token Account (ATA)
    // Querying the ATA directly gives us ONLY BIGTROUT-related transactions
    let queryAddress = TRACKED_WALLET;
    try {
      const tokenAccounts = await rpcCall("getTokenAccountsByOwner", [
        TRACKED_WALLET,
        { mint: BIGTROUT_MINT },
        { encoding: "jsonParsed" },
      ]);
      if (tokenAccounts?.value?.length > 0) {
        queryAddress = tokenAccounts.value[0].pubkey;
        console.log("Using BIGTROUT ATA:", queryAddress);
      }
    } catch (e) {
      console.log("ATA lookup failed, using main wallet:", e.message);
    }

    // Step 2: Get signatures from the ATA — paginate to get all within range
    let allSignatures: any[] = [];
    let lastSig: string | undefined = undefined;
    let keepFetching = true;

    while (keepFetching && allSignatures.length < config.sigLimit) {
      const params: any = { limit: 1000 };
      if (lastSig) params.before = lastSig;
      const sigs = await rpcCall("getSignaturesForAddress", [queryAddress, params]);
      if (!sigs || sigs.length === 0) break;

      for (const s of sigs) {
        if (s.blockTime * 1000 >= rangeStart) {
          allSignatures.push(s);
        } else {
          keepFetching = false;
          break;
        }
      }
      lastSig = sigs[sigs.length - 1].signature;
      if (sigs.length < 1000) break;
    }

    console.log(`Found ${allSignatures.length} BIGTROUT signatures in range`);

    const batch = allSignatures.slice(0, config.batchSize);
    console.log(`Processing ${batch.length} signatures`);

    const platformCounts: Record<string, number> = {};
    const recentTxs: Array<{ platform: string; time: number; signature: string; amount: number; type: string }> = [];
    let totalBought = 0;
    let totalSold = 0;
    let totalAddedLP = 0;

    // Build time buckets
    const buckets: Record<string, { label: string; count: number; buys: number; sells: number; addLp: number; buyAmount: number; sellAmount: number; lpAmount: number }> = {};

    if (config.bucketType === "hourly") {
      for (let i = 23; i >= 0; i--) {
        const t = new Date(now - i * 60 * 60 * 1000);
        const key = t.toISOString().slice(0, 13);
        buckets[key] = { label: t.getUTCHours().toString().padStart(2, '0') + ':00', count: 0, buys: 0, sells: 0, addLp: 0, buyAmount: 0, sellAmount: 0, lpAmount: 0 };
      }
    } else {
      const days = range === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const t = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = t.toISOString().slice(0, 10);
        const label = `${(t.getUTCMonth() + 1).toString().padStart(2, '0')}/${t.getUTCDate().toString().padStart(2, '0')}`;
        buckets[key] = { label, count: 0, buys: 0, sells: 0, addLp: 0, buyAmount: 0, sellAmount: 0, lpAmount: 0 };
      }
    }

    let processedCount = 0;
    let failedCount = 0;
    console.log(`Processing ${batch.length} signatures`);

    // Process sequentially with delay to avoid rate limits on public RPC
    for (let idx = 0; idx < batch.length; idx++) {
      const sig = batch[idx];
      try {
        // Add 150ms delay between calls to stay under rate limits
        if (idx > 0) await new Promise(r => setTimeout(r, 150));

        const tx = await rpcCall("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta || tx.meta.err) continue;

        const blockTimeMs = sig.blockTime * 1000;
        const platform = classifyTransaction(tx);
        const tokenChange = extractTokenChange(tx, sig.signature);
        const isLP = isLPOperation(tx);
        const txType = classifyTxType(tokenChange, isLP);

        platformCounts[platform] = (platformCounts[platform] || 0) + 1;

        if (txType === "buy") totalBought += tokenChange;
        else if (txType === "sell") totalSold += Math.abs(tokenChange);
        else if (txType === "add_lp") totalAddedLP += Math.abs(tokenChange);

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
          if (txType === "buy") {
            buckets[bucketKey].buys += 1;
            buckets[bucketKey].buyAmount += tokenChange;
          } else if (txType === "sell") {
            buckets[bucketKey].sells += 1;
            buckets[bucketKey].sellAmount += Math.abs(tokenChange);
          } else if (txType === "add_lp") {
            buckets[bucketKey].addLp += 1;
            buckets[bucketKey].lpAmount += Math.abs(tokenChange);
          }
        }
      } catch (e) {
        failedCount++;
        if (failedCount <= 3) console.log(`TX fetch failed: ${e.message}`);
      }
    }
    console.log(`Processed: ${processedCount}, Failed: ${failedCount}`);

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
      addLp: b.addLp,
      buyAmount: b.buyAmount,
      sellAmount: b.sellAmount,
      lpAmount: b.lpAmount,
    }));

    return new Response(
      JSON.stringify({
        wallet: TRACKED_WALLET,
        range,
        totalTransactions: processedCount,
        totalBought,
        totalSold,
        totalAddedLP,
        platforms,
        activityData,
        recentTransactions: recentTxs.slice(0, 15),
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
