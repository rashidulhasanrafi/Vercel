import React, { useState, useEffect } from 'react';
import { Tracker } from './Tracker';
import { Auth } from './Auth';
import { SplashScreen } from './SplashScreen';
import { Language } from '../types';
import { Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  
  // Merge State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    // 1. Initialize Preferences (Theme, Language, Sound)
    const initPreferences = () => {
      const savedTheme = localStorage.getItem('zenfinance_theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }

      const savedLanguage = localStorage.getItem('zenfinance_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
        setLanguage(savedLanguage as Language);
      }
      
      const savedSound = localStorage.getItem('zenfinance_sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }

      const savedGuestState = localStorage.getItem('zenfinance_is_guest');
      if (savedGuestState === 'true') {
        setIsGuest(true);
      }
    };

    initPreferences();

    // 2. Initialize Auth Session
    const initAuth = async () => {
        try {
            // Check for existing session
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.warn("Error restoring session:", error.message);
                // If there's an error (e.g., refresh token invalid), ensure we treat user as logged out
                setSession(null);
            } else {
                setSession(data.session);
            }
        } catch (err) {
            console.error("Unexpected error during auth initialization:", err);
            // Catch network errors (Failed to fetch) effectively
            setSession(null);
        } finally {
            // ALWAYS resolve loading state
            setLoading(false);
        }
    };

    initAuth();

    // 3. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // If user logs in, check if they have previous guest data to merge
      if (session) {
        setIsGuest(false);
        localStorage.removeItem('zenfinance_is_guest');
        checkForGuestData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkForGuestData = () => {
    const hasGuestData = Object.keys(localStorage).some(k => k.startsWith('zenfinance_transactions_guest_'));
    if (hasGuestData) {
      setShowMergeModal(true);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('zenfinance_language', newLang);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('zenfinance_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('zenfinance_sound', String(newState));
  };

  // Data Management Functions
  const handleClearAllData = async () => {
    if (isGuest) {
      Object.keys(localStorage).forEach(key => {
         if (key.includes('guest')) {
             localStorage.removeItem(key);
         }
      });
      window.location.reload();
      return;
    }

    if (!session) return;
    
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', session.user.id);
        
        if (error) {
            console.error('Error clearing data:', error);
            alert('Failed to clear data: ' + error.message);
        } else {
            window.location.reload();
        }
    } catch (err: any) {
        console.error("Fetch error during clear:", err);
        alert("Network error: " + err.message);
    }
  };

  const handleExportData = () => {
    alert("Export feature coming soon.");
  };

  const handleImportData = (file: File) => {
    alert("Import feature coming soon.");
  };

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem('zenfinance_is_guest');
    } else {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    localStorage.setItem('zenfinance_is_guest', 'true');
    setLoading(false);
  };

  const handleMergeData = async (shouldMerge: boolean) => {
    if (shouldMerge && session) {
      setIsMerging(true);
      try {
        let allGuestTransactions: any[] = [];
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('zenfinance_transactions_guest_')) {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                allGuestTransactions = [...allGuestTransactions, ...data];
            }
        });

        if (allGuestTransactions.length > 0) {
            const transactionsWithUser = allGuestTransactions.map(t => ({
                ...t,
                user_id: session.user.id,
            }));

            const { error } = await supabase.from('transactions').insert(transactionsWithUser);
            if (error) throw error;
        }
      } catch (err) {
        console.error("Merge failed", err);
        alert("Failed to sync data. Please try again.");
        setIsMerging(false);
        return;
      }
    }

    Object.keys(localStorage).forEach(key => {
       if (key.includes('_guest')) {
           localStorage.removeItem(key);
       }
    });
    
    setIsMerging(false);
    setShowMergeModal(false);
    window.location.reload();
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
        </div>
     );
  }

  // Show Auth if no session AND not guest
  if (!session && !isGuest) {
    return <Auth onGuestLogin={handleGuestLogin} />;
  }

  const userId = session ? session.user.id : 'guest';
  const profileName = session ? (session.user.email?.split('@')[0] || 'User') : 'Guest';
  const userEmail = session?.user?.email;

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} soundEnabled={soundEnabled} />
      ) : (
        <Tracker 
          key={userId} 
          userId={userId} 
          profileName={profileName}
          userEmail={userEmail}
          onLogout={handleLogout} 
          language={language}
          onLanguageChange={handleLanguageChange}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          onClearAllData={handleClearAllData}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      )}

      {/* Merge Confirmation Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-indigo-100 dark:border-indigo-900">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                {isMerging ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sync Guest Data?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                We found local data from your Guest session. Do you want to merge it into your account?
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => handleMergeData(true)} 
                  disabled={isMerging}
                  className="w-full py-3 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                >
                  {isMerging ? 'Syncing...' : 'Yes, Merge & Sync'}
                </button>
                <button 
                  onClick={() => handleMergeData(false)} 
                  disabled={isMerging}
                  className="w-full py-3 px-4 rounded-xl text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  No, Discard Guest Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;