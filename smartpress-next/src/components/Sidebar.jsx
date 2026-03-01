'use client';

import {
    ShieldCheck,
    Settings2,
    ChevronRight,
    Lock,
    Zap,
    CheckCircle2,
    Trash2,
    Maximize
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    onOpenPro
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
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">100% Client-Side Processing</h4>
                </div>
            </div>

            {/* Platform Presets */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Platform Presets
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
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                                {preset.label}
                            </span>
                            {!isPro && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-slate-800 bg-white rounded-full p-0.5 shadow-sm" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quality Controls */}
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-600" /> Optimization
                    </h3>
                </div>

                {/* Quality Slider */}
                <div className={`space-y-4 ${options.forceSize ? 'opacity-40 pointer-events-none' : 'transition-opacity'}`}>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Quality</span>
                        <span className="text-indigo-600">{Math.round(options.initialQuality * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={options.initialQuality * 100}
                        onChange={(e) => setOptions(prev => ({ ...prev, initialQuality: e.target.value / 100 }))}
                        className="w-full accent-indigo-600"
                    />
                </div>

                {/* Target Size Priority */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            Target Max Size (MB)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Force Size:</span>
                            <button
                                onClick={() => setOptions(prev => ({ ...prev, forceSize: !prev.forceSize }))}
                                className={`w-10 h-5 rounded-full transition-all relative ${options.forceSize ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
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
                        onChange={(e) => setOptions(prev => ({ ...prev, maxSizeMB: parseFloat(e.target.value) }))}
                        className="input-base text-sm"
                    />
                    {options.forceSize && (
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider animate-pulse">
                            ⚠️ Overriding Quality Slider
                        </p>
                    )}
                </div>

                {/* Target Format */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Output Format</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['original', 'webp', 'jpeg', 'png'].map((format) => (
                            <button
                                key={format}
                                onClick={() => setOptions(prev => ({ ...prev, fileType: format }))}
                                className={`btn-secondary !py-2 !text-[10px] !rounded-xl border-2 transition-all ${options.fileType === format ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'border-transparent'}`}
                            >
                                {format === 'original' ? 'Keep Original' : format.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resize Controls */}
            <div className="glass-card p-6 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Maximize className="w-4 h-4 text-indigo-600 rotate-45" /> Resize Image
                    </h3>
                    <input
                        type="checkbox"
                        checked={!options.alwaysKeepResolution}
                        onChange={() => setOptions(prev => ({ ...prev, alwaysKeepResolution: !prev.alwaysKeepResolution }))}
                        className="w-4 h-4 accent-indigo-600"
                    />
                </label>

                {!options.alwaysKeepResolution && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-3 gap-2">
                            {[75, 50, 25].map(pct => (
                                <button
                                    key={pct}
                                    onClick={() => {/* logic moved to hook or central page */ }}
                                    className="btn-secondary !py-2 !text-[10px] !rounded-xl"
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Width (px)</label>
                                <input
                                    type="number"
                                    placeholder="px"
                                    className="input-base !py-2 !text-xs"
                                    value={options.maxWidthOrHeight}
                                    onChange={(e) => setOptions(prev => ({ ...prev, maxWidthOrHeight: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Height (px)</label>
                                <input
                                    type="number"
                                    placeholder="px"
                                    className="input-base !py-2 !text-xs opacity-50"
                                    disabled
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.lockAspect}
                                onChange={() => setOptions(prev => ({ ...prev, lockAspect: !prev.lockAspect }))}
                                className="w-3 h-3 accent-indigo-600"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Lock Aspect Ratio
                            </span>
                        </label>
                    </motion.div>
                )}
            </div>

            {/* Upgrade Pro Banner */}
            {!isPro && (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden group cursor-pointer" onClick={onOpenPro}>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    <h4 className="font-bold relative z-10">Go Pro <span className="text-indigo-200">✨</span></h4>
                    <p className="text-[10px] text-indigo-100 font-medium mt-1 relative z-10">Get unlimited downloads & platform presets.</p>
                    <div className="mt-4 flex items-center justify-between relative z-10">
                        <span className="text-xl font-bold tracking-tighter">$9 <span className="text-xs font-medium">/ lifetime</span></span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            )}
        </aside>
    );
}
