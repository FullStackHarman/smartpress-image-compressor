'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getFileExtension } from '@/utils/helpers';

const DEFAULT_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    alwaysKeepResolution: true,
    fileType: 'original', // 'original', 'jpeg', 'webp'
    lockAspect: true,
    forceSize: false,
};

export function useCompression() {
    const [files, setFiles] = useState([]); // [{ original, compressed, id, status, savings }]
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const [isProcessing, setIsProcessing] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

    const timeoutRef = useRef(null);
    const filesRef = useRef(files);

    // Sync ref with state for stable callbacks
    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    const updateFile = useCallback((index, updates) => {
        setFiles(prev => {
            const next = [...prev];
            if (!next[index]) return prev;
            next[index] = { ...next[index], ...updates };
            return next;
        });
    }, []);

    const compressFile = useCallback(async (index, currentOptions) => {
        const fileData = filesRef.current[index];
        if (!fileData || !fileData.original) return;

        updateFile(index, { status: 'processing' });

        try {
            const imageCompression = (await import('browser-image-compression')).default;

            const compressionOptions = {
                maxSizeMB: currentOptions.maxSizeMB || 10,
                maxWidthOrHeight: currentOptions.alwaysKeepResolution ? undefined : currentOptions.maxWidthOrHeight,
                useWebWorker: true,
                initialQuality: currentOptions.forceSize ? 0.5 : currentOptions.initialQuality,
                fileType: currentOptions.fileType === 'original' ? fileData.original.type : `image/${currentOptions.fileType}`
            };

            const compressedBlob = await imageCompression(fileData.original, compressionOptions);
            const savings = Math.round(((fileData.original.size - compressedBlob.size) / fileData.original.size) * 100);

            updateFile(index, {
                compressed: compressedBlob,
                status: 'success',
                savings
            });
            return true;
        } catch (error) {
            console.error('Compression error:', error);
            updateFile(index, { status: 'error' });
            return false;
        }
    }, [updateFile]);

    const compressAll = useCallback(async () => {
        const selected = Array.from(selectedIndices);
        if (selected.length === 0) return;

        setIsProcessing(true);
        setBatchProgress({ current: 0, total: selected.length });

        for (let i = 0; i < selected.length; i++) {
            const index = selected[i];
            setBatchProgress(prev => ({ ...prev, current: i + 1 }));
            await compressFile(index, options);
        }

        setIsProcessing(false);
        setBatchProgress({ current: 0, total: 0 });
    }, [selectedIndices, options, compressFile]);

    const handleUpload = useCallback(async (newFiles) => {
        const normalized = [];
        const heic2any = (await import('heic2any')).default;

        for (const file of newFiles) {
            let original = file;
            if (getFileExtension(file.name).toLowerCase() === 'heic') {
                try {
                    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                    original = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
                } catch (e) {
                    console.error('HEIC conversion failed', e);
                }
            }
            normalized.push({
                original,
                compressed: null,
                id: Math.random().toString(36).substr(2, 9),
                status: 'idle',
                savings: 0
            });
        }

        const startIndex = filesRef.current.length;
        setFiles(prev => [...prev, ...normalized]);
        setSelectedIndex(startIndex);

        setSelectedIndices(prev => {
            const next = new Set(prev);
            normalized.forEach((_, i) => next.add(startIndex + i));
            return next;
        });
    }, []);

    // Debounced auto-compression
    useEffect(() => {
        if (selectedIndex === null || filesRef.current.length === 0 || isProcessing) return;

        const currentFile = filesRef.current[selectedIndex];
        if (!currentFile) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            compressFile(selectedIndex, options);
        }, 500);

        return () => clearTimeout(timeoutRef.current);
    }, [options, selectedIndex, compressFile, isProcessing]);

    const removeSelected = useCallback(() => {
        setFiles(prev => prev.filter((_, i) => !selectedIndices.has(i)));
        setSelectedIndices(new Set());
        setSelectedIndex(null);
    }, [selectedIndices]);

    const selectAll = useCallback(() => {
        setSelectedIndices(new Set(files.keys()));
    }, [files.length]);

    const deselectAll = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const clearAll = useCallback(() => {
        setFiles([]);
        setSelectedIndex(null);
        setSelectedIndices(new Set());
    }, []);

    return {
        files,
        selectedIndex,
        setSelectedIndex,
        selectedIndices,
        setSelectedIndices,
        options,
        setOptions,
        isProcessing,
        batchProgress,
        handleUpload,
        removeSelected,
        compressFile,
        compressAll,
        selectAll,
        deselectAll,
        clearAll
    };
}
