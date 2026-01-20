import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, TRANSLATIONS, Language, getLocalizedCategory, convertAmount } from '../types';
import { 
  PlusCircle, Save, XCircle, Clipboard, CheckCircle2, Circle, AlertTriangle, ChevronDown,
  Coffee, Home, Bus, Zap, ShoppingBag, Stethoscope, GraduationCap, DollarSign, 
  TrendingUp, Gift, Briefcase, HelpCircle, Plane, Shield, RefreshCw, Smile, Heart, Landmark, 
  Percent, Award, Building2, RotateCcw, CreditCard, Tag, PiggyBank, Coins, Banknote, Gem, 
  BarChart3, Lock, ArrowDownLeft, Wallet
} from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  onAddTransaction: (amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => void;
  onUpdateTransaction: (id: string, amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  currencySymbol: string;
  currencyCode: string;
  language: Language;
  incomeCategories: string[];
  expenseCategories: string[];
  savingsCategories: string[];
  soundEnabled: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food & Dining': return <Coffee size={18} />;
    case 'Rent & Housing': return <Home size={18} />;
    case 'Transportation': return <Bus size={18} />;
    case 'Utilities': return <Zap size={18} />;
    case 'Shopping': return <ShoppingBag size={18} />;
    case 'Healthcare': return <Stethoscope size={18} />;
    case 'Education': return <GraduationCap size={18} />;
    case 'Travel': return <Plane size={18} />;
    case 'Insurance': return <Shield size={18} />;
    case 'Subscriptions': return <RefreshCw size={18} />;
    case 'Personal Care': return <Smile size={18} />;
    case 'Gifts & Donations': return <Heart size={18} />;
    case 'Taxes': return <Landmark size={18} />;
    case 'Debt Payments': return <CreditCard size={18} />;
    
    case 'Salary': return <DollarSign size={18} />;
    case 'Investments': return <TrendingUp size={18} />;
    case 'Gifts': return <Gift size={18} />;
    case 'Freelance': return <Briefcase size={18} />;
    case 'Dividends': return <Percent size={18} />;
    case 'Royalties': return <Award size={18} />;
    case 'Grants': return <Landmark size={18} />;
    case 'Rental Income': return <Building2 size={18} />;
    case 'Refunds': return <RotateCcw size={18} />;
    case 'Other Income': return <HelpCircle size={18} />;

    case 'Emergency Fund': return <Shield size={18} />;
    case 'Bank Deposit': return <Landmark size={18} />;
    case 'DPS': return <Lock size={18} />;
    case 'Investments': return <BarChart3 size={18} />;
    case 'Gold': return <Gem size={18} />;
    case 'Stocks': return <TrendingUp size={18} />;
    case 'Cash Savings': return <Banknote size={18} />;
    case 'Crypto': return <Coins size={18} />;
    case 'Retirement': return <Home size={18} />;
    case 'Goal Saving': return <PiggyBank size={18} />;
    case 'General Savings': return <Wallet size={18} />;
    case 'Savings Withdrawal': return <ArrowDownLeft size={18} />;
    case 'Fixed Deposit': return <Lock size={18} />;
    
    default: return <Tag size={18} />;
  }
};

