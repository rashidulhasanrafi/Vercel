
import { Transaction, DashboardStats, Language } from "../types";

export const generateFinancialTip = async (
  transactions: Transaction[], 
  stats: DashboardStats,
  language: Language,
  currency: string,
  userQuestion?: string
): Promise<string> => {
  return "AI features are currently disabled.";
};
