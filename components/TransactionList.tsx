import React, { useState } from 'react';
import { Transaction, TransactionType, TRANSLATIONS, Language, convertAmount, getLocalizedCategory } from '../types';
import { 
  Trash2, Coffee, Home, Bus, Zap, ShoppingBag, Stethoscope, GraduationCap, 
  DollarSign, TrendingUp, Gift, Briefcase, HelpCircle, Plane, Shield, 
  RefreshCw, Smile, Heart, Landmark, Percent, Award, Building2, RotateCcw, CreditCard, Tag, Pencil,
  AlertTriangle, PiggyBank, Coins, Banknote, Gem, BarChart3, Lock, ArrowDownLeft, Wallet
} from 'lucide-react';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currency: string;
  language: Language;
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

const getTypeStyles = (type: TransactionType, amount: number, excludeFromBalance?: boolean) => {
  switch (type) {
    case TransactionType.INCOME:
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        sign: '+'
      };
    case TransactionType.SAVINGS:
      if (amount < 0) {
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          sign: '+' 
        };
      }
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        sign: excludeFromBalance ? '' : '-' 
      };
    case TransactionType.EXPENSE:
    default:
      return {
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-600 dark:text-rose-400',
        sign: '-'
      };
  }
};

export const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit, currency, language, soundEnabled }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const t = TRANSLATIONS[language].list;
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const formatConvertedAmount = (amount: number, fromCurrency: string) => {
    const converted = convertAmount(Math.abs(amount), fromCurrency || 'USD', currency);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      if (soundEnabled) playSound('delete');
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
    if (soundEnabled) playSound('click');
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/30 dark:border-white/10 text-center flex flex-col items-center justify-center min-h-[300px] transition-colors animate-fadeIn">
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-3 animate-float">
          <ShoppingBag size={32} className="text-slate-300 dark:text-slate-500" />
        </div>
        <h3 className="text-slate-800 dark:text-white font-medium mb-1">{t.emptyTitle}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.emptyDesc}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-white/10 overflow-hidden transition-all hover:shadow-xl animate-scaleIn duration-500">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/30">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{t.title}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
          {transactions.map((t, index) => {
             const styles = getTypeStyles(t.type, t.amount, t.excludeFromBalance);
             return (
              <div 
                key={t.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.text} transform transition-transform group-hover:scale-110`}>
                    {getCategoryIcon(t.category)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {getLocalizedCategory(t.category, language)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.note || t.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span 
                    onClick={() => safeCopy(Math.abs(t.amount).toString())}
                    className={`font-semibold mr-1 cursor-pointer active:opacity-70 ${styles.text}`}
                    title="Copy amount"
                  >
                    {t.type === TransactionType.SAVINGS && t.excludeFromBalance ? '' : styles.sign}
                    {formatConvertedAmount(t.amount, t.currency)}
                  </span>
                  
                  <div className="flex gap-1">
                    <button 
                        onClick={() => onEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors active:scale-90"
                        aria-label="Edit transaction"
                    >
                        <Pencil size={16} />
                    </button>

                    <button 
                        onClick={() => handleDeleteRequest(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors active:scale-90"
                        aria-label="Delete transaction"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteId(null)} />
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm relative z-20 p-6 animate-scaleIn duration-200 border border-white/20 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 animate-pulseSoft">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {t.deleteTitle}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                {t.deleteConfirm}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-rose-600 hover:bg-rose-700 transition-all shadow-sm shadow-rose-200 dark:shadow-none active:scale-95"
                >
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};