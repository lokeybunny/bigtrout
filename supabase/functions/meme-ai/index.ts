import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image, prompt } = await req.json();

    const HF_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!HF_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not configured");
    }

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing image or prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Build multipart form data for HF inference
    const boundary = "----HFBoundary" + Date.now();
    const editPrompt = `${prompt}. Keep the original subject (a fish) clearly visible. Make it fun and meme-worthy.`;

    // For instruct-pix2pix, we send as JSON with base64
    const payload = JSON.stringify({
      inputs: {
        image: image,
        prompt: editPrompt,
      },
      parameters: {
        image_guidance_scale: 1.5,
        guidance_scale: 7.5,
        num_inference_steps: 20,
      },
    });

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);

      if (response.status === 503) {
        // Model is loading
        let estimatedTime = 30;
        try {
          const parsed = JSON.parse(errorText);
          estimatedTime = Math.ceil(parsed.estimated_time || 30);
        } catch {}
        return new Response(
          JSON.stringify({
            error: `Model is loading, please try again in ~${estimatedTime} seconds`,
            loading: true,
            estimatedTime,
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`HuggingFace API error [${response.status}]: ${errorText}`);
    }

    // Response is raw image bytes
    const imageBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );
    const resultDataUrl = `data:image/png;base64,${resultBase64}`;

    return new Response(
      JSON.stringify({ image: resultDataUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("meme-ai error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
