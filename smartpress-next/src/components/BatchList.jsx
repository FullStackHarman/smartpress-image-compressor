'use client';

import {
    CheckCircle2,
    Loader2,
    Trash2,
    Eye,
    FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

export default function BatchList({
    files,
    selectedIndex,
    setSelectedIndex,
    selectedIndices,
    setSelectedIndices
}) {
    const toggleSelect = (index, e) => {
        e.stopPropagation();
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIndices.size === files.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(files.map((_, i) => i)));
        }
    };

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selectedIndices.size === files.length && files.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Batch Process <span className="ml-1 text-indigo-600">({selectedIndices.size} Selected)</span>
                    </h3>
                </div>
                <button className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <AnimatePresence>
                    {files.map((file, index) => {
                        const isActive = index === selectedIndex;
                        const isSelected = selectedIndices.has(index);

                        return (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer mb-2 ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
                                onClick={() => setSelectedIndex(index)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => toggleSelect(index, e)}
                                        className="w-4 h-4 accent-indigo-600 rounded border-slate-300 dark:border-slate-600"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 relative overflow-hidden shadow-inner">
                                        {/* Placeholder or real thumb could go here */}
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                            <FileImage className="w-6 h-6" />
                                        </div>
                                        {file.status === 'processing' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{file.original.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-medium text-slate-400">{formatSize(file.original.size)}</span>
                                            {file.compressed && (
                                                <>
                                                    <span className="text-indigo-400 text-[10px]">→</span>
                                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{formatSize(file.compressed.size)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-3">
                                    {file.status === 'success' && (
                                        <div className="bg-green-500/10 text-green-500 p-1.5 rounded-full">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                    <button className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 bg-white dark:bg-slate-700 dark:group-hover:bg-slate-600 px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-600 transition-all">
                                        EDIT
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
