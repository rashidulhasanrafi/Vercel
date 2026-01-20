import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Transaction, TransactionType, TRANSLATIONS, Language, convertAmount, getLocalizedCategory } from '../types';

interface Props {
  transactions: Transaction[];
  currency: string;
  language: Language;
  darkMode?: boolean;
}

const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent, currency, darkMode, language } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={darkMode ? "#e2e8f0" : "#1e293b"} className="text-sm font-medium">
        {getLocalizedCategory(payload.name, language)}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={darkMode ? "#94a3b8" : "#64748b"} className="text-xs">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.2}
      />
    </g>
  );
};

export const ExpenseChart: React.FC<Props> = ({ transactions, currency, language, darkMode }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = TRANSLATIONS[language].chart;
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const expenseData = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      const convertedAmount = convertAmount(curr.amount, curr.currency || 'USD', currency);
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += convertedAmount;
      } else {
        acc.push({ name: curr.category, value: convertedAmount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (expenseData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[400px] transition-colors">
        <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-700 mb-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-600"></div>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-sm">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full min-h-[400px] transition-colors">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t.title}</h3>
      <div className="flex-1 w-full min-h-[300px] relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={(props) => renderActiveShape({ ...props, currency, darkMode, language })}
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              stroke={darkMode ? "#1e293b" : "#fff"} 
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom Legend Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
         {expenseData.slice(0, 6).map((entry, index) => (
           <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default" onMouseEnter={() => setActiveIndex(index)}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{getLocalizedCategory(entry.name, language)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(entry.value)}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};