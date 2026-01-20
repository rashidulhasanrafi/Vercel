import React, { useState } from 'react';
import { Transaction, DashboardStats, TRANSLATIONS, Language } from '../types';
import { generateFinancialTip } from '../services/geminiService';
import { Sparkles, Loader2, Lightbulb, Send } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  stats: DashboardStats;
  language: Language;
  currency: string;
}

export const AISuggestion: React.FC<Props> = ({ transactions, stats, language, currency }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  
  const t = TRANSLATIONS[language].ai;

  const handleGetInsight = async () => {
    setLoading(true);
    try {
      const result = await generateFinancialTip(transactions, stats, language, currency, question);
      setTip(result);
    } catch (e) {
      setTip(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleGetInsight();
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mt-6 relative overflow-hidden transition-colors z-[10]">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-200 dark:bg-indigo-600 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">{t.title}</h3>
      </div>

      <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4 relative z-10">
        {t.desc}
      </p>

      {/* Input Area */}
      <div className="relative z-10 mb-4">
        <input 
          type="text" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder:text-indigo-400 dark:placeholder:text-indigo-300/50 shadow-sm"
        />
      </div>

      {tip && (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4 animate-in fade-in slide-in-from-bottom-2 relative z-10">
          <div className="flex gap-3">
             <div className="mt-0.5 min-w-fit">
               <Lightbulb size={18} className="text-yellow-500" />
             </div>
             <p className="text-indigo-900 dark:text-indigo-100 text-sm leading-relaxed font-medium">
               "{tip}"
             </p>
          </div>
        </div>
      )}

      <button
        onClick={handleGetInsight}
        disabled={loading}
        className="relative z-10 w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t.analyzing}
          </>
        ) : (
          <>
            {question ? <Send size={16} /> : <Sparkles size={16} />}
            {question ? t.askBtn : t.btn}
          </>
        )}
      </button>
    </div>
  );
};