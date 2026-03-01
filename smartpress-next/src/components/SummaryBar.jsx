'use client';

import {
    Download,
    Trash2,
    ArrowRight,
    CheckCircle2,
    Zap,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

export default function SummaryBar({
    files,
    selectedIndices,
    onDownload,
    onRemove,
    isProcessing
}) {
    const selectedFiles = files.filter((_, i) => selectedIndices.has(i));
    const hasCompressed = selectedFiles.some(f => f.compressed);

    const totalOriginal = selectedFiles.reduce((acc, f) => acc + f.original.size, 0);
    const totalCompressed = selectedFiles.reduce((acc, f) => acc + (f.compressed?.size || f.original.size), 0);
    const totalSaved = totalOriginal - totalCompressed;
    const avgSavings = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

    if (files.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-6 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto w-full h-24 glass-card shadow-2xl shadow-indigo-500/10 pointer-events-auto overflow-hidden flex items-center justify-between px-8 border-t-2 border-white/50 dark:border-white/5">

                {/* Left: Stats with Counter Animation */}
                <div className="flex gap-8 items-center">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total Original</p>
                        <p className="text-xl font-black text-[var(--text-primary)] tracking-tight">{formatSize(totalOriginal)}</p>
                    </div>

                    <div className="w-px h-10 bg-[var(--border-color)]" />

                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Savings Impact</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-black text-green-600 tracking-tighter">-{formatSize(totalSaved)}</p>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full mb-1">
                                {avgSavings}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Selected Badge */}
                <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-secondary)] px-6 py-3 rounded-2xl border border-[var(--border-color)] shadow-inner">
                    <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-[var(--accent)] shadow-lg shadow-indigo-500/40'}`} />
                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">
                        {selectedIndices.size} Items Ready
                    </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRemove}
                        className="p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all hover:scale-105 active:scale-95"
                        title="Remove Selected"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={!hasCompressed || isProcessing}
                        className={`
              relative btn-primary !py-4 !px-8 h-14 group overflow-hidden
              ${(!hasCompressed || isProcessing) ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-xl shadow-indigo-600/20'}
            `}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <div className="flex items-center gap-2 relative z-10">
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="font-black uppercase tracking-widest text-sm">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                    <span className="font-black uppercase tracking-widest text-sm">Download ZIP</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
