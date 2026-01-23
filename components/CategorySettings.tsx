
import React, { useState, useRef, useEffect } from 'react';
import { TransactionType, TRANSLATIONS, Language, getLocalizedCategory } from '../types';
import { 
  X, Plus, Settings, Trash2, AlertTriangle, Moon, Sun, Volume2, VolumeX, Globe, LayoutGrid, 
  Sliders, MessageCircle, ArrowLeft, Download, Upload, Database, Clipboard, Share2, LogOut, 
  LogIn, User, Coffee, Home, Bus, Zap, ShoppingBag, Stethoscope, GraduationCap, DollarSign, 
  TrendingUp, Gift, Briefcase, HelpCircle, Plane, Shield, RefreshCw, Smile, Heart, Landmark, 
  Percent, Award, Building2, RotateCcw, CreditCard, Tag, PiggyBank, Coins, Banknote, Gem, 
  BarChart3, Lock, ArrowDownLeft, Wallet, Check, ChevronDown, MessageSquare
} from 'lucide-react';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'categories';
  // Category Props
  incomeCategories: string[];
  expenseCategories: string[];
  savingsCategories: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onRemoveCategory: (type: TransactionType, name: string) => void;
  // General Props
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  // Data Management
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onOpenShare: () => void;
  onOpenFeedback: () => void;
  // Auth
  onLogout: () => void;
  isGuest?: boolean;
  userEmail?: string;
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

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
] as const;

