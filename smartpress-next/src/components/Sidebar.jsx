'use client';

import {
    ShieldCheck,
    Settings2,
    ChevronRight,
    Lock,
    Zap,
    CheckCircle2,
    Trash2,
    Maximize,
    Play,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
    { id: 'instagram', label: 'Insta', icon: '📸', color: 'from-purple-500 to-pink-500', width: 1080, quality: 0.85, format: 'jpeg' },
    { id: 'shopify', label: 'Shopify', icon: '🛍️', color: 'from-green-500 to-emerald-600', width: 2048, quality: 0.8, format: 'webp' },
    { id: 'whatsapp', label: 'WA', icon: '💬', color: 'from-emerald-500 to-green-600', width: 800, quality: 0.6, format: 'jpeg' },
    { id: 'wordpress', label: 'WP', icon: '🌐', color: 'from-blue-500 to-indigo-600', width: 1200, quality: 0.75, format: 'webp' },
    { id: 'email', label: 'Email', icon: '📧', color: 'from-amber-400 to-orange-500', width: 600, quality: 0.6, format: 'jpeg' },
];

export default function Sidebar({
    options,
    setOptions,
    isPro,
    onOpenPro,
    onCompressAll,
    isProcessing,
    batchProgress
}) {
    const handlePreset = (preset) => {
        if (!isPro) {
            onOpenPro();
            return;
        }
        setOptions(prev => ({
            ...prev,
            initialQuality: preset.quality,
            maxWidthOrHeight: preset.width,
            fileType: preset.format,
            alwaysKeepResolution: false,
        }));
    };

    return (
        <aside className="w-full lg:w-96 flex flex-col gap-6">
            {/* Privacy Badge */}
            <div className="bg-indigo-600/10 dark:bg-indigo-500/10 rounded-3xl p-4 border border-indigo-500/20 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Privacy Shield</p>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">100% Client-Side Processing</h4>
                </div>
            </div>

            {/* Batch Action Section */}
            <div className="glass-card p-6 space-y-4">
                <button
                    onClick={onCompressAll}
                    disabled={isProcessing}
                    className="btn-primary w-full !py-4 shadow-xl shadow-indigo-500/20 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    Compressing {batchProgress.current}/{batchProgress.total}
                                </span>
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black uppercase tracking-widest">Compress All Selected</span>
                            </>
                        )}
                    </div>
                </button>

                {isProcessing && (
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                className="h-full bg-[var(--accent)]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Quality Controls */}
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-600" /> Optimization
                    </h3>
                </div>

                {/* Quality Slider */}
                <div className={`space-y-4 ${options.forceSize ? 'opacity-40 pointer-events-none' : 'transition-opacity'}`}>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-[var(--text-muted)] uppercase tracking-widest text-[10px]">Quality</span>
                        <span className="text-indigo-600">{Math.round(options.initialQuality * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={options.initialQuality * 100}
                        onChange={(e) => setOptions(prev => ({ ...prev, initialQuality: e.target.value / 100 }))}
                        className="w-full accent-indigo-600 h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Target Size Priority */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                            Target Max Size (MB)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Force Size:</span>
                            <button
                                onClick={() => setOptions(prev => ({ ...prev, forceSize: !prev.forceSize }))}
                                className={`w-10 h-5 rounded-full transition-all relative ${options.forceSize ? 'bg-indigo-600 shadow-md shadow-indigo-500/40' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${options.forceSize ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 0.5"
                        value={options.maxSizeMB}
                        onChange={(e) => setOptions(prev => ({ ...prev, maxSizeMB: parseFloat(e.target.value) || 0 }))}
                        className="input-base text-sm"
                    />
                    {options.forceSize && (
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
                            ⚠️ Overriding Quality Slider
                        </p>
                    )}
                </div>

                {/* Target Format */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">Output Format</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['original', 'webp', 'jpeg', 'png'].map((format) => (
                            <button
                                key={format}
                                onClick={() => setOptions(prev => ({ ...prev, fileType: format }))}
                                className={`btn-secondary !py-2 !text-[10px] !rounded-xl border-2 transition-all ${options.fileType === format ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-black' : 'border-transparent'}`}
                            >
                                {format === 'original' ? 'Keep Original' : format.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Platform Presets */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Platform Presets
                    </h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pro Only</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handlePreset(preset)}
                            className="relative group flex flex-col items-center gap-1.5"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${preset.color} rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform ${!isPro ? 'grayscale opacity-70' : ''}`}>
                                {preset.icon}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                                {preset.label}
                            </span>
                            {!isPro && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-white bg-slate-900 rounded-full p-0.5 shadow-sm" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upgrade Pro Banner (Enhanced) */}
            {!isPro && (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/40 relative overflow-hidden group cursor-pointer border border-white/10" onClick={onOpenPro}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-black text-lg tracking-tight">Unlock SmartPress Pro <span className="text-indigo-200">✨</span></h4>
                            <Zap className="w-5 h-5 fill-indigo-300 text-indigo-300" />
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 opacity-90">
                            {['No File Size Limit', 'All Platform Presets', 'Batch Priority Engine'].map(f => (
                                <div key={f} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3 text-indigo-300" /> {f}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-black tracking-tighter">$9 <span className="text-[10px] font-medium opacity-70">/ lifetime</span></span>
                            <div className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                                Upgrade Now
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
