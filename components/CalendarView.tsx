import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Language, convertAmount, getLocalizedCategory } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, ArrowUpCircle, ArrowDownCircle, PiggyBank } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  currency: string;
  language: Language;
}

export const CalendarView: React.FC<Props> = ({ transactions, currency, language }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  // Helper to format currency (compact version for grid)
  const formatCompact = (amount: number) => {
    if (amount === 0) return '';
    const abs = Math.abs(amount);
    if (abs >= 1000000) return (abs / 1000000).toFixed(1) + 'M';
    if (abs >= 1000) return (abs / 1000).toFixed(1) + 'k';
    return abs.toString();
  };

  // Helper to format currency (full version for modal)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // 1. Prepare Data: Aggregate transactions by date
  const dailyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number; savings: number }> = {};

    transactions.forEach(t => {
      // t.date is YYYY-MM-DD
      const dateKey = t.date; 
      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, savings: 0 };
      }

      const convertedAmount = convertAmount(t.amount, t.currency || 'USD', currency);

      if (t.type === TransactionType.INCOME) {
        map[dateKey].income += convertedAmount;
      } else if (t.type === TransactionType.EXPENSE) {
        map[dateKey].expense += convertedAmount;
      } else if (t.type === TransactionType.SAVINGS) {
        map[dateKey].savings += convertedAmount;
      }
    });

    return map;
  }, [transactions, currency]);

  // 2. Calendar Logic
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = language === 'bn' 
    ? ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = language === 'bn'
    ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate grid cells
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];

  // Get transactions for the selected date
  const selectedTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter(t => t.date === selectedDate);
  }, [selectedDate, transactions]);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full min-h-[400px] flex flex-col transition-colors animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
            {monthNames[month]} <span className="text-slate-400 font-normal">{year}</span>
          </h3>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-slate-600 dark:text-slate-300">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-slate-600 dark:text-slate-300">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
          {totalSlots.map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="p-1" />;

            // Format Date Key: YYYY-MM-DD (ensure padding)
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const data = dailyData[dateKey];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div 
                key={dateKey} 
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  min-h-[60px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer active:scale-95
                  ${isToday 
                    ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                    : 'bg-slate-50/30 dark:bg-slate-700/20 border-transparent hover:border-indigo-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
                  }
                `}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {day}
                </span>

                <div className="flex flex-col gap-0.5 mt-1">
                  {data?.income > 0 && (
                    <div className="flex items-center justify-between text-[9px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded-sm">
                      <span>+</span>
                      <span>{formatCompact(data.income)}</span>
                    </div>
                  )}
                  {data?.expense > 0 && (
                    <div className="flex items-center justify-between text-[9px] text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-900/20 px-1 rounded-sm">
                      <span>-</span>
                      <span>{formatCompact(data.expense)}</span>
                    </div>
                  )}
                  {data?.savings > 0 && (
                    <div className="flex items-center justify-between text-[9px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-1 rounded-sm">
                      <span>=</span>
                      <span>{formatCompact(data.savings)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">
                            {new Date(selectedDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {language === 'bn' ? 'লেনদেনের ইতিহাস' : 'Transaction History'}
                        </p>
                    </div>
                    <button onClick={() => setSelectedDate(null)} className="p-2 bg-white dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content - List */}
                <div className="p-4 overflow-y-auto space-y-3">
                    {selectedTransactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-2">
                                <CalendarIcon size={24} className="opacity-50" />
                            </div>
                            <p>{language === 'bn' ? 'এই তারিখে কোনো লেনদেন নেই' : 'No transactions for this date'}</p>
                        </div>
                    ) : (
                        selectedTransactions.map(t => {
                            const convertedAmount = convertAmount(t.amount, t.currency || 'USD', currency);
                            let Icon = ArrowDownCircle;
                            let colorClass = 'text-rose-600 dark:text-rose-400';
                            let bgClass = 'bg-rose-50 dark:bg-rose-900/20';
                            let sign = '-';

                            if (t.type === TransactionType.INCOME) {
                                Icon = ArrowUpCircle;
                                colorClass = 'text-emerald-600 dark:text-emerald-400';
                                bgClass = 'bg-emerald-50 dark:bg-emerald-900/20';
                                sign = '+';
                            } else if (t.type === TransactionType.SAVINGS) {
                                Icon = PiggyBank;
                                colorClass = 'text-blue-600 dark:text-blue-400';
                                bgClass = 'bg-blue-50 dark:bg-blue-900/20';
                                sign = '=';
                            }

                            return (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${bgClass} ${colorClass}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                                {getLocalizedCategory(t.category, language)}
                                            </p>
                                            {t.note && <p className="text-xs text-slate-500 dark:text-slate-400">{t.note}</p>}
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${colorClass}`}>
                                        {sign} {formatCurrency(convertedAmount)}
                                    </span>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};