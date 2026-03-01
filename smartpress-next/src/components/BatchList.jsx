'use client';

import { useState, useMemo } from 'react';
import {
    FileImage,
    Check,
    ChevronRight,
    Trash2,
    AlertCircle,
    Loader2,
    CheckCircle2,
    MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

export default function BatchList({
    files,
    selectedIndex,
    setSelectedIndex,
    selectedIndices,
    setSelectedIndices,
    onSelectAll,
    onDeselectAll
}) {
    const toggleSelect = (e, index) => {
        e.stopPropagation();
        const next = new Set(selectedIndices);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setSelectedIndices(next);
    };

    if (files.length === 0) return null;

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Batch Header & Selection Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-[var(--text-primary)] text-lg tracking-tight flex items-center gap-2">
                        Batch Queue
                        <span className="bg-[var(--accent)] text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/20">
                            {selectedIndices.size} Selected
                        </span>
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSelectAll}
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-2 py-1"
                    >
                        Select All
                    </button>
                    <div className="w-px h-3 bg-[var(--border-color)]" />
                    <button
                        onClick={onDeselectAll}
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition-colors px-2 py-1"
                    >
                        Deselect
                    </button>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {files.map((file, index) => {
                        const isSelected = selectedIndices.has(index);
                        const isActive = selectedIndex === index;

                        return (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={() => setSelectedIndex(index)}
                                className={`
                  relative group cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200
                  ${isActive
                                        ? 'bg-[var(--card-bg)] border-[var(--accent)] shadow-lg shadow-indigo-500/10'
                                        : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--text-muted)] shadow-sm hover:shadow-md'
                                    }
                `}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Selection Checkbox */}
                                    <div
                                        onClick={(e) => toggleSelect(e, index)}
                                        className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                      ${isSelected
                                                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-indigo-500/20'
                                                : 'border-[var(--border-color)] group-hover:border-[var(--text-muted)] bg-white dark:bg-slate-800'
                                            }
                    `}
                                    >
                                        {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
                                    </div>

                                    {/* Thumbnail Placeholder / Icon */}
                                    <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isActive ? 'bg-indigo-50 text-[var(--accent)] dark:bg-indigo-500/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}
                  `}>
                                        <FileImage className="w-6 h-6" />
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                            {file.original.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                                                {formatSize(file.original.size)}
                                            </span>
                                            {file.compressed && (
                                                <>
                                                    <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                                                        {formatSize(file.compressed.size)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    <div className="flex flex-col items-end gap-1">
                                        {file.status === 'processing' && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Optimizing</span>
                                            </div>
                                        )}
                                        {file.status === 'success' && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Saved {file.savings}%</span>
                                            </div>
                                        )}
                                        {file.status === 'error' && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full">
                                                <AlertCircle className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Failed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-bar"
                                        className="absolute left-0 top-4 bottom-4 w-1 bg-[var(--accent)] rounded-r-full"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
