import React from 'react';
import { Transaction, DashboardStats, Language } from '../types';

interface Props {
  transactions: Transaction[];
  stats: DashboardStats;
  language: Language;
  currency: string;
}

export const AISuggestion: React.FC<Props> = () => {
  return null;
};
