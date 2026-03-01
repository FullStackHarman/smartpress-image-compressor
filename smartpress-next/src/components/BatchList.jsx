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
    Settings2
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
    onDeselectAll,
    onClearAll
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
        <div className="flex flex-col h-full gap-5">
            {/* Batch Header & Selection Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-[var(--text-primary)] text-lg tracking-tight flex items-center gap-2">
                        Batch Queue
                        <motion.span
                            key={selectedIndices.size}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--accent)] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center min-w-[24px]"
                        >
                            {selectedIndices.size}
                        </motion.span>
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
                    <div className="w-px h-3 bg-[var(--border-color)]" />
                    <button
                        onClick={onClearAll}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors px-2 py-1 flex items-center gap-1"
                        title="Clear all images"
                    >
                        <Trash2 className="w-3 h-3" />
                        Fresh
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
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: isActive ? 1.02 : 1,
                                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                                    backgroundColor: isSelected ? 'var(--accent-glow)' : 'var(--card-bg)'
                                }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={() => setSelectedIndex(index)}
                                className={`
                                    relative group cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300
                                    ${isActive
                                        ? 'shadow-premium ring-2 ring-[var(--accent)]/10'
                                        : 'shadow-sm hover:shadow-premium hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between gap-4">

                                    {/* LEFT SIDE: Selection & Info */}
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            onClick={(e) => toggleSelect(e, index)}
                                            className={`
                                                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-indigo-500/20'
                                                    : 'border-[var(--border-color)] group-hover:border-[var(--text-muted)] bg-white dark:bg-slate-800'
                                                }
                                            `}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -45 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                >
                                                    <Check className="w-4 h-4 stroke-[4px]" />
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                            ${isActive ? 'bg-indigo-50 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}
                                        `}>
                                            <FileImage className="w-6 h-6" />
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className={`text-[15px] font-black truncate leading-none mb-1.5 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {file.original.name}
                                            </h4>
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-80">
                                                {formatSize(file.original.size)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE: Results & Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right flex flex-col items-end gap-1">
                                            {file.compressed ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-black text-[var(--accent)]">
                                                        {formatSize(file.compressed.size)}
                                                    </span>
                                                    <div className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-green-500/20 uppercase">
                                                        {file.savings}%
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[18px]" />
                                            )}

                                            {/* Status Badge */}
                                            {file.status === 'processing' ? (
                                                <div className="flex items-center gap-1.5 text-amber-500">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Optimizing...</span>
                                                </div>
                                            ) : file.status === 'success' ? (
                                                <div className="flex items-center gap-1.5 text-green-500">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Ready</span>
                                                </div>
                                            ) : file.status === 'error' ? (
                                                <div className="flex items-center gap-1.5 text-red-500">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Error</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter">Pending</span>
                                            )}
                                        </div>

                                        <button
                                            className={`p-2 rounded-xl border-2 transition-all ${isActive ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-transparent text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-muted)]'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedIndex(index);
                                            }}
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                </div>

                                {/* Active Selection Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="selection-glow"
                                        className="absolute -inset-0.5 border-2 border-[var(--accent)] rounded-2xl pointer-events-none opacity-20"
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
