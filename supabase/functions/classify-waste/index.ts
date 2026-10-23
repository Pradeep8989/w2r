// Supabase Edge Function: classify-waste
// Secure server-side wrapper for Google Gemini Vision API
// The GEMINI_API_KEY is stored server-side using Supabase Secrets:
// Command to set secret: supabase secrets set GEMINI_API_KEY=your_key_here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a specialized waste classification assistant for Waste2Resource circular recovery technology.

Strict scope: Classify ONLY the supported waste categories:
PAPER:
- newspaper
- office paper
- corrugated cardboard
- paperboard

PLASTIC:
- PET
- HDPE
- other plastic

Do not invent a material if it cannot be determined.
If the image is unclear, blurry, or cannot be confidently classified, return a low confidence score (e.g. 0.40 - 0.65).
Do not claim that the image provides exact weight.

Analyze visible contamination such as:
- food residue
- oil/grease
- mud
- liquid
- mixed materials
- heavy dirt

Assign contamination level: "low", "medium", or "high".

Return JSON ONLY (no markdown fences, no explanatory text outside JSON):
{
  "category": "paper" or "plastic",
  "material": "newspaper" | "office paper" | "corrugated cardboard" | "paperboard" | "PET" | "HDPE" | "other plastic",
  "confidence": 0.94,
  "contamination": "low" | "medium" | "high",
  "recyclable": true,
  "recommended_route": "PET recycling",
  "reason": "Clear explanation of visible features supporting this classification."
}`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase Edge Function secrets.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const { image, mimeType = "image/jpeg" } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing image base64 data in request body." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Call Gemini 1.5 Flash Vision API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${errorText}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: geminiResponse.status,
        }
      );
    }

    const result = await geminiResponse.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const structuredAnalysis = JSON.parse(rawText);

    return new Response(JSON.stringify(structuredAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
