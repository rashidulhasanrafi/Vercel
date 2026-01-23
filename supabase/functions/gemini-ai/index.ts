import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Always use the correct import from @google/genai as per guidelines
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

    // Initialize the Gemini AI client using process.env.API_KEY directly as per GenAI guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

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
    console.error('Edge Function Error:', error.message);
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