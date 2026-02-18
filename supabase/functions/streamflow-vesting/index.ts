import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOKEN_MINT = "EKwF2HD6X4rHHr4322EJeK9QBGkqhpHZQSanSUmWkecG";
const STREAMFLOW_DASHBOARD_URL = `https://app.streamflow.finance/token-dashboard/solana/mainnet/${TOKEN_MINT}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching Streamflow dashboard data for token:", TOKEN_MINT);

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalLocked: 0,
            totalUnlocked: 0,
            lockedPercent: 0,
            circulatingPercent: 100,
            contractCount: 0,
            lastUpdated: new Date().toISOString(),
            source: "no-api-key"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Scraping Streamflow dashboard:", STREAMFLOW_DASHBOARD_URL);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: STREAMFLOW_DASHBOARD_URL,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error("Firecrawl API error:", scrapeResponse.status, errorText);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalLocked: 0,
            totalUnlocked: 0,
            lockedPercent: 0,
            circulatingPercent: 100,
            contractCount: 0,
            lastUpdated: new Date().toISOString(),
            source: "scrape-error"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    console.log("Scrape successful, parsing data...");
    
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    console.log("Markdown content:", markdown);

    // Parse specific patterns from Streamflow dashboard
    let totalLocked = 0;
    let totalUnlocked = 0;
    let lockedPercent = 0;
    let circulatingPercent = 0;
    let contractCount = 0;

    // Parse "Total BigTrout Locked" - look for pattern like "48.853M" or "48,853,000"
    const lockedMatch = markdown.match(/Total\s+(?:\w+\s+)?Locked\s*\n*\s*([0-9,.]+)\s*([KMBT])?/i);
    if (lockedMatch) {
      const num = parseFloat(lockedMatch[1].replace(/,/g, ''));
      const multiplier = getMultiplier(lockedMatch[2]);
      totalLocked = num * multiplier;
      console.log("Parsed totalLocked:", totalLocked, "from:", lockedMatch[0]);
    }

    // Parse "Total BigTrout Unlocked"
    const unlockedMatch = markdown.match(/Total\s+(?:\w+\s+)?Unlocked\s*\n*\s*([0-9,.]+)\s*([KMBT])?/i);
    if (unlockedMatch) {
      const num = parseFloat(unlockedMatch[1].replace(/,/g, ''));
      const multiplier = getMultiplier(unlockedMatch[2]);
      totalUnlocked = num * multiplier;
      console.log("Parsed totalUnlocked:", totalUnlocked, "from:", unlockedMatch[0]);
    }

    // Parse locked percentage - "Locked (4.89%)"
    const lockedPercentMatch = markdown.match(/Locked\s*\(([0-9.]+)%\)/i);
    if (lockedPercentMatch) {
      lockedPercent = parseFloat(lockedPercentMatch[1]);
      console.log("Parsed lockedPercent:", lockedPercent);
    }

    // Parse circulating/unlocked percentage - "Circulation (95.11%)" or "Unlocked (95.11%)"
    const circPercentMatch = markdown.match(/(?:Circulation|Unlocked)\s*\(([0-9.]+)%\)/i);
    if (circPercentMatch) {
      circulatingPercent = parseFloat(circPercentMatch[1]);
      console.log("Parsed circulatingPercent:", circulatingPercent);
    }

    // Parse contract count - "Total\n\n4"
    const contractMatch = markdown.match(/Contracts\s*\n*\s*Total\s*\n*\s*(\d+)/i);
    if (contractMatch) {
      contractCount = parseInt(contractMatch[1], 10);
      console.log("Parsed contractCount:", contractCount);
    }

    // Also look for token locks percentage and amount
    const tokenLocksMatch = markdown.match(/Token\s+locks\s*\n*\s*([0-9.]+)%\s*\n*\s*([0-9,.]+)\s*([KMBT])?\s*tokens/i);
    if (tokenLocksMatch) {
      lockedPercent = parseFloat(tokenLocksMatch[1]);
      const num = parseFloat(tokenLocksMatch[2].replace(/,/g, ''));
      const multiplier = getMultiplier(tokenLocksMatch[3]);
      if (totalLocked === 0) {
        totalLocked = num * multiplier;
      }
      console.log("Parsed from token locks:", { lockedPercent, totalLocked });
    }

    // Calculate unlocked if we have locked percentage
    if (totalLocked > 0 && lockedPercent > 0 && totalUnlocked === 0) {
      const totalSupply = 1_000_000_000;
      circulatingPercent = 100 - lockedPercent;
      totalUnlocked = totalSupply - totalLocked;
    }

    console.log("Final parsed data:", { totalLocked, totalUnlocked, lockedPercent, circulatingPercent, contractCount });

    // If all values are zero (e.g. dashboard under maintenance), use known fallback values
    const allZero = totalLocked === 0 && totalUnlocked === 0 && lockedPercent === 0 && contractCount === 0;
    if (allZero) {
      console.log("All values zero — returning fallback data (dashboard likely under maintenance)");
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalLocked: 48_853_000,
            totalUnlocked: 951_147_000,
            lockedPercent: 4.89,
            circulatingPercent: 95.11,
            contractCount: 4,
            lastUpdated: new Date().toISOString(),
            source: "fallback"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalLocked,
          totalUnlocked,
          lockedPercent,
          circulatingPercent,
          contractCount,
          lastUpdated: new Date().toISOString(),
          source: "streamflow-dashboard"
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          lockedPercent: 0,
          circulatingPercent: 100,
          contractCount: 0,
          lastUpdated: new Date().toISOString(),
          source: "error"
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getMultiplier(suffix: string | undefined): number {
  if (!suffix) return 1;
  const multipliers: Record<string, number> = {
    'k': 1_000,
    'K': 1_000,
    'm': 1_000_000,
    'M': 1_000_000,
    'b': 1_000_000_000,
    'B': 1_000_000_000,
    't': 1_000_000_000_000,
    'T': 1_000_000_000_000,
  };
  return multipliers[suffix] || 1;
}
