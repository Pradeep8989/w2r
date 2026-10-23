// Supabase Edge Function: analyze-waste
// Secure server-side proxy for Google Gemini Vision API
// The GEMINI_API_KEY is read strictly from Supabase Edge Function Environment Secrets:
// Command to set secret: supabase secrets set GEMINI_API_KEY=your_gemini_api_key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const SYSTEM_INSTRUCTION = `You are a specialized waste classification assistant for Waste2Resource circular recovery technology.

Strict scope: Classify ONLY the supported Waste2Resource categories:
PAPER:
- newspaper
- office paper
- corrugated cardboard
- paperboard

PLASTIC:
- PET
- HDPE
- other plastic

STRICT RULES:
1. Do NOT invent a material if it cannot be determined.
2. If the image is unclear, blurry, or does not contain recognizable paper or plastic waste:
   - set category to "paper" or "plastic" (best estimate or fallback to "plastic")
   - set material to the closest match or "other plastic"
   - return a low confidence score (e.g. 0.20 to 0.65)
   - clearly explain why in the "reason" field (e.g. "Image is too dark or blurry to identify specific polymer grade.")
3. Confidence MUST be a number between 0.0 and 1.0.
4. Analyze visible contamination such as food residue, oil/grease, mud, liquid, mixed materials, or heavy dirt.
   Contamination MUST be one of: "low", "medium", or "high".
5. Set recyclable to true or false based on the material and contamination level.
6. Provide a recommended_route string (e.g. "PET recycling", "cardboard recycling", "paper recycling", "HDPE recycling", "mixed polymer recovery").
7. Explain the visual justification in "reason".
8. Do NOT estimate the exact weight from the image. The user enters weight separately.
9. Do NOT calculate reward points. Business logic handles points separately.

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA ONLY:
{
  "category": "paper | plastic",
  "material": "newspaper | office paper | corrugated cardboard | paperboard | PET | HDPE | other plastic",
  "confidence": 0.0,
  "contamination": "low | medium | high",
  "recyclable": true,
  "recommended_route": "string",
  "reason": "string"
}`;

serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed. Please use POST.` }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 3. Retrieve GEMINI_API_KEY from environment secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase Edge Function secrets. Run `supabase secrets set GEMINI_API_KEY=your_key`.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Support imageBase64 (preferred per specification) or image alias
    const rawImage = body.imageBase64 || body.image;
    let mimeType = (body.mimeType || "image/jpeg").toLowerCase();

    // 5. Validate presence of image
    if (!rawImage || typeof rawImage !== "string" || rawImage.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing imageBase64. Expected { imageBase64: '...', mimeType: 'image/jpeg' }.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported MIME type: '${mimeType}'. Supported types: ${ALLOWED_MIME_TYPES.join(", ")}.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Strip data URL header if present (e.g. data:image/jpeg;base64,...)
    let cleanBase64 = rawImage;
    if (rawImage.includes(";base64,")) {
      const parts = rawImage.split(";base64,");
      cleanBase64 = parts[1] || "";
      const headerMime = parts[0].replace("data:", "").toLowerCase();
      if (ALLOWED_MIME_TYPES.includes(headerMime)) {
        mimeType = headerMime;
      }
    }

    if (cleanBase64.length === 0) {
      return new Response(
        JSON.stringify({ error: "Extracted base64 string is empty." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Call Gemini Vision API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: SYSTEM_INSTRUCTION },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2,
      },
    };

    // 25-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let geminiResponse;
    try {
      geminiResponse = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Gemini Vision API request timed out after 25s." }),
          {
            status: 504,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({ error: `Network error connecting to Gemini API: ${fetchErr.message}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    clearTimeout(timeoutId);

    // 9. Handle non-200 responses from Gemini
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(
        JSON.stringify({
          error: `Gemini API returned status ${geminiResponse.status}: ${errorText}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiResult = await geminiResponse.json();
    const rawContent = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return new Response(
        JSON.stringify({
          error: "Gemini did not return any candidate response content.",
          details: geminiResult,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 10. Parse structured JSON from response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(rawContent);
    } catch {
      // Fallback regex extraction if wrapped with markdown ticks
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({
            error: "Failed to parse structured JSON from Gemini response.",
            raw: rawContent,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 11. Normalize and sanitize output according to bounds
    const validCategories = ["paper", "plastic"];
    const validMaterials = [
      "newspaper",
      "office paper",
      "corrugated cardboard",
      "paperboard",
      "PET",
      "HDPE",
      "other plastic",
    ];
    const validContaminations = ["low", "medium", "high"];

    let category = (parsedAnalysis.category || "plastic").toLowerCase().trim();
    if (!validCategories.includes(category)) {
      category = category.includes("paper") ? "paper" : "plastic";
    }

    let material = parsedAnalysis.material;
    // Map case insensitive match if needed
    const matchedMat = validMaterials.find(
      (m) => m.toLowerCase() === (material || "").toLowerCase().trim()
    );
    material = matchedMat || (category === "paper" ? "corrugated cardboard" : "other plastic");

    const confidence = Math.max(
      0.0,
      Math.min(1.0, typeof parsedAnalysis.confidence === "number" ? parsedAnalysis.confidence : 0.85)
    );

    let contamination = (parsedAnalysis.contamination || "low").toLowerCase().trim();
    if (!validContaminations.includes(contamination)) {
      contamination = "low";
    }

    const recyclable =
      typeof parsedAnalysis.recyclable === "boolean"
        ? parsedAnalysis.recyclable
        : contamination !== "high";

    const recommended_route =
      parsedAnalysis.recommended_route ||
      (category === "paper" ? "Cardboard Recycling" : "PET Recycling");

    const reason =
      parsedAnalysis.reason ||
      "Classified based on visual polymer/fiber texture and geometry.";

    // Final Structured Waste Analysis Response
    const finalResponse = {
      category,
      material,
      confidence: Math.round(confidence * 100) / 100,
      contamination,
      recyclable,
      recommended_route,
      reason,
    };

    return new Response(JSON.stringify(finalResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Internal Edge Function error: ${err.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
