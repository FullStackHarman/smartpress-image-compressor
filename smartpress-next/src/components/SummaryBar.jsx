'use client';

import { Download, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

export default function SummaryBar({
    files,
    selectedIndices,
    onDownload,
    onRemove
}) {
    const selectedFiles = files.filter((_, i) => selectedIndices.has(i));
    const count = selectedFiles.length;

    if (count === 0) return null;

    const totalOriginal = selectedFiles.reduce((acc, f) => acc + f.original.size, 0);
    const totalCompressed = selectedFiles.reduce((acc, f) => acc + (f.compressed?.size || f.original.size), 0);
    const totalSaved = Math.max(0, totalOriginal - totalCompressed);
    const savingsPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/95 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-8 pl-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selection</span>
                            <span className="text-xl font-bold">{count} <span className="text-xs text-slate-500">Images</span></span>
                        </div>

                        <div className="h-10 w-[1px] bg-white/10 hidden md:block" />

                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Original</span>
                                <span className="text-sm font-bold">{formatSize(totalOriginal)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Optimized</span>
                                <span className="text-sm font-bold text-indigo-400">{formatSize(totalCompressed)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Saved</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-green-400">{formatSize(totalSaved)}</span>
                                    <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-lg text-[10px] font-bold">-{savingsPercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pr-2 w-full md:w-auto">
                        <button
                            onClick={onRemove}
                            className="p-4 hover:bg-red-500/10 text-red-400 rounded-2xl transition-all group"
                            title="Remove Selected"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110" />
                        </button>
                        <button
                            onClick={onDownload}
                            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 group"
                        >
                            <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                            Download {count > 1 ? `${count} Files (ZIP)` : 'Compressed'}
                            <ArrowRight className="w-4 h-4 opacity-30" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
