import React, { useEffect, useState, PropsWithChildren } from "react";
import { Lock, Loader2, ArrowRight, AlertTriangle } from "lucide-react";

export default function PasswordGate({
  children,
}: PropsWithChildren) {
  const [input, setInput] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Check session storage to keep logged in on refresh
    const sessionAuth = sessionStorage.getItem('hisab_auth');
    if (sessionAuth === 'true') {
        setAllowed(true);
    }

    fetch("/password.json")
      .then((res) => {
        if (!res.ok) {
           throw new Error(`Config load failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.password) {
            setPassword(data.password);
        } else {
            throw new Error("Invalid config format");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Password config error:", err);
        setConfigError(true);
        setLoading(false);
      });
  }, []);

  const handleUnlock = () => {
    if (input === password) {
      setAllowed(true);
      sessionStorage.setItem('hisab_auth', 'true');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleUnlock();
    }
  };

  // If already allowed, render children immediately
  if (allowed) {
    return <>{children}</>;
  }

  // Loading state while fetching password
  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
        </div>
    );
  }

  // Config Error State
  if (configError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-slate-100 dark:border-slate-700">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 mx-auto">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Configuration Error</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Unable to load security configuration. Please ensure <code>password.json</code> exists in the public folder.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Welcome to Hisab</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
              Please enter the password to access your tracker.
            </p>
        </div>
        
        <div className="space-y-4">
            <div>
                <input
                  type="password"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setError(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Password"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 dark:text-white transition-all`}
                  autoFocus
                />
                 {error && (
                    <p className="text-xs text-rose-500 mt-2 ml-1">Incorrect password. Please try again.</p>
                )}
            </div>
            <button
              onClick={handleUnlock}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              Unlock <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}