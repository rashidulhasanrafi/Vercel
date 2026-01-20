
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, DashboardStats, CURRENCIES, Language, convertAmount, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_CATEGORIES, TRANSLATIONS, Goal, Profile } from '../types';
import { DashboardStats as StatsComponent } from './DashboardStats';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ExpenseChart } from './ExpenseChart';
import { CalendarView } from './CalendarView';
import { AISuggestion } from './AISuggestion';
import { CategorySettings } from './CategorySettings';
import { ShareModal } from './ShareModal';
import { CalculatorModal } from './CalculatorModal';
import { GoalModal } from './GoalModal';
import { ProfileManager } from './ProfileManager';
import { NotebookPen, Check, X, UserCircle, Calendar, PieChart } from 'lucide-react';
import { playSound } from '../utils/sound';
import { supabase } from '../utils/supabase';

interface Props {
  userId: string; 
  profileName: string;
  userEmail?: string;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

const CurrencyIcon = () => (
  <div className="relative w-12 h-7 flex-shrink-0">
    <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center border border-white dark:border-slate-800 shadow-sm z-10 transform -rotate-3">
      <span className="text-yellow-300 font-bold text-[10px]">€</span>
    </div>
    <div className="absolute right-0 top-0.5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center border border-white dark:border-slate-800 shadow-sm z-10 transform rotate-3">
      <span className="text-white font-bold text-[10px] mt-0.5">৳</span>
    </div>
    <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md z-20">
      <span className="text-white font-bold text-xs">$</span>
    </div>
  </div>
);

const CustomWalletIcon = () => (
  <div className="w-10 h-10 relative drop-shadow-sm hover:scale-110 transition-transform">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
       <path d="M8 14L14 8H36L30 14H8Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round"/>
       <path d="M14 14L20 6H40L34 14H14Z" fill="#FACC15" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round"/>
       <rect x="4" y="14" width="40" height="26" rx="5" fill="#F97316" stroke="#0F172A" strokeWidth="3"/>
       <path d="M9 19H19" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round"/>
       <path d="M30 14V22C30 24.2091 31.7909 26 34 26H44" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round"/>
       <path d="M30 14H44V22C44 24.2091 42.2091 26 40 26H34C31.7909 26 30 24.2091 30 22V14Z" fill="#C2410C"/>
       <circle cx="37" cy="20" r="2.5" fill="#FDBA74" stroke="#0F172A" strokeWidth="2"/>
    </svg>
  </div>
);

const CustomProfileIcon = () => (
    <div className="w-10 h-10 relative drop-shadow-sm hover:scale-110 transition-transform">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="24" cy="24" r="22" fill="url(#pgrad)" stroke="#1D4ED8" strokeWidth="1"/>
            <defs>
                <linearGradient id="pgrad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/>
                    <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
            </defs>
            <ellipse cx="24" cy="12" rx="12" ry="6" fill="white" fillOpacity="0.25"/>
            <g filter="url(#dropShadow)">
                <circle cx="24" cy="19" r="8" fill="white"/>
                <path d="M10 40C10 32 16 28 24 28C32 28 38 32 38 40V44H10V40Z" fill="white"/>
            </g>
            <defs>
                <filter id="dropShadow" x="10" y="11" width="28" height="34" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                   <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1"/>
                </filter>
            </defs>
        </svg>
    </div>
);

const CustomCalculatorIcon = () => (
  <div className="w-10 h-10 relative drop-shadow-sm hover:scale-110 transition-transform">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="36" height="40" rx="6" fill="#DBEAFE" stroke="#1E293B" strokeWidth="3"/>
      <rect x="11" y="9" width="26" height="8" rx="2" fill="#FACC15" stroke="#1E293B" strokeWidth="2"/>
      <rect x="11" y="21" width="7" height="6" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="20.5" y="21" width="7" height="6" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="30" y="21" width="7" height="6" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="11" y="29" width="7" height="6" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="20.5" y="29" width="7" height="6" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="30" y="29" width="7" height="13" rx="2" fill="#EF4444" stroke="#1E293B" strokeWidth="2"/>
      <rect x="11" y="37" width="7" height="5" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
      <rect x="20.5" y="37" width="7" height="5" rx="2" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
    </svg>
  </div>
);

const CustomSettingsIcon = () => (
  <div className="w-10 h-10 relative drop-shadow-sm hover:scale-110 transition-transform">
     <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
           <linearGradient id="gearMetal" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#94A3B8" />
           </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="20" fill="url(#gearMetal)" stroke="#64748B" strokeWidth="2" />
        <path d="M24 6V10M24 38V42M6 24H10M38 24H42M11.3 11.3L14.1 14.1M33.9 33.9L36.7 36.7M11.3 36.7L14.1 33.9M33.9 14.1L36.7 11.3" 
              stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="24" cy="24" r="14" fill="#F1F5F9" stroke="#64748B" strokeWidth="2" />
        <circle cx="24" cy="24" r="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
     </svg>
  </div>
);

const CustomCategoryIcon = () => (
  <div className="w-10 h-10 relative drop-shadow-sm hover:scale-110 transition-transform">
     <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="6" width="16" height="16" rx="4" stroke="#3B82F6" strokeWidth="3" fill="none"/>
        <line x1="10" y1="11" x2="18" y2="11" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="10" y1="17" x2="18" y2="17" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
        <rect x="26" y="6" width="16" height="16" rx="4" stroke="#3B82F6" strokeWidth="3" fill="none"/>
        <rect x="30" y="10" width="8" height="8" rx="1" fill="#93C5FD"/>
        <rect x="6" y="26" width="16" height="16" rx="4" stroke="#A855F7" strokeWidth="3" fill="none"/>
        <circle cx="14" cy="34" r="4" fill="#C084FC"/>
        <rect x="26" y="26" width="16" height="16" rx="4" stroke="#A855F7" strokeWidth="3" fill="none"/>
        <rect x="29" y="30" width="10" height="6" rx="1" stroke="#C084FC" strokeWidth="2"/>
     </svg>
  </div>
);

export const Tracker: React.FC<Props> = ({ 
  userId, 
  profileName, 
  userEmail,
  onLogout,
  language,
  onLanguageChange,
  darkMode,
  toggleDarkMode,
  soundEnabled,
  toggleSound,
  onClearAllData,
  onExportData,
  onImportData
}) => {
  const isGuest = userId === 'guest';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [showProfileManager, setShowProfileManager] = useState(false);

  useEffect(() => {
    const savedProfiles = localStorage.getItem(`zenfinance_profiles_${userId}`);
    const savedActiveId = localStorage.getItem(`zenfinance_active_profile_${userId}`);
    
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      const defaultProfile = { id: 'default', name: isGuest ? 'Guest' : 'Main' };
      setProfiles([defaultProfile]);
      localStorage.setItem(`zenfinance_profiles_${userId}`, JSON.stringify([defaultProfile]));
    }
    if (savedActiveId) {
      setActiveProfileId(savedActiveId);
    }
  }, [userId, isGuest]);

