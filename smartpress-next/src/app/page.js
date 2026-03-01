'use client';

import { useState, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Dropzone from '@/components/Dropzone';
import ComparisonView from '@/components/ComparisonView';
import Sidebar from '@/components/Sidebar';
import BatchList from '@/components/BatchList';
import SummaryBar from '@/components/SummaryBar';
import { useCompression } from '@/hooks/useCompression';
import { AnimatePresence, motion } from 'framer-motion';
import JSZip from 'jszip';

export default function Home() {
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const {
    files,
    selectedIndex,
    setSelectedIndex,
    selectedIndices,
    setSelectedIndices,
    options,
    setOptions,
    isProcessing,
    handleUpload,
    removeSelected,
    compressFile
  } = useCompression();

  // Stable callbacks for children to prevent unnecessary re-renders of memoized components
  const handleOpenPro = useCallback(() => setShowProModal(true), []);
  const handleClosePro = useCallback(() => setShowProModal(false), []);
  const handleResetCurrent = useCallback(() => setSelectedIndex(null), [setSelectedIndex]);
  const handleUpgradeToPro = useCallback(() => {
    setIsPro(true);
    setShowProModal(false);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (selectedIndices.size === 0) return;

    const zip = new JSZip();
    const indices = Array.from(selectedIndices);

    for (const idx of indices) {
      const file = files[idx];
      if (file.compressed) {
        const ext = options.fileType === 'original' ? file.original.name.split('.').pop() : options.fileType;
        const name = file.original.name.split('.').slice(0, -1).join('.') + '_compressed.' + ext;
        zip.file(name, file.compressed);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartPress_Batch_${selectedIndices.size}_Images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [files, selectedIndices, options.fileType]);

  const selectedFile = useMemo(() => files[selectedIndex], [files, selectedIndex]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isPro={isPro} onOpenPro={handleOpenPro} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[70vh] flex items-center justify-center"
            >
              <Dropzone onUpload={handleUpload} />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32"
            >
              {/* Left Column: Editor & Batch */}
              <div className="lg:col-span-8 space-y-8">
                <div className="glass-card p-8 min-h-[500px] flex flex-col items-stretch">
                  <ComparisonView
                    file={selectedFile}
                    onReset={handleResetCurrent}
                    isPro={isPro}
                    onOpenPro={handleOpenPro}
                  />
                </div>

                <div className="h-96">
                  <BatchList
                    files={files}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    selectedIndices={selectedIndices}
                    setSelectedIndices={setSelectedIndices}
                  />
                </div>
              </div>

              {/* Right Column: Controls */}
              <div className="lg:col-span-4 sticky top-28">
                <Sidebar
                  options={options}
                  setOptions={setOptions}
                  isPro={isPro}
                  onOpenPro={handleOpenPro}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SummaryBar
        files={files}
        selectedIndices={selectedIndices}
        onDownload={handleDownloadAll}
        onRemove={removeSelected}
      />

      {/* Pro Modal Placeholder */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePro}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 cursor-pointer text-slate-400 hover:text-slate-600" onClick={handleClosePro}>
                ✕
              </div>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/20">
                  <ZapIcon className="w-10 h-10 fill-white" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">SmartPress Pro</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Unlock the full power of client-side optimization.</p>

                <div className="grid grid-cols-1 gap-4 text-left py-6">
                  {[
                    'Unlimited Batch Downloads',
                    'All Platform Presets (Instagram, Shopify, etc.)',
                    'Precision Detail Zooming',
                    'Priority Force-Size Engine',
                    'Lifetime Updates & Support'
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-3 font-bold text-sm text-slate-700 dark:text-slate-200">
                      <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-2xl font-black text-slate-800 dark:text-white">$9.00 <span className="text-xs text-slate-400 font-normal">USD / Lifetime</span></p>
                  <button
                    onClick={handleUpgradeToPro}
                    className="btn-primary w-full mt-4 shadow-indigo-600/20"
                  >
                    Upgrade Now
                  </button>
                  <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Secure Checkout via PayPal</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Minimal icons for the modal in this file just in case
function ZapIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

function CheckCircle2Icon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
