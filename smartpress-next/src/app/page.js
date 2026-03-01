'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Header from '@/components/Header';
import Dropzone from '@/components/Dropzone';
import ComparisonView from '@/components/ComparisonView';
import Sidebar from '@/components/Sidebar';
import BatchList from '@/components/BatchList';
import SummaryBar from '@/components/SummaryBar';
import { useCompression } from '@/hooks/useCompression';
import { downloadBlob } from '@/utils/helpers';
import JSZip from 'jszip';

export default function Home() {
  const {
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
    compressAll,
    selectAll,
    deselectAll
  } = useCompression();

  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();
    const selectedFiles = files.filter((_, i) => selectedIndices.has(i));

    selectedFiles.forEach((file) => {
      const blob = file.compressed || file.original;
      const name = file.original.name.replace(/\.[^/.]+$/, "") +
        (file.compressed ? `_opt.${file.compressed.type.split('/')[1]}` : "");
      zip.file(name, blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, 'smartpress_optimized.zip');
  }, [files, selectedIndices]);

  return (
    <main className="min-h-screen bg-[var(--bg-secondary)] pb-32 transition-colors duration-500">
      <Header isPro={isPro} onOpenPro={() => setShowProModal(true)} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-12">
            <Dropzone onUpload={handleUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column: Batch List */}
            <div className="lg:col-span-3 h-[calc(100vh-250px)] sticky top-28">
              <BatchList
                files={files}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                selectedIndices={selectedIndices}
                setSelectedIndices={setSelectedIndices}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
              />
            </div>

            {/* Middle Column: Preview */}
            <div className="lg:col-span-6 space-y-8">
              <ComparisonView
                file={files[selectedIndex]}
                onReset={() => setOptions({ ...options, initialQuality: 0.8 })}
                isPro={isPro}
                onOpenPro={() => setShowProModal(true)}
              />
            </div>

            {/* Right Column: Controls */}
            <div className="lg:col-span-3 sticky top-28">
              <Sidebar
                options={options}
                setOptions={setOptions}
                isPro={isPro}
                onOpenPro={() => setShowProModal(true)}
                onCompressAll={compressAll}
                isProcessing={isProcessing}
                batchProgress={batchProgress}
              />
            </div>

          </div>
        )}
      </div>

      <SummaryBar
        files={files}
        selectedIndices={selectedIndices}
        onDownload={handleDownloadZip}
        onRemove={removeSelected}
        isProcessing={isProcessing}
      />

      {/* Pro Upgrade Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[var(--card-bg)] w-full max-w-xl rounded-[3rem] p-12 relative overflow-hidden shadow-2xl border border-[var(--border-color)]"
          >
            {/* Modal Content */}
            <div className="relative z-10 text-center space-y-8 text-[var(--text-primary)]">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto">
                <Zap className="w-10 h-10 text-indigo-600 fill-indigo-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Level up your workflow</h2>
                <p className="text-[var(--text-secondary)] font-bold opacity-80">Join 5,000+ creators optimizing with SmartPress Pro.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                {['Unlimited Batch Downloads', 'Premium Platform Presets', 'HEIC & RAW Support', 'Zero File Size Limits', 'Advanced Aspect Locking', 'No Compression Delay'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/40" /> {f}
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <button
                  onClick={() => { setIsPro(true); setShowProModal(false); }}
                  className="btn-primary w-full !py-6 !text-xl shadow-2xl shadow-indigo-600/40"
                >
                  Get Lifetime Access - $9
                </button>
                <button
                  onClick={() => setShowProModal(false)}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Modal Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -ml-32 -mb-32" />
          </motion.div>
        </div>
      )}
    </main>
  );
}