  const STORAGE_KEY = `zenfinance_transactions_${userId}_${activeProfileId}`; 
  const CURRENCY_STORAGE_KEY = `zenfinance_currency_${userId}_${activeProfileId}`;
  const INCOME_CAT_STORAGE_KEY = `zenfinance_income_categories_${userId}_${activeProfileId}`;
  const EXPENSE_CAT_STORAGE_KEY = `zenfinance_expense_categories_${userId}_${activeProfileId}`;
  const SAVINGS_CAT_STORAGE_KEY = `zenfinance_savings_categories_${userId}_${activeProfileId}`;
  const GOALS_STORAGE_KEY = `zenfinance_goals_${userId}_${activeProfileId}`;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalIncome: 0, totalExpense: 0, totalSavings: 0, balance: 0 });
  const [currency, setCurrency] = useState('BDT');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [savingsCategories, setSavingsCategories] = useState<string[]>(DEFAULT_SAVINGS_CATEGORIES);
  
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'categories'>('general');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      if (isGuest) {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            setTransactions(JSON.parse(localData));
        } else {
            setTransactions([]);
        }
      } else {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        if (data) {
            const mappedTransactions: Transaction[] = data
            .map((t: any) => ({
                id: t.id,
                amount: t.amount,
                category: t.category,
                note: t.note,
                date: t.date,
                type: t.type,
                currency: t.currency,
                excludeFromBalance: t.exclude_from_balance
            }));
            setTransactions(mappedTransactions);
        }
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) || 'BDT';
    setCurrency(savedCurrency);
    const savedIncomeCats = localStorage.getItem(INCOME_CAT_STORAGE_KEY);
    const savedExpenseCats = localStorage.getItem(EXPENSE_CAT_STORAGE_KEY);
    const savedSavingsCats = localStorage.getItem(SAVINGS_CAT_STORAGE_KEY);
    setIncomeCategories(savedIncomeCats ? JSON.parse(savedIncomeCats) : DEFAULT_INCOME_CATEGORIES);
    setExpenseCategories(savedExpenseCats ? JSON.parse(savedExpenseCats) : DEFAULT_EXPENSE_CATEGORIES);
    setSavingsCategories(savedSavingsCats ? JSON.parse(savedSavingsCats) : DEFAULT_SAVINGS_CATEGORIES);
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      try { setGoals(JSON.parse(savedGoals)); } catch (e) { setGoals([]); }
    } else { setGoals([]); }
    setEditingTransaction(null);
    fetchTransactions();
  }, [userId, activeProfileId]); 

  const handleAddProfile = (name: string) => {
    const newProfile = { id: crypto.randomUUID(), name };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem(`zenfinance_profiles_${userId}`, JSON.stringify(updated));
    setActiveProfileId(newProfile.id);
    localStorage.setItem(`zenfinance_active_profile_${userId}`, newProfile.id);
  };

  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem(`zenfinance_active_profile_${userId}`, id);
  };

  const handleEditProfile = (id: string, newName: string) => {
    const updated = profiles.map(p => p.id === id ? { ...p, name: newName } : p);
    setProfiles(updated);
    localStorage.setItem(`zenfinance_profiles_${userId}`, JSON.stringify(updated));
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem(`zenfinance_profiles_${userId}`, JSON.stringify(updated));
    if (activeProfileId === id) {
      const newActive = updated[0].id;
      setActiveProfileId(newActive);
      localStorage.setItem(`zenfinance_active_profile_${userId}`, newActive);
    }
  };

  useEffect(() => {
    if (isGuest) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
    const totalSavings = transactions
      .filter(t => t.type === TransactionType.SAVINGS)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
    const deductedSavings = transactions
      .filter(t => t.type === TransactionType.SAVINGS && !t.excludeFromBalance)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalSavings: totalSavings,
      balance: income - expense - deductedSavings
    });
  }, [transactions, currency, isGuest, STORAGE_KEY]);

  useEffect(() => { localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals)); }, [goals, GOALS_STORAGE_KEY]);
  useEffect(() => { localStorage.setItem(INCOME_CAT_STORAGE_KEY, JSON.stringify(incomeCategories)); }, [incomeCategories, INCOME_CAT_STORAGE_KEY]);
  useEffect(() => { localStorage.setItem(EXPENSE_CAT_STORAGE_KEY, JSON.stringify(expenseCategories)); }, [expenseCategories, EXPENSE_CAT_STORAGE_KEY]);
  useEffect(() => { localStorage.setItem(SAVINGS_CAT_STORAGE_KEY, JSON.stringify(savingsCategories)); }, [savingsCategories, SAVINGS_CAT_STORAGE_KEY]);

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) { setShowCurrencyModal(false); return; }
    const updatedGoals = goals.map(g => ({
      ...g,
      currency: newCurrency,
      targetAmount: convertAmount(g.targetAmount, g.currency, newCurrency),
      savedAmount: convertAmount(g.savedAmount, g.currency, newCurrency)
    }));
    setGoals(updatedGoals);
    setCurrency(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    if (soundEnabled) playSound('click');
    setShowCurrencyModal(false);
  };

  const addTransaction = async (amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => {
    if (!isGuest) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { alert("Please login to save data"); return; }
    }
    const newTransaction = {
      id: crypto.randomUUID(),
      user_id: isGuest ? 'guest' : userId,
      amount,
      category,
      note: note || '', 
      type,
      currency: currency,
      date: date,
      exclude_from_balance: type === TransactionType.SAVINGS ? !!excludeFromBalance : false
    };
    const optimisticTrans: Transaction = { ...newTransaction, excludeFromBalance: newTransaction.exclude_from_balance };
    setTransactions(prev => [optimisticTrans, ...prev]);
    if (!isGuest) {
        const { error } = await supabase.from('transactions').insert([newTransaction]);
        if (error) {
            setTransactions(prev => prev.filter(t => t.id !== newTransaction.id));
            alert(`Error inserting transaction: ${error.message}`);
        }
    }
  };

  const updateTransaction = async (id: string, amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => {
    const updates = { amount, category, note: note || '', type, date, currency, exclude_from_balance: type === TransactionType.SAVINGS ? !!excludeFromBalance : false };
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates, excludeFromBalance: updates.exclude_from_balance } : t ));
    setEditingTransaction(null);
    if (!isGuest) {
        const { error } = await supabase.from('transactions').update(updates).eq('id', id).eq('user_id', userId);
        if (error) { fetchTransactions(); alert(`Failed to update transaction: ${error.message}`); }
    }
  };

  const deleteTransaction = async (id: string) => {
    const backup = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (editingTransaction?.id === id) setEditingTransaction(null);
    if (!isGuest) {
        const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
        if (error) { setTransactions(backup); alert(`Failed to delete transaction: ${error.message}`); }
    }
  };

  const handleGeneralDeposit = (amount: number) => addTransaction(amount, 'General Savings', 'Deposit to General Savings', TransactionType.SAVINGS, new Date().toISOString().split('T')[0], false);
  const handleGeneralWithdraw = (amount: number) => addTransaction(-amount, 'Savings Withdrawal', 'Withdrawal from General Savings', TransactionType.SAVINGS, new Date().toISOString().split('T')[0], false);
  const handleAddGoal = (name: string, targetAmount: number, category: string, isFixedDeposit?: boolean) => setGoals(prev => [...prev, { id: crypto.randomUUID(), name, targetAmount, savedAmount: 0, currency, category, isFixedDeposit }]);
  const handleUpdateGoal = (id: string, name: string, targetAmount: number, category: string, isFixedDeposit?: boolean) => setGoals(prev => prev.map(g => g.id === id ? { ...g, name, targetAmount, category, isFixedDeposit } : g));
  const handleDeleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const handleAddFundsToGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g));
    const goal = goals.find(g => g.id === goalId);
    if (goal) addTransaction(amount, goal.category || 'Goal Saving', `Deposit to: ${goal.name}`, TransactionType.SAVINGS, new Date().toISOString().split('T')[0], false);
  };
  const handleWithdrawFundsFromGoal = (goalId: string, amount: number) => {
     setGoals(prev => prev.map(g => g.id === goalId ? { ...g, savedAmount: Math.max(0, g.savedAmount - amount) } : g));
     const goal = goals.find(g => g.id === goalId);
     if (goal) addTransaction(-amount, 'Savings Withdrawal', `Withdrawal from: ${goal.name}`, TransactionType.SAVINGS, new Date().toISOString().split('T')[0], false);
  };

  const handleEditTransaction = (transaction: Transaction) => { setEditingTransaction(transaction); if (soundEnabled) playSound('click'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleCancelEdit = () => { setEditingTransaction(null); if (soundEnabled) playSound('click'); };
  const handleToggleSound = () => { toggleSound(); if (!soundEnabled) setTimeout(() => playSound('toggle'), 50); };
  const handleClickSound = () => { if (soundEnabled) playSound('click'); };
  const openCategories = () => { setSettingsInitialTab('categories'); setShowSettings(true); handleClickSound(); };
  const openGeneralSettings = () => { setSettingsInitialTab('general'); setShowSettings(true); handleClickSound(); };
  
  const handleAddCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) setIncomeCategories(prev => [...prev, name]);
    else if (type === TransactionType.SAVINGS) setSavingsCategories(prev => [...prev, name]);
    else setExpenseCategories(prev => [...prev, name]);
  };
  const handleRemoveCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) setIncomeCategories(prev => prev.filter(c => c !== name));
    else if (type === TransactionType.SAVINGS) setSavingsCategories(prev => prev.filter(c => c !== name));
    else setExpenseCategories(prev => prev.filter(c => c !== name));
  };

  const currentCurrencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const tSettings = TRANSLATIONS[language].settings;
  const activeProfileName = profiles.find(p => p.id === activeProfileId)?.name || 'Main';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-600/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px] dark:bg-emerald-600/10" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-violet-400/20 blur-[120px] dark:bg-violet-600/10" />
      </div>
      <div className="relative z-10 flex flex-col flex-grow">
        <CategorySettings 
          isOpen={showSettings} onClose={() => setShowSettings(false)} initialTab={settingsInitialTab}
          incomeCategories={incomeCategories} expenseCategories={expenseCategories} savingsCategories={savingsCategories}
          onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
          language={language} onLanguageChange={(lang) => { handleClickSound(); onLanguageChange(lang); }}
          darkMode={darkMode} toggleDarkMode={() => { handleClickSound(); toggleDarkMode(); }}
          soundEnabled={soundEnabled} toggleSound={handleToggleSound}
          onClearAllData={onClearAllData} onExportData={onExportData} onImportData={onImportData}
          onOpenShare={() => { setShowSettings(false); setShowShareModal(true); }}
          onLogout={onLogout} isGuest={isGuest} userEmail={userEmail}
        />
        <ProfileManager
          isOpen={showProfileManager} onClose={() => setShowProfileManager(false)}
          profiles={profiles} activeProfileId={activeProfileId}
          onSwitchProfile={handleSwitchProfile} onAddProfile={handleAddProfile}
          onEditProfile={handleEditProfile} onDeleteProfile={handleDeleteProfile}
          language={language} soundEnabled={soundEnabled}
        />
        <ShareModal 
          isOpen={showShareModal} onClose={() => setShowShareModal(false)}
          transactions={transactions} stats={stats} profileName={activeProfileName}
          currency={currency} language={language} soundEnabled={soundEnabled}
        />
        <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} language={language} soundEnabled={soundEnabled} />
        <GoalModal
          isOpen={showGoalModal} onClose={() => setShowGoalModal(false)}
          goals={goals} totalSavings={stats.totalSavings}
          onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal}
          onAddFunds={handleAddFundsToGoal} onWithdrawFunds={handleWithdrawFundsFromGoal}
          onGeneralDeposit={handleGeneralDeposit} onGeneralWithdraw={handleGeneralWithdraw}
          language={language} currency={currency} soundEnabled={soundEnabled}
          savingsCategories={savingsCategories}
        />
        {showCurrencyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCurrencyModal(false)} />
             <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 dark:text-white">{tSettings.selectCurrency}</h3>
                     <button onClick={() => setShowCurrencyModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X size={20} className="text-slate-500" />
                     </button>
                 </div>
                 <div className="p-2 overflow-y-auto max-h-[60vh]">
                     {CURRENCIES.map(c => (
                         <button key={c.code} onClick={() => handleCurrencyChange(c.code)}
                           className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${currency === c.code ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`}
                         >
                             <div className="flex items-center gap-3">
                                 <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm">{c.symbol}</span>
                                 <div className="text-left"><div className="text-sm">{c.code}</div><div className="text-xs opacity-70 font-normal">{c.name}</div></div>
                             </div>
                             {currency === c.code && <Check size={18} />}
                         </button>
                     ))}
                 </div>
             </div>
          </div>
        )}
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/30 dark:border-white/10 sticky top-0 z-50 transition-all duration-300 animate-slideDown shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg shadow-sm animate-bounce"><NotebookPen className="text-white" size={20} /></div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 hidden sm:block">Hisab</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
               <button onClick={() => { handleClickSound(); setShowProfileManager(true); }} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group relative" title={`Profile: ${activeProfileName}`}>
                 <CustomProfileIcon />
                 {activeProfileId !== 'default' && <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full w-3 h-3 border border-white dark:border-slate-800" />}
               </button>
               <button onClick={openCategories} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group" title="Categories"><CustomCategoryIcon /></button>
               <button onClick={() => { handleClickSound(); setShowCurrencyModal(true); }} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group" title="Change Currency"><CurrencyIcon /></button>
               <button onClick={() => { handleClickSound(); setShowGoalModal(true); }} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group" title="Funds & Savings"><CustomWalletIcon /></button>
               <button onClick={() => { handleClickSound(); setShowCalculator(true); }} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group" title="Calculator"><CustomCalculatorIcon /></button>
               <button onClick={openGeneralSettings} className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group" title="Settings"><CustomSettingsIcon /></button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
          <StatsComponent stats={stats} currency={currency} language={language} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
               <TransactionForm 
                  onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction}
                  editingTransaction={editingTransaction} onCancelEdit={handleCancelEdit}
                  currencySymbol={currentCurrencySymbol} currencyCode={currency}
                  language={language} incomeCategories={incomeCategories} expenseCategories={expenseCategories} savingsCategories={savingsCategories}
                  soundEnabled={soundEnabled}
               />
               <AISuggestion transactions={transactions} stats={stats} language={language} currency={currency} />
            </div>
            <div className="lg:col-span-2 space-y-6 animate-slideUp" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-end">
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 inline-flex">
                  <button onClick={() => { setViewMode('chart'); handleClickSound(); }} className={`p-2 rounded-lg transition-all ${viewMode === 'chart' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Pie Chart View"><PieChart size={20} /></button>
                  <button onClick={() => { setViewMode('calendar'); handleClickSound(); }} className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Calendar View"><Calendar size={20} /></button>
                </div>
              </div>
              {viewMode === 'chart' ? (
                <ExpenseChart transactions={transactions} currency={currency} language={language} darkMode={darkMode} />
              ) : (
                <CalendarView transactions={transactions} currency={currency} language={language} />
              )}
              <TransactionList 
                transactions={transactions} onDelete={deleteTransaction} onEdit={handleEditTransaction}
                currency={currency} language={language} soundEnabled={soundEnabled}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
