'use client';

import { useState, useMemo } from 'react';
import {
    Zap,
    Layers,
    Maximize2,
    Smartphone,
    Image as ImageIcon,
    CheckCircle2,
    Info,
    TrendingDown,
    Loader2,
    Crown,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/utils/helpers';

const PRESETS = [
    { id: 'insta', name: 'Instagram', icon: Smartphone, width: 1080, height: 1350 },
    { id: 'shopify', name: 'Shopify', icon: ImageIcon, width: 2048, height: 2048 },
    { id: 'pwa', name: 'PWA Icon', icon: Layers, width: 512, height: 512 },
];

export default function Sidebar({
    options,
    setOptions,
    isPro,
    onOpenPro,
    onCompressAll,
    isProcessing,
    batchProgress,
    selectedCount
}) {
    const [hoveredQuality, setHoveredQuality] = useState(false);

    const buttonText = useMemo(() => {
        if (isProcessing) return `Compressing ${batchProgress.current}/${batchProgress.total}`;
        if (selectedCount === 0) return "Select Images";
        if (selectedCount === 1) return "Compress Selected";
        return `Compress ${selectedCount} Images`;
    }, [isProcessing, batchProgress, selectedCount]);

    // Simple estimation logic for UI feedback
    const estimatedOutput = useMemo(() => {
        const qualityFactor = options.initialQuality;
        const formatFactor = options.fileType === 'webp' ? 0.7 : 1.0;
        return `~${(qualityFactor * formatFactor * 1.2).toFixed(1)} MB avg`;
    }, [options.initialQuality, options.fileType]);

    return (
        <aside className="w-full space-y-8">

            {/* Main Action Component */}
            <div className="glass-card p-6 space-y-6 bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-secondary)] border-2 border-[var(--accent)]/10">
                <div className="space-y-4">
                    <button
                        onClick={onCompressAll}
                        disabled={isProcessing || selectedCount === 0}
                        className={`btn-primary w-full !py-6 !text-lg !rounded-2xl shadow-2xl relative overflow-hidden group ${isProcessing ? 'animate-pulse' : ''}`}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <TrendingDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="font-black tracking-tight">{buttonText}</span>

                        {/* Progress Bar Overlay */}
                        {isProcessing && (
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-white/40"
                                initial={{ width: 0 }}
                                animate={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            />
                        )}
                    </button>

                    {selectedCount > 0 && !isProcessing && (
                        <p className="text-[10px] font-black text-center text-[var(--text-muted)] uppercase tracking-widest animate-fade-in">
                            Auto-recompressing on changes
                        </p>
                    )}
                </div>

                <div className="h-px bg-[var(--border-color)]" />

                {/* Quality Control */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-2">
                            Compression Power
                        </label>
                        <div className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-black rounded-lg">
                            {Math.round(options.initialQuality * 100)}%
                        </div>
                    </div>

                    <div className="relative pt-6">
                        {/* Quality Tooltip */}
                        <AnimatePresence>
                            {(hoveredQuality || isProcessing) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -top-4 left-[var(--quality-percent)] -translate-x-1/2 bg-[var(--accent)] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-xl z-20"
                                    style={{ '--quality-percent': `${options.initialQuality * 100}%` }}
                                >
                                    {Math.round(options.initialQuality * 100)}%
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.01"
                            value={options.initialQuality}
                            onMouseEnter={() => setHoveredQuality(true)}
                            onMouseLeave={() => setHoveredQuality(false)}
                            onChange={(e) => setOptions({ ...options, initialQuality: parseFloat(e.target.value) })}
                            className="quality-slider w-full"
                        />
                        <div className="flex justify-between mt-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            <span>Smaller File</span>
                            <span>Better Quality</span>
                        </div>
                    </div>

                    {/* Estimated Preview */}
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Estimated Output</span>
                        </div>
                        <span className="text-xs font-black text-[var(--accent)]">{estimatedOutput}</span>
                    </div>
                </div>
            </div>

            {/* Presets & Formats */}
            <div className="glass-card p-6 space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 block">Output Format</label>
                    <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                        {['original', 'jpeg', 'webp', 'png'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setOptions({ ...options, fileType: type })}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${options.fileType === type
                                    ? 'bg-[var(--accent)] text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block">Platform Presets</label>
                    <div className="grid grid-cols-1 gap-2">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                disabled={!isPro}
                                onClick={() => setOptions({ ...options, maxWidthOrHeight: preset.width, alwaysKeepResolution: false })}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all group ${!isPro ? 'opacity-50 grayscale' : 'hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
                                    } ${options.maxWidthOrHeight === preset.width ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-color)]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--bg-secondary)] rounded-lg group-hover:bg-white transition-colors">
                                        <preset.icon className="w-4 h-4 text-[var(--text-secondary)]" />
                                    </div>
                                    <div className="text-left font-bold text-xs">{preset.name}</div>
                                </div>
                                {!isPro && <Lock className="w-3 h-3 text-[var(--text-muted)]" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pro Conversion Section - Optimized UI */}
            {!isPro && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card !bg-indigo-600 p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/40"
                >
                    <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 bg-white/10 px-3 py-1 rounded-full">Limited Early Access Price</span>
                            <h3 className="text-3xl font-black tracking-tighter">Lifetime Access</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {['Unlimited Batch Mode', 'Premium Platform Presets', 'Batch Priority Engine'].map((feat) => (
                                <div key={feat} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    {feat}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black">$9</span>
                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">One-time payment</span>
                        </div>

                        <button
                            onClick={onOpenPro}
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl transition-all active:scale-95 group-hover:bg-indigo-50"
                        >
                            Unlock Everything
                        </button>
                    </div>

                    {/* Pro Banner Decorations */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-indigo-400 rounded-full blur-3xl opacity-50" />
                    <Crown className="absolute top-4 right-4 w-12 h-12 text-white/10 rotate-12 group-hover:rotate-0 transition-all duration-500" />
                </motion.div>
            )}

        </aside>
    );
}
