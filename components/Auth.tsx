import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, AlertTriangle, User, Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  onGuestLogin?: () => void;
}

export const Auth: React.FC<Props> = ({ onGuestLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle visibility
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [animateCard, setAnimateCard] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setAnimateCard(true);
  }, []);

  // Clear inputs when switching modes
  useEffect(() => {
    setError(null);
    setMessage(null);
    setShowPassword(false); // Reset visibility on mode switch
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Signup successful! Please check your email for verification.');
        setIsSignUp(false); // Switch back to login view after successful signup
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#fdfaf6] dark:bg-slate-900 transition-colors duration-700 font-sans">
      
      {/* CSS for custom animations to keep component self-contained */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 30px) rotate(-5deg); }
        }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 15s ease-in-out infinite; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 255, 255, 0.5) inset;
        }
        .dark .glass-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Warm Gradient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-300/30 dark:bg-orange-900/20 blur-[120px] animate-float-slow mix-blend-multiply dark:mix-blend-normal pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-200/30 dark:bg-amber-900/20 blur-[120px] animate-float-reverse mix-blend-multiply dark:mix-blend-normal pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-yellow-200/30 dark:bg-yellow-900/10 blur-[80px] animate-pulse duration-[8000ms] mix-blend-multiply dark:mix-blend-normal pointer-events-none" />

      {/* Main Glass Card */}
      <div className={`
        glass-card w-full max-w-[440px] rounded-[36px] p-8 md:p-10 relative z-10 
        transition-all duration-1000 transform ease-out
        ${animateCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}
      `}>
        
        <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-6 animate-in fade-in zoom-in duration-700 delay-100">
               <Logo size={90} className="drop-shadow-lg mb-2" />
               <div className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                 H<span className="text-orange-500">i</span>sab
               </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
               {isSignUp ? 'Join us to track your expenses' : 'Enter your details to access account'}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
            {/* Email Input */}
            <div className="relative group animate-in slide-in-from-bottom-3 fade-in duration-700 delay-300">
               <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300 pointer-events-none">
                  <Mail size={20} />
               </div>
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 placeholder="Email Address"
                 className="w-full pl-14 pr-5 py-4 bg-white/60 dark:bg-slate-900/60 border border-transparent group-hover:border-orange-200 dark:group-hover:border-orange-800/50 focus:border-orange-400 dark:focus:border-orange-500 rounded-2xl outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm focus:shadow-lg focus:shadow-orange-100/50 dark:focus:shadow-none font-medium"
               />
            </div>

            {/* Password Input */}
            <div className="relative group animate-in slide-in-from-bottom-3 fade-in duration-700 delay-400">
               <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300 pointer-events-none">
                  <Lock size={20} />
               </div>
               <input 
                 type={showPassword ? "text" : "password"} 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 placeholder="Password"
                 className="w-full pl-14 pr-12 py-4 bg-white/60 dark:bg-slate-900/60 border border-transparent group-hover:border-orange-200 dark:group-hover:border-orange-800/50 focus:border-orange-400 dark:focus:border-orange-500 rounded-2xl outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm focus:shadow-lg focus:shadow-orange-100/50 dark:focus:shadow-none font-medium"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
            
            {!isSignUp && (
              <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
                 <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                   Forgot Password?
                 </button>
              </div>
            )}

            {error && (
               <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium animate-in zoom-in-95 duration-300">
                 <AlertTriangle size={14} className="shrink-0" />
                 {error}
               </div>
            )}
            
            {message && (
               <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-medium animate-in zoom-in-95 duration-300">
                 <Loader2 size={14} className="shrink-0" />
                 {message}
               </div>
            )}

            {/* Login/Signup Button */}
            <button
               type="submit"
               disabled={loading}
               className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500"
            >
               {loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? <User size={18} /> : <LogIn size={18} />)}
               {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-600">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700/50"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-slate-400 font-medium backdrop-blur-sm">Or</span></div>
        </div>

        {/* Guest Button (Green & Elevated as requested) */}
        {onGuestLogin && (
           <button
             type="button"
             onClick={onGuestLogin}
             className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700"
           >
             Continue as Guest <ArrowRight size={14} />
           </button>
        )}

        {/* Toggle Mode */}
        <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700">
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
             {isSignUp ? 'Already have an account?' : "Don't have an account?"}
             <button 
               onClick={() => setIsSignUp(!isSignUp)}
               className="ml-2 text-orange-600 dark:text-orange-400 font-bold hover:underline transition-all"
             >
               {isSignUp ? 'Log In' : 'Sign Up'}
             </button>
           </p>
        </div>
        
      </div>
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-400/50 dark:text-slate-500/50 font-medium tracking-[0.2em] uppercase">
        Secure Authentication
      </div>

    </div>
  );
};