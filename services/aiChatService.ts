import { supabase } from '../utils/supabase';

/**
 * Calls the custom Supabase Edge Function for Gemini AI using the Supabase client.
 * This handles authentication and CORS automatically.
 */
export const callGeminiAI = async (userInput: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { prompt: userInput },
    });

    if (error) {
      console.error('Supabase Function Error:', error);
      throw new Error(error.message || 'Failed to communicate with AI');
    }

    // Extract the "reply" value from the JSON response
    if (data && typeof data.reply === 'string') {
      return data.reply;
    }
    
    return "The AI assistant didn't return a valid response.";
  } catch (error: any) {
    console.error('AI Chat Service Error:', error);
    throw error;
  }
};
