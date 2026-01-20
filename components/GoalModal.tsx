import React, { useState, useEffect } from 'react';
import { Goal, TRANSLATIONS, Language, getLocalizedCategory } from '../types';
import { X, Target, Plus, Trash2, Coins, Trophy, Pencil, Lock, ArrowDownLeft, AlertTriangle, Wallet, Settings } from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  totalSavings: number; 
  onAddGoal: (name: string, targetAmount: number, category: string, isFixedDeposit?: boolean) => void;
  onUpdateGoal: (id: string, name: string, targetAmount: number, category: string, isFixedDeposit?: boolean) => void;
  onDeleteGoal: (id: string) => void;
  onAddFunds: (goalId: string, amount: number) => void;
  onWithdrawFunds: (goalId: string, amount: number) => void;
  onGeneralDeposit: (amount: number) => void;
  onGeneralWithdraw: (amount: number) => void;
  language: Language;
  currency: string;
  soundEnabled: boolean;
  savingsCategories: string[];
}

const ProgressBar = ({ percent, isCompleted, isFD }: { percent: number; isCompleted: boolean; isFD?: boolean }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent]);

  let colorClass = 'bg-blue-500';
  if (isCompleted) colorClass = 'bg-emerald-500';
  else if (isFD) colorClass = 'bg-amber-500';

  return (
    <div className="h-3 w-full bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden mb-3 relative z-10">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${colorClass}`}
        style={{ width: `${Math.min(100, width)}%` }}
      >
        <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
      </div>
    </div>
  );
};

export const GoalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  goals,
  totalSavings,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddFunds,
  onWithdrawFunds,
  onGeneralDeposit,
  onGeneralWithdraw,
  language,
  currency,
  soundEnabled,
  savingsCategories
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'deposit' | 'withdraw'>('list');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState(savingsCategories[0] || 'Goal Saving');
  const [isFixedDeposit, setIsFixedDeposit] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  // Confirmation States
  const [confirmState, setConfirmState] = useState<{
    type: 'delete' | 'redirectEditFD' | 'update';
    id?: string;
    payload?: any; 
  } | null>(null);

  const t = TRANSLATIONS[language].goals;
  const tCommon = TRANSLATIONS[language].common;
  const allocatedSavings = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const generalSavings = Math.max(0, totalSavings - allocatedSavings);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const formatNumber = (value: string) => {
    const raw = value.replace(/[^0-9.]/g, '');
    if (!raw) return '';
    const parts = raw.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedInteger + decimalPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
      const val = e.target.value;
      if (/^[0-9,]*\.?[0-9]*$/.test(val)) {
          setter(formatNumber(val));
      }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (newGoalName && target > 0) {
      onAddGoal(newGoalName, target, newGoalCategory, isFixedDeposit);
      resetForm();
      if (soundEnabled) playSound('income');
    }
  };

  const handleUpdateGoalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({ type: 'update' });
    if (soundEnabled) playSound('click');
  };

  const confirmUpdate = () => {
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (selectedGoalId && newGoalName && target > 0) {
      onUpdateGoal(selectedGoalId, newGoalName, target, newGoalCategory, isFixedDeposit);
      resetForm();
      setConfirmState(null);
      if (soundEnabled) playSound('click');
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (parsedAmount <= 0) return;

    if (selectedGoalId === 'GENERAL') {
        onGeneralDeposit(parsedAmount);
        if (soundEnabled) playSound('income');
        resetForm();
        return;
    }

    const goal = goals.find(g => g.id === selectedGoalId);
    if (selectedGoalId && goal) {
      onAddFunds(selectedGoalId, parsedAmount);
      const newTotal = goal.savedAmount + parsedAmount;
      if (newTotal >= goal.targetAmount && goal.savedAmount < goal.targetAmount) {
         if (soundEnabled) setTimeout(() => playSound('celebration'), 300);
      } else {
         if (soundEnabled) playSound('income');
      }
      resetForm();
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (parsedAmount <= 0) return;

    if (selectedGoalId === 'GENERAL') {
        if (parsedAmount > generalSavings) {
            alert("Insufficient general savings.");
            return;
        }
        onGeneralWithdraw(parsedAmount);
        if (soundEnabled) playSound('delete');
        resetForm();
        return;
    }

    const goal = goals.find(g => g.id === selectedGoalId);
    if (selectedGoalId && goal) {
      if (parsedAmount > goal.savedAmount) {
        alert("Insufficient funds in this goal.");
        return;
      }
      
      // NEW LOGIC: Check for Fixed Deposit status
      if (goal.isFixedDeposit) {
          setConfirmState({ type: 'redirectEditFD', id: selectedGoalId });
          if (soundEnabled) playSound('click'); // Alert sound
          return;
      }

      onWithdrawFunds(selectedGoalId, parsedAmount);
      resetForm();
      if (soundEnabled) playSound('delete'); 
    }
  };

  const confirmRedirectToEdit = () => {
    if (confirmState?.id) {
       const goal = goals.find(g => g.id === confirmState.id);
       if (goal) {
           // Pre-fill the edit form with the goal's data
           setSelectedGoalId(goal.id);
           setNewGoalName(goal.name);
           setNewGoalTarget(formatNumber(goal.targetAmount.toString()));
           setNewGoalCategory(goal.category || savingsCategories[0] || 'Goal Saving');
           setIsFixedDeposit(true); // Is currently true, user needs to toggle it off
           
           // Close modal and switch view
           setConfirmState(null);
           setView('edit');
           if (soundEnabled) playSound('click');
       }
    }
  };

  const resetForm = () => {
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalCategory(savingsCategories[0] || 'Goal Saving');
      setIsFixedDeposit(false);
      setSelectedGoalId(null);
      setAmount('');
      setView('list');
      setConfirmState(null);
  };

  const openDeposit = (goalId: string) => {
    playClick();
    setSelectedGoalId(goalId);
    setView('deposit');
  };

  const openWithdraw = (goalId: string) => {
    playClick();
    setSelectedGoalId(goalId);
    setView('withdraw');
  };

  const openEdit = (goal: Goal) => {
    playClick();
    setSelectedGoalId(goal.id);
    setNewGoalName(goal.name);
    setNewGoalTarget(formatNumber(goal.targetAmount.toString()));
    setNewGoalCategory(goal.category || savingsCategories[0] || 'Goal Saving');
    setIsFixedDeposit(!!goal.isFixedDeposit);
    setView('edit');
  };

  const handleDeleteRequest = (id: string) => {
    setConfirmState({ type: 'delete', id });
    if (soundEnabled) playSound('click');
  };

  const confirmDelete = () => {
    if (confirmState?.id) {
      onDeleteGoal(confirmState.id);
      setConfirmState(null);
      if (soundEnabled) playSound('delete');
    }
  };

  const getPercentage = (saved: number, target: number) => {
    return Math.min(100, Math.round((saved / target) * 100));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentGoal = selectedGoalId === 'GENERAL' ? { name: language === 'bn' ? 'সাধারণ সঞ্চয়' : 'General Savings', isFixedDeposit: false, savedAmount: generalSavings } : goals.find(g => g.id === selectedGoalId);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 transition-colors border border-white/20 dark:border-white/10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Target size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h3>
          </div>
          <button onClick={() => { playClick(); onClose(); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          
          {view === 'list' && (
            <div className="space-y-4">
              
              {/* General Savings Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-5 shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{language === 'bn' ? 'সাধারণ সঞ্চয়' : 'General Savings'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'bn' ? 'অবরাদ্দকৃত তহবিল' : 'Liquid / Unallocated Funds'}</p>
                    </div>
                 </div>
                 <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
                    {formatCurrency(generalSavings)}
                 </div>
                 <div className="flex gap-2">
                    <button
                        onClick={() => openWithdraw('GENERAL')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-all"
                    >
                        <ArrowDownLeft size={14} />
                        {t.withdrawBtn}
                    </button>
                    <button
                        onClick={() => openDeposit('GENERAL')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                    >
                        <Plus size={14} />
                        {t.addMoney}
                    </button>
                 </div>
              </div>

              {goals.length > 0 && (
                 <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">{language === 'bn' ? 'আপনার লক্ষ্যসমূহ' : 'Your Goals'}</h5>
                 </div>
              )}

              {goals.map(goal => {
                  const percent = getPercentage(goal.savedAmount, goal.targetAmount);
                  const isCompleted = percent >= 100;
                  const isFD = goal.isFixedDeposit;
                  const categoryName = goal.category ? getLocalizedCategory(goal.category, language) : '';
                  
                  return (
                    <div key={goal.id} className="bg-white/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors">
                      {isCompleted && (
                        <div className="absolute top-0 right-0 p-2 text-yellow-500 opacity-20 rotate-12">
                            <Trophy size={64} />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                             <h4 className="font-bold text-slate-800 dark:text-white text-lg">{goal.name}</h4>
                             {isFD && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                    <Lock size={8} /> FD
                                </span>
                             )}
                             {categoryName && !isFD && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300">
                                    {categoryName}
                                </span>
                             )}
                          </div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                             {t.saved}: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.savedAmount)}</span> 
                             <span className="mx-1">/</span> 
                             {t.target}: {formatCurrency(goal.targetAmount)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => openEdit(goal)}
                                className="text-slate-400 hover:text-indigo-500 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteRequest(goal.id)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </div>

                      <ProgressBar percent={percent} isCompleted={isCompleted} isFD={isFD} />
                      
                      <div className="flex justify-between items-center relative z-10">
                        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {isCompleted ? t.completed : `${percent}%`}
                        </span>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => openWithdraw(goal.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                title={t.withdrawBtn}
                            >
                                <ArrowDownLeft size={14} />
                            </button>

                            <button
                                onClick={() => openDeposit(goal.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                                <Plus size={14} />
                                {t.addMoney}
                            </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              <button
                onClick={() => { playClick(); resetForm(); setView('create'); }}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {t.create}
              </button>
            </div>
          )}

          {(view === 'create' || view === 'edit') && (
            <form onSubmit={view === 'create' ? handleCreateGoal : handleUpdateGoalRequest} className="space-y-4 animate-in slide-in-from-right-8 duration-200">
               <h4 className="font-bold text-slate-800 dark:text-white text-lg text-center mb-2">
                  {view === 'create' ? t.create : t.edit}
              </h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.name}</label>
                <input 
                  type="text" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder={t.placeholderName}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  autoFocus
                  required
                />
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
                 <select
                   value={newGoalCategory}
                   onChange={(e) => setNewGoalCategory(e.target.value)}
                   className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white appearance-none"
                 >
                    {savingsCategories.map(cat => (
                        <option key={cat} value={cat}>{getLocalizedCategory(cat, language)}</option>
                    ))}
                 </select>
              </div>

              <div 
                 className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    isFixedDeposit 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                 }`}
                 onClick={() => setIsFixedDeposit(!isFixedDeposit)}
              >
                 <div className={`p-1.5 rounded-full border-2 transition-colors flex items-center justify-center ${isFixedDeposit ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-400'}`}>
                     {isFixedDeposit && <Lock size={12} className="text-white" />}
                 </div>
                 <div className="flex-1">
                     <p className="font-semibold text-sm text-slate-800 dark:text-white flex items-center justify-between">
                        {t.isFixedDeposit}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isFixedDeposit ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-600'}`}>
                            {isFixedDeposit ? 'Active' : 'Off'}
                        </span>
                     </p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{t.fdDesc}</p>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.target} ({currency})</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={newGoalTarget}
                  onChange={(e) => handleAmountChange(e, setNewGoalTarget)}
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { playClick(); resetForm(); }}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-medium bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  {view === 'create' ? tCommon.confirm : t.update}
                </button>
              </div>
            </form>
          )}

          {view === 'deposit' && (
             <form onSubmit={handleDeposit} className="space-y-4 animate-in slide-in-from-right-8 duration-200">
               <div className="text-center mb-6">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                   <Coins size={24} />
                 </div>
                 <h4 className="font-bold text-slate-800 dark:text-white text-lg">{t.depositTitle}</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   {currentGoal?.name}
                 </p>
                 {selectedGoalId === 'GENERAL' && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {language === 'bn' ? 'সাধারণ সঞ্চয়ে জমা দিন' : 'Adding to unallocated savings'}
                    </p>
                 )}
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.addMoney} ({currency})</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e, setAmount)}
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white text-lg font-semibold text-center"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { playClick(); resetForm(); }}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-medium bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  {t.depositBtn}
                </button>
              </div>
             </form>
          )}

          {view === 'withdraw' && (
             <form onSubmit={handleWithdraw} className="space-y-4 animate-in slide-in-from-right-8 duration-200">
               <div className="text-center mb-6">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${currentGoal?.isFixedDeposit ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                   {currentGoal?.isFixedDeposit ? <Lock size={24} /> : <ArrowDownLeft size={24} />}
                 </div>
                 <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                    {t.withdrawTitle}
                 </h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   {currentGoal?.name}
                 </p>
                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {t.saved}: {formatCurrency(currentGoal?.savedAmount || 0)}
                 </p>
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.withdrawBtn} ({currency})</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e, setAmount)}
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none dark:text-white text-lg font-semibold text-center"
                  autoFocus
                  required
                />
                 <p className="text-xs text-center text-slate-500 mt-2">{t.confirmWithdraw}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { playClick(); resetForm(); }}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-medium bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  {t.withdrawBtn}
                </button>
              </div>
             </form>
          )}
        </div>
      </div>

      {/* Reusable Confirmation Modal Overlay */}
      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirmState(null)} />
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm relative z-20 p-6 animate-scaleIn duration-200 border border-white/20 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmState.type === 'redirectEditFD' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                {confirmState.type === 'redirectEditFD' ? <Lock size={24} /> : <AlertTriangle size={24} />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {confirmState.type === 'delete' ? t.deleteConfirm : 
                 confirmState.type === 'redirectEditFD' ? (language === 'bn' ? 'ফিক্সড ডিপোজিট লক' : 'Fund Locked (FD)') : 
                 (language === 'bn' ? 'তহবিল আপডেট?' : 'Update Goal?')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                {confirmState.type === 'delete' ? (language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই লক্ষ্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this goal?') :
                 confirmState.type === 'redirectEditFD' ? (language === 'bn' ? 'টাকা তোলার জন্য আপনাকে সেটিংস থেকে ফিক্সড ডিপোজিট অপশনটি বন্ধ করতে হবে।' : 'You must disable the "Fixed Deposit" option in the settings before you can withdraw funds.') :
                 (language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি আপডেট করতে চান?' : 'Are you sure you want to update this goal?')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  {tCommon.cancel}
                </button>
                <button
                  onClick={
                    confirmState.type === 'delete' ? confirmDelete :
                    confirmState.type === 'redirectEditFD' ? confirmRedirectToEdit :
                    confirmUpdate
                  }
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium transition-all shadow-sm active:scale-95 ${confirmState.type === 'redirectEditFD' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  {confirmState.type === 'redirectEditFD' 
                    ? (language === 'bn' ? 'সেটিংস-এ যান' : 'Go to Settings') 
                    : tCommon.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};