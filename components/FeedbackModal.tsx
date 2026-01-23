
import React, { useState } from 'react';
import { X, Send, Star, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { TRANSLATIONS, Language } from '../types';
import { playSound } from '../utils/sound';
import { supabase } from '../utils/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, language, soundEnabled }) => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language].feedback;
  const tCommon = TRANSLATIONS[language].common;

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const handleClose = () => {
    playClick();
    onClose();
    // Reset state after closure (optional delay)
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setRating(null);
      setError(null);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    playClick();

    try {
      const { error: insertError } = await supabase
        .from('feedback')
        .insert([{ message, rating }]);

      if (insertError) throw insertError;

      setSubmitted(true);
      if (soundEnabled) playSound('income');
    } catch (err: any) {
      console.error('Feedback Error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />
      
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h3>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.success}</h4>
              <button 
                onClick={handleClose}
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.desc}</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">{t.rating}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => { playClick(); setRating(star); }}
                      className={`p-2 rounded-lg transition-all ${
                        rating && rating >= star 
                        ? 'text-amber-500 scale-110' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                      }`}
                    >
                      <Star size={32} fill={rating && rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{language === 'bn' ? 'আপনার বার্তা' : 'Your Message'}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {loading ? t.loading : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
