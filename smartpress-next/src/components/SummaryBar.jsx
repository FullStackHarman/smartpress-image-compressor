'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Download,
    Trash2,
    Zap,
    CheckCircle2,
    Loader2,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

const AnimatedCounter = ({ value, duration = 800 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseFloat(value);
        if (start === end) return;

        let totalMilisecondsChild = duration;
        let incrementTime = (totalMilisecondsChild / end) * 5;

        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toFixed(0)}</span>;
};

const AnimatedSizeCounter = ({ value, duration = 800 }) => {
    const [count, setCount] = useState(0);
    // Rough animation for MB/KB
    useEffect(() => {
        let start = 0;
        const end = value;
        const startTime = Date.now();

        const update = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(start + (end - start) * ease);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }, [value, duration]);

    return <span>{formatSize(count)}</span>;
};

export default function SummaryBar({
    files,
    selectedIndices,
    onDownload,
    onRemove,
    isProcessing
}) {
    const selectedFiles = useMemo(() =>
        files.filter((_, i) => selectedIndices.has(i)),
        [files, selectedIndices]);

    const stats = useMemo(() => {
        let totalOriginal = 0;
        let totalCompressed = 0;
        let readyCount = 0;

        selectedFiles.forEach(f => {
            totalOriginal += f.original.size;
            if (f.compressed) {
                totalCompressed += f.compressed.size;
                readyCount++;
            } else {
                totalCompressed += f.original.size;
            }
        });

        const savedBytes = totalOriginal - totalCompressed;
        const savingsPercent = totalOriginal > 0 ? Math.round((savedBytes / totalOriginal) * 100) : 0;

        return { savedBytes, savingsPercent, readyCount };
    }, [selectedFiles]);

    if (files.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-6 pointer-events-none"
        >
            <div className="max-w-5xl mx-auto glass-card !p-5 !rounded-[2.5rem] pointer-events-auto flex items-center justify-between shadow-2xl shadow-indigo-500/10 border-2 border-[var(--accent)]/10 bg-[var(--card-bg)]/95 backdrop-blur-2xl">

                {/* Impact Summary */}
                <div className="flex items-center gap-6 px-4">
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${stats.savingsPercent > 0 ? 'bg-green-500 text-white shadow-xl shadow-green-500/30 rotate-3' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                            {stats.savingsPercent > 50 ? <Sparkles className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                        </div>
                        {stats.readyCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-white pulse-indicator"
                            />
                        )}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-black tracking-tighter text-[var(--text-primary)]">
                                You saved <span className="text-green-500"><AnimatedSizeCounter value={stats.savedBytes} /></span>
                            </h4>
                            <AnimatePresence>
                                {stats.savingsPercent > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-green-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-green-500/20 uppercase tracking-widest"
                                    >
                                        <AnimatedCounter value={stats.savingsPercent} />% Saving
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                            Batch Intelligence Active <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {stats.readyCount} items ready to export
                        </p>
                    </div>
                </div>

                {/* Batch Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRemove}
                        disabled={selectedFiles.length === 0 || isProcessing}
                        className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all border-2 border-transparent hover:border-red-100 disabled:opacity-30 group"
                        title="Remove Selected"
                    >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={selectedFiles.length === 0 || isProcessing || stats.readyCount === 0}
                        className="btn-primary !h-16 !px-10 !rounded-2xl !text-base min-w-[240px] shadow-indigo-600/30 group relative overflow-hidden"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase font-black tracking-widest">Optimizing...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                <span className="uppercase font-black tracking-widest">Download Batch</span>
                                <div className="ml-3 px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black">
                                    {stats.readyCount}
                                </div>
                            </>
                        )}

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </button>
                </div>

            </div>
        </motion.div>
    );
}
