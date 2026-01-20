import React, { useEffect, useState } from 'react';
import { BookOpen, Coins, TrendingUp, Receipt, PieChart, NotebookPen, CreditCard, Wallet, Banknote } from 'lucide-react';

interface Props {
  onFinish: () => void;
  soundEnabled: boolean;
}

export const SplashScreen: React.FC<Props> = ({ onFinish, soundEnabled }) => {
  const [stage, setStage] = useState<'book' | 'reveal' | 'finished'>('book');
  const [animationStarted, setAnimationStarted] = useState(false);

  // List of icons to pop out
  const icons = [
    { Icon: Coins, color: 'text-yellow-400', delay: 0, left: '45%' },
    { Icon: TrendingUp, color: 'text-emerald-400', delay: 200, left: '55%' },
    { Icon: Receipt, color: 'text-slate-200', delay: 400, left: '40%' },
    { Icon: PieChart, color: 'text-blue-400', delay: 600, left: '60%' },
    { Icon: CreditCard, color: 'text-rose-400', delay: 800, left: '35%' },
    { Icon: Wallet, color: 'text-indigo-400', delay: 1000, left: '65%' },
    { Icon: Banknote, color: 'text-green-500', delay: 1200, left: '50%' },
  ];

  useEffect(() => {
    // Start animation immediately
    setAnimationStarted(true);

    // Switch to Logo Reveal after particles are done (approx 2.5s)
    const timer1 = setTimeout(() => {
      setStage('reveal');
    }, 2800);

    // Finish Splash Screen (approx 1.5s after reveal)
    const timer2 = setTimeout(() => {
      setStage('finished');
      setTimeout(onFinish, 500); // Allow fade out time
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center transition-opacity duration-700 ${stage === 'finished' ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900 pointer-events-none" />

      {stage === 'book' && (
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Floating Particles Container (Absolute over the book) */}
          <div className="absolute bottom-16 w-64 h-64 pointer-events-none">
            {animationStarted && icons.map((item, index) => (
              <div
                key={index}
                className={`absolute bottom-0 left-1/2 opacity-0 animate-popOutUp`}
                style={{ 
                  animationDelay: `${item.delay}ms`,
                  left: item.left 
                }}
              >
                <item.Icon size={28} className={`${item.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
              </div>
            ))}
          </div>

          {/* The Magic Book */}
          <div className="relative z-10 animate-bookPulse">
            {/* Glow behind book */}
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform scale-150" />
            
            <div className="relative">
              <BookOpen size={100} className="text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" strokeWidth={1.5} />
              
              {/* Inner Light Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-gradient-to-t from-blue-400/40 to-transparent blur-xl" />
            </div>
          </div>

        </div>
      )}

      {stage === 'reveal' && (
        <div className="flex flex-col items-center animate-logoReveal relative z-20">
          <div className="bg-green-600 p-6 rounded-3xl shadow-2xl shadow-green-500/20 mb-6">
            <NotebookPen className="text-white" size={64} />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Hisab
          </h1>
          <p className="text-slate-400 mt-2 font-light tracking-widest text-sm uppercase">
            Expense Tracker
          </p>
        </div>
      )}
    </div>
  );
};