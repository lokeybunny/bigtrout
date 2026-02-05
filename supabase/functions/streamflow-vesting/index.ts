import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STREAMFLOW_API = "https://api.streamflow.finance/v2";
const TOKEN_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching Streamflow vesting data for token:", TOKEN_MINT);

    // Fetch all streams for this token on Solana
    const response = await fetch(
      `${STREAMFLOW_API}/streams/solana?token=${TOKEN_MINT}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Streamflow API error:", response.status, errorText);
      
      // Return mock/fallback data if API fails
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalLocked: 0,
            totalUnlocked: 0,
            totalVested: 0,
            streams: [],
            lastUpdated: new Date().toISOString(),
            source: "fallback"
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const streams = await response.json();
    console.log("Received streams:", JSON.stringify(streams).slice(0, 500));

    // Process streams to calculate locked/unlocked amounts
    let totalLocked = 0;
    let totalUnlocked = 0;
    let totalVested = 0;
    const now = Date.now() / 1000; // Current time in seconds

    const processedStreams = [];

    // Handle both array and object responses
    const streamList = Array.isArray(streams) ? streams : (streams.data || []);

    for (const stream of streamList) {
      const depositedAmount = Number(stream.depositedAmount || stream.ix?.depositedAmount || 0);
      const withdrawnAmount = Number(stream.withdrawnAmount || 0);
      const start = Number(stream.start || stream.ix?.start || 0);
      const end = Number(stream.end || stream.ix?.end || 0);
      const cliff = Number(stream.cliff || stream.ix?.cliff || 0);
      const cliffAmount = Number(stream.cliffAmount || stream.ix?.cliffAmount || 0);
      const period = Number(stream.period || stream.ix?.period || 1);
      const amountPerPeriod = Number(stream.amountPerPeriod || stream.ix?.amountPerPeriod || 0);

      // Calculate vested amount based on schedule
      let vestedAmount = 0;
      
      if (now >= end) {
        // Fully vested
        vestedAmount = depositedAmount;
      } else if (now >= cliff && cliff > 0) {
        // Past cliff, calculate linear vesting
        vestedAmount = cliffAmount;
        if (now > cliff && period > 0) {
          const periodsElapsed = Math.floor((now - cliff) / period);
          vestedAmount += periodsElapsed * amountPerPeriod;
        }
        vestedAmount = Math.min(vestedAmount, depositedAmount);
      } else if (now >= start && cliff === 0) {
        // No cliff, linear vesting from start
        if (period > 0) {
          const periodsElapsed = Math.floor((now - start) / period);
          vestedAmount = periodsElapsed * amountPerPeriod;
        }
        vestedAmount = Math.min(vestedAmount, depositedAmount);
      }

      const unlockedAmount = vestedAmount;
      const lockedAmount = depositedAmount - vestedAmount;

      totalLocked += lockedAmount;
      totalUnlocked += unlockedAmount;
      totalVested += vestedAmount;

      processedStreams.push({
        id: stream.id || stream.publicKey,
        recipient: stream.recipient || stream.ix?.recipient,
        depositedAmount,
        withdrawnAmount,
        vestedAmount,
        lockedAmount,
        unlockedAmount,
        start,
        end,
        cliff,
        status: stream.status || (now >= end ? 'completed' : 'active'),
      });
    }

    // Convert from smallest unit (assuming 9 decimals for SOL-based tokens)
    const decimals = 9;
    const divisor = Math.pow(10, decimals);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalLocked: totalLocked / divisor,
          totalUnlocked: totalUnlocked / divisor,
          totalVested: totalVested / divisor,
          streams: processedStreams.map(s => ({
            ...s,
            depositedAmount: s.depositedAmount / divisor,
            withdrawnAmount: s.withdrawnAmount / divisor,
            vestedAmount: s.vestedAmount / divisor,
            lockedAmount: s.lockedAmount / divisor,
            unlockedAmount: s.unlockedAmount / divisor,
          })),
          streamCount: processedStreams.length,
          lastUpdated: new Date().toISOString(),
          source: "streamflow"
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error fetching vesting data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: {
          totalLocked: 0,
          totalUnlocked: 0,
          totalVested: 0,
          streams: [],
          lastUpdated: new Date().toISOString(),
          source: "error"
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
