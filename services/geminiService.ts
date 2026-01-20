import { GoogleGenAI } from "@google/genai";
import { Transaction, DashboardStats, Language, TransactionType } from "../types";

export const generateFinancialTip = async (
  transactions: Transaction[], 
  stats: DashboardStats,
  language: Language,
  currency: string,
  userQuestion?: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Process transactions for context
    // 1. Recent transactions (last 5)
    const recent = transactions.slice(0, 5).map(t => 
      `- ${t.date}: ${t.type} of ${t.amount} ${currency} for ${t.category} (${t.note || 'no note'})`
    ).join('\n');

    // 2. Top Expense Categories
    const expenseMap = new Map<string, number>();
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
    });
    const topExpenses = Array.from(expenseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amount]) => `- ${cat}: ${amount} ${currency}`)
      .join('\n');

    const prompt = `
You are a helpful and encouraging financial assistant for a personal finance app.

User Financial Summary:
- Total Income: ${stats.totalIncome} ${currency}
- Total Expense: ${stats.totalExpense} ${currency}
- Total Savings: ${stats.totalSavings} ${currency}
- Current Balance: ${stats.balance} ${currency}

Recent Transactions:
${recent || "None"}

Top Expense Categories:
${topExpenses || "None"}

${userQuestion ? `User Question: "${userQuestion}"\nAnswer the user's question specifically using the provided financial data.` : `Provide ONE short, practical, and specific financial tip based on the user's spending habits and status.`}

Response Guidelines:
- Tone: Friendly, motivating, and concise.
- Language: ${language === 'bn' ? 'Bengali (Bangla)' : 'English'}
- Use 1-2 emojis.
- Keep it under 50 words.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || (language === 'bn' ? "পরামর্শ পাওয়া যায়নি।" : "No tip available.");

  } catch (error) {
    console.error("Error generating financial tip:", error);
    return language === 'bn' 
      ? "AI টিপ লোড করতে পারিনি। পরে চেষ্টা করুন! 😊" 
      : "Could not load AI tip right now. Please try again later! 😊";
  }
};