'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Maximize2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Move,
    MousePointer2,
    ArrowLeftRight,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useObjectUrl } from '@/hooks/useObjectUrl';

export default function ComparisonView({
    file,
    onReset,
    isPro,
    onOpenPro
}) {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showHelper, setShowHelper] = useState(true);
    const containerRef = useRef(null);

    const originalUrl = useObjectUrl(file?.original);
    const compressedUrl = useObjectUrl(file?.compressed);

    // Hide helper after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowHelper(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(position);
        setShowHelper(false);
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('mouseup', () => setIsDragging(false));
            window.addEventListener('touchend', () => setIsDragging(false));
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, [isDragging, handleMove]);

    if (!file) {
        return (
            <div className="w-full aspect-video glass-card flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] group">
                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <MousePointer2 className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest opacity-50">Select an image to audit</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-color)]">
                        <button
                            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-muted)] transition-all"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button
                            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-muted)] transition-all"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset View
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-premium border-4 border-[var(--card-bg)] group select-none"
                style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
            >
                {/* Original (Base) */}
                <div className="absolute inset-0 w-full h-full p-8 md:p-12">
                    {originalUrl && (
                        <img
                            src={originalUrl}
                            alt="Original"
                            className="w-full h-full object-contain transition-transform duration-300"
                            style={{ transform: `scale(${zoomLevel})` }}
                        />
                    )}
                    <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest pointer-events-none z-10">
                        Original
                    </div>
                </div>

                {/* Compressed (Overlay) */}
                <div
                    className="absolute inset-0 w-full h-full p-8 md:p-12 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                    <AnimatePresence mode="wait">
                        {compressedUrl ? (
                            <motion.img
                                key={compressedUrl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={compressedUrl}
                                alt="Compressed"
                                className="w-full h-full object-contain"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full"
                                />
                            </div>
                        )}
                    </AnimatePresence>
                    <div className="absolute top-8 left-8 bg-[var(--accent)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest pointer-events-none z-10 shadow-xl">
                        Optimized
                    </div>
                </div>

                {/* Slider Handle */}
                <div
                    className="slider-handle group"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-full h-full rounded-full border-2 border-white/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>

                {/* Comparison Helper Overlay */}
                <AnimatePresence>
                    {showHelper && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex items-center gap-8">
                                    <motion.div
                                        animate={{ x: [-10, 10, -10] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowLeftRight className="w-12 h-12 text-white drop-shadow-2xl" />
                                    </motion.div>
                                </div>
                                <span className="text-white text-lg font-black uppercase tracking-[0.4em] drop-shadow-lg">Drag to Compare</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Overlay */}
                {file.status === 'processing' && (
                    <div className="absolute inset-0 z-50 bg-[var(--card-bg)]/40 backdrop-blur-md flex items-center justify-center transition-all">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
                                <div className="absolute inset-0 blur-xl bg-[var(--accent)]/50 animate-pulse" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Intelligence Working...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison Stats */}
            {file.compressed && (
                <div className="grid grid-cols-3 gap-6">
                    <div className="glass-card !rounded-2xl p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/50 flex flex-col items-center text-center">
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Old Size</span>
                        <div className="text-lg font-black">{formatSize(file.original.size)}</div>
                    </div>
                    <div className="glass-card !rounded-2xl p-4 border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/5 to-white flex flex-col items-center text-center">
                        <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest mb-1">New Size</span>
                        <div className="text-lg font-black text-[var(--accent)]">{formatSize(file.compressed.size)}</div>
                    </div>
                    <div className="glass-card !rounded-2xl p-4 bg-gradient-to-br from-green-50/50 to-white flex flex-col items-center text-center">
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Impact</span>
                        <div className="text-lg font-black text-green-600">Saved {file.savings}%</div>
                    </div>
                </div>
            )}
        </div>
    );
}
