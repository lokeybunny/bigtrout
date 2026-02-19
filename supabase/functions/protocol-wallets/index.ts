import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BIGTROUT_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

const PROTOCOL_WALLETS = {
  autoLP: {
    address: "5tEJqt89SqJGGycow9vJezKfDfnRUUKU9DFAS9J9YiMT",
    label: "Automatic LP Function",
  },
  buybackBurn: {
    address: "9zTWFwMGaTJWRjTupmD8kG7jKXCKYzQdmFziVbFn8mme",
    label: "Automatic Buyback/Burn",
  },
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

async function getTokenBalance(walletAddress: string): Promise<number> {
  try {
    const result = await rpcCall("getTokenAccountsByOwner", [
      walletAddress,
      { mint: BIGTROUT_MINT },
      { encoding: "jsonParsed" },
    ]);

    if (!result?.value?.length) return 0;

    let total = 0;
    for (const account of result.value) {
      const amount = account.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      total += amount;
    }
    return total;
  } catch (e) {
    console.error(`Error fetching balance for ${walletAddress}:`, e.message);
    return 0;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const [autoLPBalance, buybackBurnBalance] = await Promise.all([
      getTokenBalance(PROTOCOL_WALLETS.autoLP.address),
      getTokenBalance(PROTOCOL_WALLETS.buybackBurn.address),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          autoLP: {
            address: PROTOCOL_WALLETS.autoLP.address,
            label: PROTOCOL_WALLETS.autoLP.label,
            balance: autoLPBalance,
          },
          buybackBurn: {
            address: PROTOCOL_WALLETS.buybackBurn.address,
            label: PROTOCOL_WALLETS.buybackBurn.label,
            balance: buybackBurnBalance,
          },
          lastUpdated: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Protocol wallets error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
