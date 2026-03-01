'use client';

import { useState, useEffect } from 'react';
import {
    Zap,
    Moon,
    Sun,
    Download,
    ShieldCheck,
    Zap as ZapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ isPro, onOpenPro }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    return (
        <nav className="sticky top-0 z-[150] w-full px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)] transition-all">
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                    <span className="text-xl font-black">S</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-[var(--text-primary)]">SmartPress</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">100% Client-Side</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all active:scale-95"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {!isPro ? (
                        <button
                            onClick={onOpenPro}
                            className="btn-primary flex items-center gap-2 shadow-xl shadow-indigo-600/20"
                        >
                            <ZapIcon className="w-4 h-4 fill-current" />
                            <span>Unlock Pro</span>
                        </button>
                    ) : (
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 font-bold text-xs uppercase tracking-widest border border-white/20">
                            <Zap className="w-4 h-4" /> Pro Activated
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
