export const callGeminiAI = async (userInput: string): Promise<string> => {
  try {
    const response = await fetch('https://xyxfyqmmxbmdtxzvmcyl.supabase.co/functions/v1/gemini-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userInput }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to communicate with AI');
    }

    const data = await response.json();
    
    // The requirement is to take the value of "reply"
    if (data && typeof data.reply === 'string') {
      return data.reply;
    }
    
    return "No response received from the assistant.";
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    throw error;
  }
};
