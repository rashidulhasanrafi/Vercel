import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2, Calculator as CalculatorIcon } from 'lucide-react';
import { TRANSLATIONS, Language } from '../types';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
}

export const CalculatorModal: React.FC<Props> = ({ isOpen, onClose, language, soundEnabled }) => {
  const [display, setDisplay] = useState('0');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[language].calculator;

  // Reset calculator when opening
  useEffect(() => {
    if (isOpen) {
      setDisplay('0');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const handleNumber = (num: string) => {
    playClick();
    if (display === '0' || display === t.error) {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    playClick();
    const lastChar = display.slice(-1);
    const operators = ['+', '-', '*', '/', '.'];
    
    // Prevent double operators
    if (operators.includes(lastChar)) {
        setDisplay(display.slice(0, -1) + op);
        return;
    }
    
    // Don't start with operator unless it's minus (sometimes)
    // For simplicity, just append if not error
    if (display !== t.error) {
       setDisplay(display + op);
    }
  };

  const calculate = () => {
    if (soundEnabled) playSound('income'); // Success sound for result
    try {
      // Safe evaluation using Function instead of direct eval
      // Regex explicitly escapes hyphen to avoid range interpretation issues
      const sanitized = display.replace(/[^0-9+\-/*.]/g, '');
      if (!sanitized) return;
      
      const result = new Function('return ' + sanitized)();
      
      // Handle division by zero or invalid results
      if (!isFinite(result) || isNaN(result)) {
        setDisplay(t.error);
      } else {
        // Limit decimals to prevent overflow
        const formatted = String(Math.round(result * 100) / 100);
        setDisplay(formatted);
      }
    } catch (e) {
      setDisplay(t.error);
    }
  };

  const handleClear = () => {
    if (soundEnabled) playSound('delete');
    setDisplay('0');
  };

  const handleBackspace = () => {
    playClick();
    if (display.length > 1 && display !== t.error) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCopy = async () => {
    if (display === t.error) return;
    
    await safeCopy(display);
    if (soundEnabled) playSound('income');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Buttons configuration
  const btns = [
    { label: 'C', action: handleClear, type: 'action' },
    { label: '÷', action: () => handleOperator('/'), type: 'op' },
    { label: '×', action: () => handleOperator('*'), type: 'op' },
    { label: '⌫', action: handleBackspace, type: 'action' },
    { label: '7', action: () => handleNumber('7'), type: 'num' },
    { label: '8', action: () => handleNumber('8'), type: 'num' },
    { label: '9', action: () => handleNumber('9'), type: 'num' },
    { label: '-', action: () => handleOperator('-'), type: 'op' },
    { label: '4', action: () => handleNumber('4'), type: 'num' },
    { label: '5', action: () => handleNumber('5'), type: 'num' },
    { label: '6', action: () => handleNumber('6'), type: 'num' },
    { label: '+', action: () => handleOperator('+'), type: 'op' },
    { label: '1', action: () => handleNumber('1'), type: 'num' },
    { label: '2', action: () => handleNumber('2'), type: 'num' },
    { label: '3', action: () => handleNumber('3'), type: 'num' },
    { label: '=', action: calculate, type: 'equal', rowSpan: 2 },
    { label: '0', action: () => handleNumber('0'), type: 'num', colSpan: 2 },
    { label: '.', action: () => handleOperator('.'), type: 'num' },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
            <CalculatorIcon size={20} />
            <span>{t.title}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Display */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 text-right">
           <div className="text-4xl font-bold text-slate-800 dark:text-white tracking-wider font-mono h-12 overflow-hidden truncate">
             {display}
           </div>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-3 bg-white dark:bg-slate-800">
          {btns.map((btn, i) => (
             <button
               key={i}
               onClick={btn.action}
               className={`
                 ${btn.colSpan === 2 ? 'col-span-2' : ''}
                 ${btn.rowSpan === 2 ? 'row-span-2 h-full' : 'h-14'}
                 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center shadow-sm
                 ${btn.type === 'num' ? 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600' : ''}
                 ${btn.type === 'op' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : ''}
                 ${btn.type === 'action' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50' : ''}
                 ${btn.type === 'equal' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' : ''}
               `}
             >
               {btn.label}
             </button>
          ))}
        </div>

        {/* Copy Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-200 dark:shadow-none active:scale-95"
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>

      </div>
    </div>
  );
};