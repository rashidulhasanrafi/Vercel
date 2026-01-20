import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Fix: Always use the standard import for GoogleGenAI as per guidelines
import { GoogleGenAI } from "@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // Fix: Initialize the Gemini AI client using process.env.API_KEY directly, solving the 'Deno' reference error
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Use generateContent with the appropriate model name and direct prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Fix: Extract text directly from the response.text property (not a method)
    const reply = response.text || "No response generated.";

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
