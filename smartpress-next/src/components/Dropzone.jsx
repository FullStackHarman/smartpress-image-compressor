'use client';

import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dropzone({ onUpload }) {
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onUpload(files);
    };

    const handleInput = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) onUpload(files);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
                className="glass-card p-12 text-center cursor-pointer border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
            >
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Drop your images here
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Supports PNG, JPG, WebP, and HEIC.
                            <span className="block font-semibold mt-1">100% Client-Side Processing.</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span className="h-[1px] w-12 bg-slate-200 dark:bg-slate-700"></span>
                        OR
                        <span className="h-[1px] w-12 bg-slate-200 dark:bg-slate-700"></span>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        Select Files From Computer
                    </button>
                </div>
                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleInput}
                />
            </div>

            <div className="mt-8 flex justify-center gap-8 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                    Zero Bandwidth Cost
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                    Privacy Guaranteed
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                    Pro Features (Presets)
                </div>
            </div>
        </motion.div>
    );
}
