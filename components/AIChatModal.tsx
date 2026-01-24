import React from 'react';
import { Language, Transaction, DashboardStats } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
  transactions: Transaction[];
  stats: DashboardStats;
  currency: string;
}

export const AIChatModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return null;
};
