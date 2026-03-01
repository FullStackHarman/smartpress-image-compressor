'use client';

import { Sun, Moon, Zap, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ isPro, onOpenPro }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="flex items-center justify-between py-6 px-12 sticky top-0 z-[60] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-600/30">
                    S
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
                    SmartPress
                </h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-xs font-bold border border-green-500/20">
                    <ShieldCheck className="w-4 h-4" /> 100% Client-Side
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/5 hover:scale-110 transition-transform text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                    onClick={onOpenPro}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${isPro ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}`}
                >
                    {isPro ? (
                        <>✨ Pro Active</>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 fill-white" />
                            Unlock Pro
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
