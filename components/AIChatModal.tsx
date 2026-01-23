import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Loader2, Bot } from 'lucide-react';
import { TRANSLATIONS, Language, Transaction, DashboardStats, TransactionType } from '../types';
import { callGeminiAI } from '../services/aiChatService';
import { playSound } from '../utils/sound';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  transactions: Transaction[];
  stats: DashboardStats;
  currency: string;
}

export const AIChatModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  language, 
  soundEnabled,
  transactions,
  stats,
  currency
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[language].ai;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: t.chatWelcome,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, t.chatWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // 1. Add user message locally
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    
    setLoading(true);
    if (soundEnabled) playSound('click');

    try {
      // 2. Call the custom REST API with the prompt
      const reply = await callGeminiAI(userText);
      
      // 3. Add AI response locally from the 'reply' field
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      if (soundEnabled) playSound('income');
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Unable to get a response. (${err.message || 'Network error'})`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] relative z-10 flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{t.chatTitle}</h3>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Cloud AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-600'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex max-w-[85%] gap-2">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-600">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};