export const CategorySettings: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTab = 'general',
  incomeCategories,
  expenseCategories,
  savingsCategories,
  onAddCategory,
  onRemoveCategory,
  language,
  onLanguageChange,
  darkMode,
  toggleDarkMode,
  soundEnabled,
  toggleSound,
  onClearAllData,
  onExportData,
  onImportData,
  onOpenShare,
  onOpenFeedback,
  onLogout,
  isGuest,
  userEmail
}) => {
  const [categoryTab, setCategoryTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newCategory, setNewCategory] = useState('');
  const [deleteInfo, setDeleteInfo] = useState<{ type: TransactionType, name: string } | null>(null);
  
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language].settings;
  const tCommon = TRANSLATIONS[language].common;
  const tFeedback = TRANSLATIONS[language].feedback;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  // Fix for line 308: Added the missing getCurrentCategories function.
  const getCurrentCategories = () => {
    switch (categoryTab) {
      case TransactionType.INCOME:
        return incomeCategories;
      case TransactionType.SAVINGS:
        return savingsCategories;
      case TransactionType.EXPENSE:
      default:
        return expenseCategories;
    }
  };

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    onAddCategory(categoryTab, newCategory.trim());
    setNewCategory('');
    if (soundEnabled) playSound('income');
  };

  const handleLogoutClick = () => {
      playClick();
      if (isGuest) onLogout();
      else setShowLogoutConfirm(true);
  };

  const isGeneralMode = initialTab === 'general';
  const modalTitle = isGeneralMode ? t.title : (language === 'bn' ? 'বিভাগ পরিচালনা' : 'Manage Categories');
  const HeaderIcon = isGeneralMode ? Settings : LayoutGrid;
  const theme = {
    bg: categoryTab === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/10' : categoryTab === TransactionType.SAVINGS ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-rose-50 dark:bg-rose-900/10',
    border: categoryTab === TransactionType.INCOME ? 'border-emerald-100 dark:border-emerald-900/30' : categoryTab === TransactionType.SAVINGS ? 'border-blue-100 dark:border-blue-900/30' : 'border-rose-100 dark:border-rose-900/30',
    iconBg: categoryTab === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-900/30' : categoryTab === TransactionType.SAVINGS ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-rose-100 dark:bg-rose-900/30',
    iconText: categoryTab === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : categoryTab === TransactionType.SAVINGS ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { playClick(); onClose(); }} />
        
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[85vh] transition-colors animate-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <HeaderIcon size={20} className={isGeneralMode ? "text-red-500" : "text-violet-600 dark:text-violet-400"} />
              {modalTitle}
            </h3>
            <button onClick={() => { playClick(); onClose(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isGeneralMode ? (
              <div className="p-4 space-y-6">
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { playClick(); onOpenShare(); }}
                      className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-800"
                    >
                      <div className="p-2 bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-lg shrink-0">
                         <Share2 size={18} />
                      </div>
                      <span className="font-medium text-xs text-indigo-900 dark:text-indigo-100">{t.shareExport}</span>
                    </button>

                    <button 
                      onClick={() => { playClick(); onOpenFeedback(); }}
                      className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-100 dark:border-emerald-800"
                    >
                      <div className="p-2 bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 rounded-lg shrink-0">
                         <MessageSquare size={18} />
                      </div>
                      <span className="font-medium text-xs text-emerald-900 dark:text-emerald-100">{tFeedback.title}</span>
                    </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.appearance}</h4>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.darkMode}</span>
                    </div>
                    <button onClick={() => { playClick(); toggleDarkMode(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.sound}</h4>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.sound}</span>
                    </div>
                    <button onClick={() => { toggleSound(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                   <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.language}</h4>
                   <button onClick={() => { playClick(); setShowLanguageDropdown(!showLanguageDropdown); }} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{LANGUAGES.find(l => l.code === language)?.native}</p>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                   </button>
                   {showLanguageDropdown && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                          {LANGUAGES.map(lang => (
                              <button key={lang.code} onClick={() => { playClick(); onLanguageChange(lang.code as Language); setShowLanguageDropdown(false); }} className={`w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${language === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                  <div className="flex items-center gap-3"><span className="text-lg">{lang.flag}</span><span className="text-sm text-slate-700 dark:text-slate-300">{lang.native}</span></div>
                                  {language === lang.code && <Check size={16} className="text-indigo-600" />}
                              </button>
                          ))}
                      </div>
                   )}
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.dataManagement}</h4>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg shrink-0 mt-1"><Database size={18} /></div>
                                <div><h5 className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.backupTitle}</h5><p className="text-[10px] text-slate-500 dark:text-slate-400">{t.backupDesc}</p></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { playClick(); onExportData(); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"><Download size={14} />{t.backupEmail}</button>
                                <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"><Upload size={14} />{t.restoreData}</button>
                                <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) { setPendingImportFile(e.target.files[0]); setConfirmRestoreOpen(true); } }} accept=".json" className="hidden" />
                            </div>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg shrink-0"><Trash2 size={18} /></div><span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.clearData}</span></div>
                            <button onClick={() => { playClick(); setConfirmClearOpen(true); }} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800">{tCommon.confirm}</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
                    <button onClick={handleLogoutClick} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${isGuest ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700' : 'bg-red-100 dark:bg-red-900/20 text-red-700'}`}>
                        {isGuest ? <LogIn size={18} /> : <LogOut size={18} />}{isGuest ? 'Login to Sync Data' : t.logout}
                    </button>
                    <div className="text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Developed by Rafi Hassan</p>
                        <a href="https://wa.me/8801570222989" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-green-500 text-white rounded-full text-[10px] font-bold"><MessageCircle size={12} />WhatsApp: +8801570222989</a>
                    </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex bg-slate-100/80 dark:bg-slate-700/50 p-1 rounded-xl mb-4">
                  {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.SAVINGS].map(type => (
                    <button key={type} onClick={() => { playClick(); setCategoryTab(type); }} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${categoryTab === type ? (type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : type === TransactionType.SAVINGS ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700') + ' dark:bg-slate-600 dark:text-white shadow-sm' : 'text-slate-500'}`}>{type === TransactionType.INCOME ? t.incomeTab : type === TransactionType.EXPENSE ? t.expenseTab : t.savingsTab}</button>
                  ))}
                </div>
                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                  <input ref={categoryInputRef} type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder={t.placeholder} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white" />
                  <button type="submit" disabled={!newCategory.trim()} className={`text-white px-4 rounded-lg flex items-center justify-center ${categoryTab === TransactionType.INCOME ? 'bg-emerald-600' : categoryTab === TransactionType.EXPENSE ? 'bg-rose-600' : 'bg-blue-600'}`}><Plus size={20} /></button>
                </form>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {getCurrentCategories().map((cat, idx) => (
                    <div key={cat} className={`flex items-center justify-between p-3 rounded-xl border ${theme.bg} ${theme.border}`}>
                      <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.iconBg} ${theme.iconText}`}>{getCategoryIcon(cat)}</div><span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{getLocalizedCategory(cat, language)}</span></div>
                      <button onClick={() => { playClick(); setDeleteInfo({ type: categoryTab, name: cat }); }} className="text-slate-400 hover:text-rose-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {deleteInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDeleteInfo(null)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 border dark:border-slate-700">
             <div className="flex flex-col items-center text-center">
                <AlertTriangle size={32} className="text-rose-500 mb-4" />
                <h3 className="font-bold mb-2">{t.deleteTitle}</h3>
                <p className="text-xs text-slate-500 mb-6">{t.deleteConfirm}</p>
                <div className="flex gap-2 w-full">
                    <button onClick={() => setDeleteInfo(null)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm">{tCommon.cancel}</button>
                    <button onClick={() => { onRemoveCategory(deleteInfo.type, deleteInfo.name); setDeleteInfo(null); playSound('delete'); }} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm">{tCommon.confirm}</button>
                </div>
             </div>
          </div>
        </div>
      )}
      {/* Restore Confirmation */}
      {confirmRestoreOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setConfirmRestoreOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 relative z-20 w-full max-w-sm border dark:border-slate-700">
             <div className="flex flex-col items-center text-center">
                <Database size={32} className="text-indigo-500 mb-4" />
                <h3 className="font-bold mb-2">{t.confirmRestoreTitle}</h3>
                <p className="text-xs text-slate-500 mb-6">{t.confirmRestoreDesc}</p>
                <div className="flex gap-2 w-full">
                    <button onClick={() => setConfirmRestoreOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm">{tCommon.cancel}</button>
                    <button onClick={() => { if(pendingImportFile) onImportData(pendingImportFile); setConfirmRestoreOpen(false); }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm">{tCommon.confirm}</button>
                </div>
             </div>
          </div>
        </div>
      )}
      {/* Clear Confirmation */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setConfirmClearOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 relative z-20 w-full max-w-sm border dark:border-slate-700">
             <div className="flex flex-col items-center text-center">
                <Trash2 size={32} className="text-rose-500 mb-4" />
                <h3 className="font-bold mb-2">{t.confirmClearTitle}</h3>
                <p className="text-xs text-slate-500 mb-6">{t.confirmClearDesc}</p>
                <div className="flex gap-2 w-full">
                    <button onClick={() => setConfirmClearOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm">{language === 'bn' ? 'না' : 'No'}</button>
                    <button onClick={() => { onClearAllData(); setConfirmClearOpen(false); }} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm">{language === 'bn' ? 'হ্যাঁ' : 'Yes'}</button>
                </div>
             </div>
          </div>
        </div>
      )}
       {/* Logout Confirmation */}
       {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 relative z-20 w-full max-w-sm border dark:border-slate-700">
             <div className="flex flex-col items-center text-center">
                <LogOut size={32} className="text-red-500 mb-4" />
                <h3 className="font-bold mb-2">{t.logout}</h3>
                <p className="text-xs text-slate-500 mb-6">{t.logoutConfirm}</p>
                <div className="flex gap-2 w-full">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 bg-slate-100 rounded-lg text-sm">{tCommon.cancel}</button>
                    <button onClick={() => { onLogout(); setShowLogoutConfirm(false); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm">{tCommon.confirm}</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
