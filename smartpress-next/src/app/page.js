'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Crown, Sparkles, X } from 'lucide-react';
import Header from '@/components/Header';
import Dropzone from '@/components/Dropzone';
import ComparisonView from '@/components/ComparisonView';
import Sidebar from '@/components/Sidebar';
import BatchList from '@/components/BatchList';
import SummaryBar from '@/components/SummaryBar';
import { useCompression } from '@/hooks/useCompression';
import { downloadBlob } from '@/utils/helpers';
import JSZip from 'jszip';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import confetti from 'canvas-confetti';

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
    deselectAll,
    clearAll
  } = useCompression();

  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Persistence and Mounting
  useEffect(() => {
    setIsMounted(true);
    const savedPro = localStorage.getItem('smartpress_pro_v1');
    if (savedPro === 'true') {
      setIsPro(true);
    }
  }, []);

  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  const handleProSuccess = useCallback(() => {
    setIsPro(true);
    localStorage.setItem('smartpress_pro_v1', 'true');
    setShowProModal(false);
    triggerConfetti();
  }, [triggerConfetti]);

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

  if (!isMounted) return null;

  return (
    <PayPalScriptProvider options={{ "client-id": "test", intent: "capture", currency: "USD" }}>
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
                  onClearAll={clearAll}
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
                  selectedCount={selectedIndices.size}
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

        {/* Pro Upgrade Modal - Conversion Optimized */}
        <AnimatePresence>
          {showProModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--card-bg)] w-full max-w-xl rounded-[3rem] relative overflow-hidden shadow-2xl border-4 border-[var(--accent)]/10"
              >
                {/* Modal Header Decoration */}
                <div className="h-40 bg-indigo-600 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-indigo-400 to-transparent scale-150" />
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30"
                  >
                    <Crown className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>
                </div>

                <button
                  onClick={() => setShowProModal(false)}
                  className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Body */}
                <div className="p-12 text-center space-y-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full inline-block">Limited Early Access Price</span>
                    <h2 className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">Unlock Pro Status</h2>
                    <p className="text-[var(--text-secondary)] font-bold opacity-80">One-time payment. Lifetime access. Zero file limits.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-left">
                    {[
                      { t: 'Unlimited Batch Mode', d: 'Process hundreds of images at once' },
                      { t: 'Premium Platform Presets', d: 'Perfectly sized for Insta, Shopify, and more' },
                      { t: 'Batch Priority Engine', d: 'High-speed optimization in the background' }
                    ].map(f => (
                      <div key={f.t} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:border-indigo-200 transition-all">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[var(--text-primary)]">{f.t}</h4>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{f.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="relative z-[201] min-h-[150px]">
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "pill", label: "checkout", height: 55 }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: { value: "9.00" },
                                description: "SmartPress Pro Lifetime Access",
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order.capture();
                          handleProSuccess();
                        }}
                      />
                    </div>

                    <button
                      onClick={() => setShowProModal(false)}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>

                {/* Success Sparkle Decorations */}
                <Sparkles className="absolute bottom-10 right-10 w-24 h-24 text-indigo-500/5 rotate-12" />
                <Sparkles className="absolute top-10 left-10 w-24 h-24 text-indigo-500/5 -rotate-12" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </PayPalScriptProvider>
  );
}
