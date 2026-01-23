import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, Facebook, Linkedin, Chrome, AlertTriangle, User, KeyRound, ArrowRight, Mail, Lock } from 'lucide-react';

interface Props {
  onGuestLogin?: () => void;
}

export const Auth: React.FC<Props> = ({ onGuestLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Clear inputs when switching modes
  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert('Signup successful! Please check your email for verification.');
        setIsSignUp(false); // Switch back to login
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ icon }: { icon: React.ReactNode }) => (
    <button
      type="button"
      className="border border-slate-300 dark:border-slate-600 rounded-full w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95"
      onClick={() => alert("Social login coming soon!")}
    >
      {icon}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />

      {/* 
        ========================================
        DESKTOP SLIDING ANIMATION LAYOUT 
        (Hidden on Mobile)
        ========================================
      */}
      <div className={`relative bg-white dark:bg-slate-800 rounded-[30px] shadow-2xl overflow-hidden w-full max-w-[850px] min-h-[550px] hidden md:block transition-colors z-10`}>
        
        {/* Sign Up Form Container (Left Layer) */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${isSignUp ? 'translate-x-[100%] opacity-100 z-50' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleAuth} className="bg-white dark:bg-slate-800 flex flex-col items-center justify-center h-full px-12 text-center">
            <h1 className="font-bold text-3xl mb-4 text-slate-800 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-700">Create Account</h1>
            
            <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <SocialButton icon={<Facebook size={18} />} />
              <SocialButton icon={<Chrome size={18} />} />
              <SocialButton icon={<Linkedin size={18} />} />
            </div>
            
            <span className="text-xs text-slate-400 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">or use your email for registration</span>
            
            <div className="w-full space-y-3 mb-6">
              <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
              <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs mb-4 w-full text-left animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-indigo-600 bg-indigo-600 text-white text-xs font-bold py-3.5 px-12 uppercase tracking-wider transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign Up
            </button>

            {onGuestLogin && (
              <button 
                type="button" 
                onClick={onGuestLogin}
                className="mt-6 py-2.5 px-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2 group animate-in fade-in duration-1000 delay-500"
              >
                <User size={14} className="group-hover:scale-110 transition-transform" /> Continue as Guest
              </button>
            )}
          </form>
        </div>

        {/* Log In Form Container (Right Layer) */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-20 ${isSignUp ? 'translate-x-[100%]' : ''}`}>
          <form onSubmit={handleAuth} className="bg-white dark:bg-slate-800 flex flex-col items-center justify-center h-full px-12 text-center">
            <h1 className="font-bold text-3xl mb-4 text-slate-800 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-700">Log In</h1>
            
            <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <SocialButton icon={<Facebook size={18} />} />
              <SocialButton icon={<Chrome size={18} />} />
              <SocialButton icon={<Linkedin size={18} />} />
            </div>
            
            <span className="text-xs text-slate-400 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">or use your email account</span>
            
            <div className="w-full space-y-3 mb-4">
              <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
              <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleForgotPassword} 
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 border-b border-transparent hover:border-slate-800 dark:hover:border-slate-200 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
            >
              Forgot your password?
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs mb-4 w-full text-left animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs mb-4 w-full text-left animate-in fade-in slide-in-from-top-2">
                <KeyRound size={14} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-indigo-600 bg-indigo-600 text-white text-xs font-bold py-3.5 px-12 uppercase tracking-wider transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
            >
               {loading && <Loader2 size={14} className="animate-spin" />}
               Log In
            </button>
            
            {onGuestLogin && (
              <button 
                type="button" 
                onClick={onGuestLogin}
                className="mt-6 py-2.5 px-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2 group animate-in fade-in duration-1000 delay-500"
              >
                <User size={14} className="group-hover:scale-110 transition-transform" /> Continue as Guest
              </button>
            )}
          </form>
        </div>

        {/* Animated Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${isSignUp ? '-translate-x-full' : ''}`}>
          <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            {/* Overlay Panel Left (Visible when Signup is Active) */}
            <div className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h1 className="font-bold text-3xl mb-4">Welcome Back!</h1>
              <p className="text-sm font-light mb-8 opacity-90 leading-relaxed">
                To keep connected with us please login with your personal info
              </p>
              <button 
                onClick={() => { setIsSignUp(false); setError(null); }}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition-all active:scale-95 hover:bg-white hover:text-indigo-600"
              >
                Log In
              </button>
            </div>

            {/* Overlay Panel Right (Visible when Signin is Active) */}
            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h1 className="font-bold text-3xl mb-4">Hello, Friend!</h1>
              <p className="text-sm font-light mb-8 opacity-90 leading-relaxed">
                Enter your personal details and start journey with us
              </p>
              <button 
                onClick={() => { setIsSignUp(true); setError(null); }}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition-all active:scale-95 hover:bg-white hover:text-indigo-600"
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 
        ========================================
        MOBILE LAYOUT (Simple Toggle Card)
        Visible on sm screens and down
        ========================================
      */}
      <div className="md:hidden w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 z-10">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm transform skew-y-6 origin-bottom-left scale-150 translate-y-12"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 animate-in fade-in slide-in-from-bottom-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-sm opacity-90 animate-in fade-in slide-in-from-bottom-3 delay-100">
               {isSignUp ? 'Sign up to start tracking your finances' : 'Login to access your tracker'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="p-8 flex flex-col gap-4">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
            />
          </div>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
            />
          </div>

          {!isSignUp && (
            <button type="button" onClick={handleForgotPassword} className="text-xs text-right text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Forgot Password?
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs animate-in fade-in zoom-in-95">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
             <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs animate-in fade-in zoom-in-95">
              <KeyRound size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignUp ? 'SIGN UP' : 'LOG IN'}
          </button>
          
          <div className="mt-4 text-center">
             <p className="text-sm text-slate-500 dark:text-slate-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="ml-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {onGuestLogin && (
             <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                <button 
                  type="button" 
                  onClick={onGuestLogin}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <User size={14} /> Continue as Guest <ArrowRight size={12} />
                </button>
             </div>
          )}
        </form>
      </div>

    </div>
  );
};
