import React, { useState } from 'react';
import { Goal, TRANSLATIONS, Language } from '../types';
import { X, Target, Plus, Trash2, Coins, Trophy, Wallet, Pencil } from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Goals Props
  goals: Goal[];
  onAddGoal: (name: string, targetAmount: number) => void;
  onUpdateGoal: (id: string, name: string, targetAmount: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddFundsToGoal: (goalId: string, amount: number, source: 'balance') => void;
  // Shared Props
  language: Language;
  currency: string;
  soundEnabled: boolean;
}

export const FundsDashboard: React.FC<Props> = ({
  isOpen,
  onClose,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddFundsToGoal,
  language,
  currency,
  soundEnabled
}) => {
  // Goals State
  const [goalView, setGoalView] = useState<'list' | 'create' | 'edit' | 'deposit'>('list');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const t = TRANSLATIONS[language].funds;
  const tCommon = TRANSLATIONS[language].common;

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  // Formatting helper
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- GOAL HANDLERS ---
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (newGoalName && target > 0) {
      onAddGoal(newGoalName, target);
      setNewGoalName('');
      setNewGoalTarget('');
      setGoalView('list');
      if (soundEnabled) playSound('income');
    }
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (selectedGoalId && newGoalName && target > 0) {
      onUpdateGoal(selectedGoalId, newGoalName, target);
      setNewGoalName('');
      setNewGoalTarget('');
      setSelectedGoalId(null);
      setGoalView('list');
      if (soundEnabled) playSound('click');
    }
  };

  const handleDepositGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount.replace(/,/g, ''));
    
    if (selectedGoalId && amount > 0) {
      onAddFundsToGoal(selectedGoalId, amount, 'balance');
      setDepositAmount('');
      setSelectedGoalId(null);
      setGoalView('list');
      if (soundEnabled) playSound('income');
    }
  };

  const openEditGoal = (goal: Goal) => {
    playClick();
    setSelectedGoalId(goal.id);
    setNewGoalName(goal.name);
    setNewGoalTarget(formatNumber(goal.targetAmount.toString()));
    setGoalView('edit');
  };

  const openDepositGoal = (goalId: string) => {
    playClick();
    setSelectedGoalId(goalId);
    setGoalView('deposit');
  };

  const deleteGoal = (id: string) => {
    if (confirm(t.deleteGoalConfirm)) {
      onDeleteGoal(id);
      if (soundEnabled) playSound('delete');
    }
  };

  const getPercentage = (saved: number, target: number) => {
    return Math.min(100, Math.round((saved / target) * 100));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 transition-colors overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Target size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h3>
          </div>
          <button onClick={() => { playClick(); onClose(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          
          {goalView === 'list' && (
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600">
                    <Target size={32} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{t.emptyGoals}</p>
                </div>
              ) : (
                goals.map(goal => {
                  const percent = getPercentage(goal.savedAmount, goal.targetAmount);
                  const isCompleted = percent >= 100;
                  
                  return (
                    <div key={goal.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden">
                      {isCompleted && (
                        <div className="absolute top-0 right-0 p-2 text-yellow-500 opacity-20 rotate-12">
                            <Trophy size={64} />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{goal.name}</h4>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                             {t.saved}: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.savedAmount)}</span> 
                             <span className="mx-1">/</span> 
                             {t.target}: {formatCurrency(goal.targetAmount)}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                            <button 
                                onClick={() => openEditGoal(goal)}
                                className="text-slate-400 hover:text-indigo-500 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => deleteGoal(goal.id)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3 relative z-10">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center relative z-10">
                        <span className={`text-xs font-bold ${isCompleted ? 'text-yellow-600 dark:text-yellow-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {isCompleted ? 'Completed!' : `${percent}%`}
                        </span>
                        
                        <button
                          onClick={() => openDepositGoal(goal.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          <Plus size={14} />
                          {t.addMoney}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              <button
                onClick={() => { playClick(); setGoalView('create'); }}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {t.addGoal}
              </button>
            </div>
          )}

          {/* Create OR Edit Goal Form */}
          {(goalView === 'create' || goalView === 'edit') && (
            <form onSubmit={goalView === 'create' ? handleCreateGoal : handleUpdateGoal} className="space-y-4 animate-in slide-in-from-right-8 duration-200">
              <h4 className="font-bold text-slate-800 dark:text-white text-lg text-center mb-2">
                  {goalView === 'create' ? t.addGoal : t.editGoal}
              </h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.goalName}</label>
                <input 
                  type="text" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. New Laptop"
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.target} ({currency})</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={newGoalTarget}
                  onChange={(e) => handleAmountChange(e, setNewGoalTarget)}
                  placeholder="0.00"
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { playClick(); setGoalView('list'); setSelectedGoalId(null); setNewGoalName(''); setNewGoalTarget(''); }}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-medium bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {goalView === 'create' ? t.create : t.update}
                </button>
              </div>
            </form>
          )}

          {goalView === 'deposit' && (
             <form onSubmit={handleDepositGoal} className="space-y-4 animate-in slide-in-from-right-8 duration-200">
               <div className="text-center mb-4">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                   <Coins size={24} />
                 </div>
                 <h4 className="font-bold text-slate-800 dark:text-white text-lg">{t.deposit}</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   {goals.find(g => g.id === selectedGoalId)?.name}
                 </p>
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.addMoney} ({currency})</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={depositAmount}
                  onChange={(e) => handleAmountChange(e, setDepositAmount)}
                  placeholder="0.00"
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white text-lg font-semibold text-center"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { playClick(); setGoalView('list'); setSelectedGoalId(null); }}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-medium bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  {t.deposit}
                </button>
              </div>
             </form>
          )}

        </div>
      </div>
    </div>
  );
};