export const TransactionForm: React.FC<Props> = ({ 
  onAddTransaction,
  onUpdateTransaction,
  editingTransaction,
  onCancelEdit,
  currencySymbol, 
  currencyCode,
  language,
  incomeCategories,
  expenseCategories,
  savingsCategories,
  soundEnabled
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  
  const amountInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language].form;
  const tCommon = TRANSLATIONS[language].common;

  const formatNumber = (value: string) => {
    const raw = value.replace(/[^0-9.]/g, '');
    if (!raw) return '';
    const parts = raw.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedInteger + decimalPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^[0-9,]*\.?[0-9]*$/.test(val)) {
          setAmount(formatNumber(val));
      }
  };

  const getCategories = (currentType: TransactionType) => {
    switch(currentType) {
      case TransactionType.INCOME: return incomeCategories;
      case TransactionType.SAVINGS: return savingsCategories;
      case TransactionType.EXPENSE: 
      default: return expenseCategories;
    }
  };

  useEffect(() => {
    if (editingTransaction) {
      // If the transaction has a different currency than the current global one, convert it for editing
      let amt = editingTransaction.amount;
      if (editingTransaction.currency && editingTransaction.currency !== currencyCode) {
          amt = convertAmount(editingTransaction.amount, editingTransaction.currency, currencyCode);
      }
      
      setAmount(formatNumber(amt.toString()));
      setCategory(editingTransaction.category);
      setNote(editingTransaction.note);
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setDeductFromBalance(!editingTransaction.excludeFromBalance);
    } else {
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setDeductFromBalance(true);
      const categories = getCategories(type);
      if (categories.length > 0) {
        setCategory(categories[0]);
      }
    }
  }, [editingTransaction, expenseCategories, incomeCategories, savingsCategories]);

  useEffect(() => {
    if (!editingTransaction) {
        const categories = getCategories(type);
        if (categories.length > 0 && !categories.includes(category)) {
          setCategory(categories[0]);
        }
    }
  }, [type, expenseCategories, incomeCategories, savingsCategories, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
        setShowUpdateConfirm(true);
        if (soundEnabled) playSound('click');
    } else {
        processSubmit();
    }
  };

  const processSubmit = () => {
    const rawAmount = amount.replace(/,/g, '');
    const parsedAmount = parseFloat(rawAmount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert(t.alertAmount);
      return;
    }
    
    if (!category) {
      alert(t.alertCategory);
      return;
    }

    const excludeFromBalance = type === TransactionType.SAVINGS ? !deductFromBalance : false;

    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, parsedAmount, category, note, type, date, excludeFromBalance);
      setShowUpdateConfirm(false);
    } else {
      onAddTransaction(parsedAmount, category, note, type, date, excludeFromBalance);
    }

    if (soundEnabled) {
      playSound(type === TransactionType.INCOME ? 'income' : 'expense');
    }
    
    if (!editingTransaction) {
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setDeductFromBalance(true);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (soundEnabled) playSound('click');
    const newCategories = getCategories(newType);
    if (newCategories.length > 0) {
      setCategory(newCategories[0]);
    } else {
      setCategory('');
    }
  };

  const handlePaste = async () => {
    if (soundEnabled) playSound('click');
    if (!navigator.clipboard) {
        alert(language === 'bn' ? 'ক্লিপবোর্ড অ্যাক্সেস সম্ভব নয়।' : 'Clipboard API not supported.');
        amountInputRef.current?.focus();
        return;
    }

    try {
      const text = await navigator.clipboard.readText();
      const numeric = text.replace(/[^0-9.]/g, '');
      if (numeric && !isNaN(parseFloat(numeric))) {
        setAmount(formatNumber(numeric));
      } else {
        amountInputRef.current?.focus();
      }
    } catch (err) {
      console.error('Failed to paste:', err);
      amountInputRef.current?.focus();
    }
  };

  const getButtonColor = () => {
    if (editingTransaction) return 'bg-indigo-600 hover:bg-indigo-700';
    switch (type) {
        case TransactionType.INCOME: return 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500';
        case TransactionType.SAVINGS: return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500';
        case TransactionType.EXPENSE: return 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500';
        default: return 'bg-indigo-600';
    }
  };

  // Theme colors for Category Dropdown
  const getThemeColors = (tType: TransactionType) => {
    switch (tType) {
        case TransactionType.INCOME:
            return {
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                border: 'border-emerald-100 dark:border-emerald-900/30',
                iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                iconText: 'text-emerald-600 dark:text-emerald-400',
            };
        case TransactionType.SAVINGS:
            return {
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                border: 'border-blue-100 dark:border-blue-900/30',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                iconText: 'text-blue-600 dark:text-blue-400',
            };
        case TransactionType.EXPENSE:
        default:
            return {
                bg: 'bg-rose-50 dark:bg-rose-900/10',
                border: 'border-rose-100 dark:border-rose-900/30',
                iconBg: 'bg-rose-100 dark:bg-rose-900/30',
                iconText: 'text-rose-600 dark:text-rose-400',
            };
    }
  };

  const theme = getThemeColors(type);

  return (
    <>
      <div className={`bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border ${editingTransaction ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/30 dark:border-white/10'} p-6 rounded-2xl shadow-lg h-fit transition-all duration-300 animate-slideUp relative z-[40]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {editingTransaction ? t.editTitle : t.title}
          </h3>
          {editingTransaction && (
            <button onClick={onCancelEdit} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <XCircle size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100/50 dark:bg-slate-700/50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.INCOME)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all active:scale-95 ${
                type === TransactionType.INCOME 
                  ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t.income}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.EXPENSE)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all active:scale-95 ${
                type === TransactionType.EXPENSE 
                  ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.SAVINGS)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all active:scale-95 ${
                type === TransactionType.SAVINGS 
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t.savings}
            </button>
          </div>

          {type === TransactionType.SAVINGS && (
            <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 transition-all animate-scaleIn origin-top">
               <div 
                 className="flex items-center gap-3 cursor-pointer"
                 onClick={() => setDeductFromBalance(!deductFromBalance)}
               >
                  <div className={`transition-all duration-300 ${deductFromBalance ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400'}`}>
                     {deductFromBalance ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div>
                     <p className="text-sm font-medium text-slate-800 dark:text-white">{t.deductFromBalance}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       {deductFromBalance ? t.deductDesc : t.noDeductDesc}
                     </p>
                  </div>
               </div>
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">{t.amount} ({currencySymbol})</label>
            <div className="flex gap-2">
              <input
                ref={amountInputRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder={t.placeholderAmount}
                className="flex-1 p-2.5 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                required
              />
              <button
                type="button"
                onClick={handlePaste}
                className="p-2.5 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                title="Paste amount"
              >
                <Clipboard size={20} />
              </button>
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">{t.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all text-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="group relative">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">{t.category}</label>
            
            <button 
                type="button"
                onClick={() => { if(soundEnabled) playSound('click'); setShowCategoryDropdown(!showCategoryDropdown); }}
                className={`w-full p-2.5 text-left border rounded-lg flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.bg} ${theme.border} dark:text-white`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme.iconBg} ${theme.iconText}`}>
                        {getCategoryIcon(category)}
                    </div>
                    <span className="text-slate-800 dark:text-slate-100 font-medium">
                        {getLocalizedCategory(category, language)}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCategoryDropdown && (
                <>
                    <div className="fixed inset-0 z-[45]" onClick={() => setShowCategoryDropdown(false)} />
                    <div className="absolute z-[50] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-[250px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {getCategories(type).map(cat => (
                            <div 
                                key={cat}
                                onClick={() => { 
                                    setCategory(cat); 
                                    setShowCategoryDropdown(false); 
                                    if(soundEnabled) playSound('click'); 
                                }}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                    cat === category ? theme.bg : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.iconBg} ${theme.iconText}`}>
                                    {getCategoryIcon(cat)}
                                </div>
                                <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                                    {getLocalizedCategory(cat, language)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
          </div>

          <div className="group">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">{t.note}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.placeholderNote}
              className="w-full p-2.5 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex gap-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 py-3 px-4 rounded-lg text-slate-600 dark:text-slate-300 font-medium bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                {t.cancelBtn}
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none ${getButtonColor()}`}
            >
              {editingTransaction ? <Save size={18} /> : <PlusCircle size={18} />}
              {editingTransaction ? t.updateBtn : t.addBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Update */}
      {showUpdateConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUpdateConfirm(false)} />
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Save size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Update Transaction?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to save changes to this transaction?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowUpdateConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button
                  onClick={processSubmit}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {tCommon.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};