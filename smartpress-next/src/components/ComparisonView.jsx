'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Lock as LockIcon, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';
import { useObjectUrl } from '@/hooks/useObjectUrl';

const ComparisonView = memo(function ComparisonView({
    file,
    onReset,
    isPro,
    onOpenPro
}) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showProLock, setShowProLock] = useState(false);

    const containerRef = useRef(null);

    // Stable Object URLs using custom hook
    const originalUrl = useObjectUrl(file?.original);
    const compressedUrl = useObjectUrl(file?.compressed);

    const handleMove = (e) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.pageX || e.touches?.[0].pageX;
        const x = clientX - rect.left - window.scrollX;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    };

    const handleZoom = (delta) => {
        if (!isPro) {
            setShowProLock(true);
            setTimeout(() => setShowProLock(false), 2000);
            return;
        }
        setZoomLevel(prev => Math.max(1, Math.min(5, prev + delta)));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        const handleMoveWindow = (e) => handleMove(e);

        if (isDragging) {
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchend', handleUp);
            window.addEventListener('mousemove', handleMoveWindow);
            window.addEventListener('touchmove', handleMoveWindow);
        }

        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
            window.removeEventListener('mousemove', handleMoveWindow);
            window.removeEventListener('touchmove', handleMoveWindow);
        };
    }, [isDragging]);

    if (!file) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                        {file.original.name}
                    </h3>
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border-color)]">
                        Original: {formatSize(file.original.size)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleZoom(0.5)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleZoom(-0.5)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] transition-colors">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={onReset} className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                </div>
            </div>

            {/* Main Preview Container with Aspect Ratio Lock and Elevation */}
            <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-[var(--bg-secondary)] border-4 border-[var(--card-bg)] shadow-xl group select-none cursor-crosshair transition-all duration-300"
            >
                {/* Compressed Layer (Fades in over original) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <AnimatePresence initial={false}>
                        {compressedUrl ? (
                            <motion.img
                                key={compressedUrl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={compressedUrl}
                                alt="Compressed"
                                className="w-full h-full object-contain transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        ) : originalUrl ? (
                            <motion.img
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={originalUrl}
                                alt="Placeholder"
                                className="w-full h-full object-contain blur-[2px] opacity-50 grayscale transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        ) : null}
                    </AnimatePresence>
                    <div className="absolute bottom-6 right-6 bg-[var(--accent)] text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl border border-white/10 z-20">
                        After {file.compressed && `(${formatSize(file.compressed.size)})`}
                    </div>
                </div>

                {/* Original Layer (Foreground Clipped) */}
                <div
                    className="absolute inset-0 z-10 overflow-hidden border-r-4 border-white shadow-[10px_0_30px_rgba(0,0,0,0.2)]"
                    style={{ width: `${sliderPosition}%` }}
                >
                    {originalUrl && (
                        <img
                            src={originalUrl}
                            alt="Original"
                            className="absolute inset-0 h-full object-contain pointer-events-none transition-transform duration-200"
                            style={{
                                width: `${100 * (100 / sliderPosition)}%`,
                                transform: `scale(${zoomLevel})`,
                                maxWidth: 'none'
                            }}
                        />
                    )}
                    <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl border border-white/10">
                        Before
                    </div>
                </div>

                {/* Slider Handle (Enhanced with circular knob) */}
                <div
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    className="slider-handle"
                    style={{ left: `${sliderPosition}%` }}
                />

                {/* Pro Lock Overlay */}
                <AnimatePresence>
                    {showProLock && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
                            onClick={onOpenPro}
                        >
                            <div className="bg-[var(--card-bg)] p-8 rounded-3xl text-center shadow-2xl border border-[var(--border-color)] max-w-sm mx-4">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <LockIcon className="w-8 h-8 text-amber-600" />
                                </div>
                                <h4 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Pro Feature Unlocked</h4>
                                <p className="text-[var(--text-secondary)] text-sm mb-6">
                                    Zooming in to compare intricate details is a Pro feature. Upgrade to see the difference clearly.
                                </p>
                                <button className="btn-primary w-full shadow-lg shadow-indigo-600/20">Learn More & Upgrade</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Overlay (Smoother transition) */}
                <AnimatePresence>
                    {file.status === 'processing' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white"
                        >
                            <div className="relative w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <p className="font-bold text-white drop-shadow-lg text-sm bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md">
                                Optimizing Precision Details...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Status Badges */}
            <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-2xl font-bold text-sm border border-green-500/10 shadow-sm">
                    <span className="text-lg">✨</span> {file.savings}% Smaller
                </div>
                <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl font-bold text-sm border border-indigo-500/10 shadow-sm">
                    Saved {formatSize(file.original.size - (file.compressed?.size || 0))}
                </div>
            </div>
        </div>
    );
});

export default ComparisonView;
