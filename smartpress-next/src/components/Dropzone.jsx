'use client';

import { useState, useCallback } from 'react';
import {
    CloudUpload,
    Image as ImageIcon,
    FileCheck2,
    Zap,
    ShieldCheck,
    MousePointer2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dropzone({ onUpload }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(Array.from(e.dataTransfer.files));
        }
    }, [onUpload]);

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
          relative group cursor-pointer rounded-[3rem] p-16 border-4 border-dashed transition-all duration-300
          flex flex-col items-center justify-center gap-8
          ${isDragging
                        ? 'bg-indigo-50 border-[var(--accent)] dark:bg-indigo-500/10'
                        : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--accent)] shadow-2xl shadow-indigo-500/5'
                    }
        `}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,.heic"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleChange}
                />

                <div className="relative">
                    <div className="w-24 h-24 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-3xl flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform duration-500">
                        <CloudUpload className="w-12 h-12" />
                    </div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-2 -right-2 bg-[var(--accent)] text-white p-2 rounded-xl shadow-lg"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                    </motion.div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">Drop your images here</h2>
                    <p className="text-lg font-bold text-[var(--text-secondary)] opacity-80">
                        Supports PNG, JPG, WebP, and HEIC.
                        <span className="block text-sm text-[var(--text-muted)] mt-1 uppercase tracking-widest font-black">100% Client-Side Processing.</span>
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="w-full flex items-center justify-center gap-4">
                        <div className="h-px w-20 bg-[var(--border-color)]" />
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">OR</span>
                        <div className="h-px w-20 bg-[var(--border-color)]" />
                    </div>

                    <button className="btn-primary flex items-center gap-3 !px-12 !py-6 !text-lg shadow-xl shadow-indigo-600/20">
                        <MousePointer2 className="w-6 h-6" />
                        Select Files From Computer
                    </button>
                </div>

                {/* Floating Badges */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Zero Bandwidth Cost
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Privacy Guaranteed
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Pro Features (Presets)
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
