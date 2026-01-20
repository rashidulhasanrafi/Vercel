import React from 'react';
import { DashboardStats as StatsType, TRANSLATIONS, Language } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react';

interface Props {
  stats: StatsType;
  currency: string;
  language: Language;
}

export const DashboardStats: React.FC<Props> = ({ stats, currency, language }) => {
  const t = TRANSLATIONS[language].dashboard;
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const cards = [
    {
      label: t.balance,
      value: stats.balance,
      colorClass: stats.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400',
      icon: <Wallet size={24} />,
      bgIcon: 'bg-slate-50 dark:bg-slate-700',
      textIcon: 'text-slate-600 dark:text-slate-300',
      delay: '0ms'
    },
    {
      label: t.income,
      value: stats.totalIncome,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      icon: <ArrowUpCircle size={24} />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-900/30',
      textIcon: 'text-emerald-600 dark:text-emerald-400',
      delay: '100ms'
    },
    {
      label: t.expense,
      value: stats.totalExpense,
      colorClass: 'text-rose-600 dark:text-rose-400',
      icon: <ArrowDownCircle size={24} />,
      bgIcon: 'bg-rose-50 dark:bg-rose-900/30',
      textIcon: 'text-rose-600 dark:text-rose-400',
      delay: '200ms'
    },
    {
      label: t.savings,
      value: stats.totalSavings,
      colorClass: 'text-blue-600 dark:text-blue-400',
      icon: <PiggyBank size={24} />,
      bgIcon: 'bg-blue-50 dark:bg-blue-900/30',
      textIcon: 'text-blue-600 dark:text-blue-400',
      delay: '300ms'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slideUp"
          style={{ animationDelay: card.delay, opacity: 0 }} // opacity 0 initially to let animation handle fade in
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
            <h2 className={`text-xl font-bold ${card.colorClass}`}>
              {formatCurrency(card.value)}
            </h2>
          </div>
          <div className={`p-3 rounded-full ${card.bgIcon} ${card.textIcon} transition-transform duration-300 group-hover:scale-110`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};