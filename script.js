/**
 * SmartPress | Privacy-First Image Compressor
 * Core Logic - v1.0.0
 */

// --- State Management ---
let state = {
    originalFiles: [], // Array of File objects
    selectedIndices: new Set(), // Set of selected indices
    currentFileIndex: 0,
    compressedBlobs: new Map(), // Map of index -> compressed Blob
    options: {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8,
        alwaysKeepResolution: true,
        fileType: 'original' // 'original', 'jpeg', 'webp'
    },
    isProcessing: false,
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    isPro: false,
    activePreset: null,
    zoomLevel: 1 // For comparison view
};

// --- DOM Elements ---
const elements = {
    // Comparison
    comparisonContainer: document.getElementById('comparisonContainer'),
    originalWrapper: document.getElementById('originalWrapper'),
    originalZoomWrapper: document.getElementById('originalZoomWrapper'),
    compressedWrapper: document.getElementById('compressedWrapper'),
    sliderHandle: document.getElementById('sliderHandle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    zoomProLock: document.getElementById('zoomProLock'),

    // Batch
    batchContainer: document.getElementById('batchContainer'),
    batchList: document.getElementById('batchList'),
    batchCountBadge: document.getElementById('batchCountBadge'),
    batchProLimit: document.getElementById('batchProLimit'),
    selectAll: document.getElementById('selectAll'),
    removeSelectedBtn: document.getElementById('removeSelectedBtn'),

    // Controls
    qualityControl: document.getElementById('qualityControl'),
    qualityRange: document.getElementById('qualityRange'),
    qualityVal: document.getElementById('qualityVal'),
    sizePriorityToggle: document.getElementById('sizePriorityToggle'),
    maxSizeMB: document.getElementById('maxSizeMB'),
    targetConflictText: document.getElementById('targetConflictText'),
    formatBtns: document.querySelectorAll('.format-btn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    resizeToggle: document.getElementById('resizeToggle'),
    resizeInputs: document.getElementById('resizeInputs'),
    resizePctBtns: document.querySelectorAll('.resize-pct-btn'),
    maxWidth: document.getElementById('maxWidth'),
    maxHeight: document.getElementById('maxHeight'),
    lockAspect: document.getElementById('lockAspect'),

    // Summary Bar
    summaryBar: document.getElementById('summaryBar'),
    summarySelectedCount: document.getElementById('summarySelectedCount'),
    summaryOriginalTotal: document.getElementById('summaryOriginalTotal'),
    summaryCompressedTotal: document.getElementById('summaryCompressedTotal'),
    summarySavedTotal: document.getElementById('summarySavedTotal'),
    summarySavingsPercent: document.getElementById('summarySavingsPercent'),
    summaryDownloadBtn: document.getElementById('summaryDownloadBtn'),

    // Modals & Other
    proModal: document.getElementById('proModal'),
    openProModal: document.getElementById('openProModal'),
    closeProModal: document.getElementById('closeProModal'),
    currentFileName: document.getElementById('currentFileName'),
    processingOverlay: document.getElementById('processingOverlay'),
    originalImg: document.getElementById('originalImg'),
    compressedImg: document.getElementById('compressedImg'),
    originalSize: document.getElementById('originalSize'),
    compressedSize: document.getElementById('compressedSize'),
    savingsBadge: document.getElementById('savingsBadge'),
    themeToggle: document.getElementById('themeToggle'),
    resetBtn: document.getElementById('resetBtn'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    uploadSection: document.getElementById('uploadSection'),
    editorSection: document.getElementById('editorSection')
};

// --- Initialization ---
function init() {
    setupEventListeners();
    applyTheme();
    initPayPal();

    // Check if system-wide theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        state.isDark = e.matches;
        applyTheme();
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    // Theme
    elements.themeToggle.addEventListener('click', () => {
        state.isDark = !state.isDark;
        applyTheme();
    });

    // File Upload
    elements.dropzone.addEventListener('click', () => elements.fileInput.click());
    elements.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropzone.classList.add('border-primary', 'bg-primary/5');
    });
    elements.dropzone.addEventListener('dragleave', () => {
        elements.dropzone.classList.remove('border-primary', 'bg-primary/5');
    });
    elements.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropzone.classList.remove('border-primary', 'bg-primary/5');
        handleFiles(e.dataTransfer.files);
    });
    elements.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Controls - Auto-compression with debounce
    elements.qualityRange.addEventListener('input', (e) => {
        const val = e.target.value;
        elements.qualityVal.innerText = `${val}%`;
        state.options.initialQuality = val / 100;
        debouncedCompress();
    });

    elements.sizePriorityToggle.addEventListener('change', updateTargetConflict);

    elements.maxSizeMB.addEventListener('input', (e) => {
        state.options.maxSizeMB = parseFloat(e.target.value) || 0;
        debouncedCompress();
    });

    elements.formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.options.fileType = btn.dataset.format;
            debouncedCompress();
        });
    });

    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => handlePreset(btn.dataset.preset));
    });

    elements.resizeToggle.addEventListener('change', (e) => {
        const checked = e.target.checked;
        state.options.alwaysKeepResolution = !checked;
        if (checked) {
            elements.resizeInputs.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            elements.resizeInputs.classList.add('opacity-50', 'pointer-events-none');
        }
        debouncedCompress();
    });

    elements.resizePctBtns.forEach(btn => {
        btn.addEventListener('click', () => handleResizePct(parseInt(btn.dataset.resizePct)));
    });

    elements.maxWidth.addEventListener('input', () => {
        if (state.options.lockAspect) syncHeightFromWidth();
        debouncedCompress();
    });

    elements.maxHeight.addEventListener('input', () => {
        if (state.options.lockAspect) syncWidthFromHeight();
        debouncedCompress();
    });

    elements.lockAspect.addEventListener('change', (e) => {
        state.options.lockAspect = e.target.checked;
    });

    // Comparison Actions
    elements.fullscreenToggle.addEventListener('click', toggleFullscreen);

    // Batch Selection Actions
    elements.selectAll.addEventListener('change', (e) => {
        if (e.target.checked) {
            state.originalFiles.forEach((_, i) => state.selectedIndices.add(i));
        } else {
            state.selectedIndices.clear();
        }
        renderBatchList();
        updateSummary();
    });

    elements.removeSelectedBtn.addEventListener('click', removeSelected);
    elements.summaryDownloadBtn.addEventListener('click', () => downloadBatch(state.selectedIndices));

    // Modals
    elements.openProModal.addEventListener('click', () => {
        elements.proModal.classList.remove('hidden');
    });
    elements.closeProModal.addEventListener('click', () => {
        elements.proModal.classList.add('hidden');
    });
    elements.proModal.addEventListener('click', (e) => {
        if (e.target === elements.proModal) elements.proModal.classList.add('hidden');
    });

    // Global Actions
    elements.resetBtn.addEventListener('click', resetAll);

    // Initial Setup
    setupSlider();
}

function setupSlider() {
    let isDragging = false;

    const move = (e) => {
        if (!isDragging) return;
        const rect = elements.comparisonContainer.getBoundingClientRect();
        const x = (e.pageX || e.touches?.[0].pageX) - rect.left - window.scrollX;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

        elements.originalWrapper.style.width = `${percent}%`;
        elements.sliderHandle.style.left = `${percent}%`;
    };

    const start = () => isDragging = true;
    const end = () => isDragging = false;

    elements.sliderHandle.addEventListener('mousedown', start);
    elements.sliderHandle.addEventListener('touchstart', start);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);

    // Zoom Logic (Pro)
    elements.comparisonContainer.addEventListener('wheel', (e) => {
        if (!state.isPro) {
            if (Math.abs(e.deltaY) > 10) {
                elements.zoomProLock.classList.remove('hidden');
                setTimeout(() => elements.zoomProLock.classList.add('hidden'), 2000);
            }
            return;
        }
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        state.zoomLevel = Math.max(1, Math.min(5, state.zoomLevel + delta));

        const transform = `scale(${state.zoomLevel})`;
        elements.originalZoomWrapper.style.transform = transform;
        elements.compressedWrapper.style.transform = transform;
    });
}

// --- Handlers ---

function updateTargetConflict() {
    const forceSize = elements.sizePriorityToggle.checked;
    if (forceSize) {
        elements.qualityControl.classList.add('opacity-50', 'pointer-events-none');
        elements.targetConflictText.classList.remove('hidden');
    } else {
        elements.qualityControl.classList.remove('opacity-50', 'pointer-events-none');
        elements.targetConflictText.classList.add('hidden');
    }
    debouncedCompress();
}

function handlePreset(preset) {
    if (!state.isPro) {
        elements.proModal.classList.remove('hidden');
        return;
    }

    state.activePreset = preset;
    elements.presetBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.preset === preset));

    // Preset logic
    const presets = {
        instagram: { quality: 0.85, format: 'jpeg', width: 1080 },
        shopify: { quality: 0.8, format: 'webp', width: 2048 },
        whatsapp: { quality: 0.6, format: 'jpeg', width: 800 },
        wordpress: { quality: 0.75, format: 'webp', width: 1200 },
        email: { quality: 0.6, format: 'jpeg', width: 600 }
    };

    const config = presets[preset];
    if (config) {
        state.options.initialQuality = config.quality;
        elements.qualityRange.value = config.quality * 100;
        elements.qualityVal.innerText = `${Math.round(config.quality * 100)}%`;

        state.options.fileType = config.format;
        elements.formatBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.format === config.format));

        elements.resizeToggle.checked = true;
        state.options.alwaysKeepResolution = false;
        elements.resizeInputs.classList.remove('opacity-50', 'pointer-events-none');
        elements.maxWidth.value = config.width;
        state.options.maxWidthOrHeight = config.width;

        debouncedCompress();
    }
}

function handleResizePct(pct) {
    const file = state.originalFiles[state.currentFileIndex];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const w = Math.round(img.width * (pct / 100));
        const h = Math.round(img.height * (pct / 100));
        elements.maxWidth.value = w;
        elements.maxHeight.value = h;
        state.options.maxWidthOrHeight = Math.max(w, h);
        debouncedCompress();
    };
    img.src = URL.createObjectURL(file);

    elements.resizePctBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.resizePct) === pct);
    });
}

function syncHeightFromWidth() {
    const file = state.originalFiles[state.currentFileIndex];
    if (!file || !elements.maxWidth.value) return;

    const img = new Image();
    img.onload = () => {
        const ratio = img.height / img.width;
        elements.maxHeight.value = Math.round(elements.maxWidth.value * ratio);
        state.options.maxWidthOrHeight = Math.max(elements.maxWidth.value, elements.maxHeight.value);
    };
    img.src = URL.createObjectURL(file);
}

function syncWidthFromHeight() {
    const file = state.originalFiles[state.currentFileIndex];
    if (!file || !elements.maxHeight.value) return;

    const img = new Image();
    img.onload = () => {
        const ratio = img.width / img.height;
        elements.maxWidth.value = Math.round(elements.maxHeight.value * ratio);
        state.options.maxWidthOrHeight = Math.max(elements.maxWidth.value, elements.maxHeight.value);
    };
    img.src = URL.createObjectURL(file);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        elements.comparisonContainer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

async function handleFiles(files) {
    if (!files.length) return;

    // Show editor immediately for feedback
    elements.uploadSection.classList.add('hidden');
    elements.editorSection.classList.remove('hidden');

    const normalizedFiles = [];
    for (let file of files) {
        if (file.type.includes('heic') || file.name.toLowerCase().endsWith('.heic')) {
            try {
                const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
                const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
                normalizedFiles.push(convertedFile);
            } catch (err) {
                console.error("HEIC conversion failed:", err);
            }
        } else {
            normalizedFiles.push(file);
        }
    }

    const startIndex = state.originalFiles.length;
    state.originalFiles = [...state.originalFiles, ...normalizedFiles];

    // Automatically select newly uploaded files
    normalizedFiles.forEach((_, i) => state.selectedIndices.add(startIndex + i));

    if (state.originalFiles.length > 0) {
        state.currentFileIndex = startIndex;
    }

    updateUIForUpload();
    renderBatchList();
    processCurrentFile();
    updateSummary();
}

function updateUIForUpload() {
    if (state.originalFiles.length > 1) {
        elements.batchContainer.classList.remove('hidden');
        elements.batchCountBadge.innerText = `(${state.originalFiles.length} Selected)`;

        if (state.originalFiles.length > 5 && !state.isPro) {
            elements.batchProLimit.classList.remove('hidden');
        }
    }
}

function renderBatchList() {
    elements.batchList.innerHTML = '';
    state.originalFiles.forEach((file, index) => {
        const item = document.createElement('div');
        const isActive = index === state.currentFileIndex;
        item.className = `group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}`;

        const isSelected = state.selectedIndices.has(index);
        const isCompressed = state.compressedBlobs.has(index);

        item.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden flex-1">
                <input type="checkbox" class="batch-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" data-index="${index}" ${isSelected ? 'checked' : ''}>
                <div class="flex items-center gap-3 flex-1 overflow-hidden" onclick="switchFile(${index})">
                    <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 relative overflow-hidden shadow-inner" id="thumb-${index}">
                        ${!isCompressed && isActive ? '<div class="absolute inset-0 bg-black/20 flex items-center justify-center"><div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div></div>' : ''}
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-xs font-bold truncate text-slate-700 dark:text-slate-200">${file.name}</p>
                        <p class="text-[10px] font-medium text-slate-400 mt-0.5">
                            ${formatSize(file.size)} 
                            ${isCompressed ? `<span class="text-primary ml-1">→ ${formatSize(state.compressedBlobs.get(index).size)}</span>` : ''}
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2 pl-2">
                ${isCompressed ? '<span class="text-green-500 bg-green-50 dark:bg-green-900/20 p-1.5 rounded-full shadow-sm"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></span>' : ''}
                <button onclick="event.stopPropagation(); switchFile(${index})" class="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-slate-100">EDIT</button>
            </div>
        `;

        elements.batchList.appendChild(item);

        // Checkbox Listener
        item.querySelector('.batch-checkbox').addEventListener('change', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.target.dataset.index);
            if (e.target.checked) state.selectedIndices.add(idx);
            else state.selectedIndices.delete(idx);
            updateSummary();
        });

        // Lazy load thumbnail
        const reader = new FileReader();
        reader.onload = (e) => {
            const thumb = document.getElementById(`thumb-${index}`);
            if (thumb) {
                thumb.style.backgroundImage = `url(${e.target.result})`;
                thumb.style.backgroundSize = 'cover';
                thumb.style.backgroundPosition = 'center';
            }
        };
        reader.readAsDataURL(file.slice(0, 512 * 1024)); // Thumb from first 512KB
    });
}

function switchFile(index) {
    state.currentFileIndex = index;
    renderBatchList();
    processCurrentFile();
}

window.switchFile = switchFile; // Make available to global for onclick

async function processCurrentFile() {
    const file = state.originalFiles[state.currentFileIndex];
    if (!file || state.isProcessing) return;

    state.isProcessing = true;
    elements.currentFileName.innerText = file.name;
    elements.originalSize.innerText = formatSize(file.size);
    elements.originalImg.src = URL.createObjectURL(file);

    // Reset zoom
    state.zoomLevel = 1;
    elements.originalZoomWrapper.style.transform = 'scale(1)';
    elements.compressedWrapper.style.transform = 'scale(1)';

    // Show processing state
    elements.processingOverlay.classList.remove('hidden');
    elements.savingsBadge.classList.add('opacity-0');

    try {
        const options = { ...state.options };

        // Handle output format
        if (options.fileType !== 'original') {
            options.fileType = `image/${options.fileType}`;
        } else {
            options.fileType = file.type;
        }

        // Handle Target Size Priority
        if (elements.sizePriorityToggle.checked && options.maxSizeMB > 0) {
            // If forcing target size, we ignore initialQuality and let the library handle it
            options.initialQuality = 0.5; // Start lower for better chance to hit target
        }

        const compressedFile = await imageCompression(file, options);
        state.compressedBlobs.set(state.currentFileIndex, compressedFile);

        // Update UI
        const compressedURL = URL.createObjectURL(compressedFile);
        elements.compressedImg.src = compressedURL;
        elements.compressedSize.innerText = formatSize(compressedFile.size);

        const savings = Math.round(((file.size - compressedFile.size) / file.size) * 100);
        updateSavingsBadge(savings);

        // Check for target size hit
        if (elements.sizePriorityToggle.checked && options.maxSizeMB > 0) {
            const targetBytes = options.maxSizeMB * 1024 * 1024;
            if (compressedFile.size > targetBytes) {
                showToast(`Target size of ${options.maxSizeMB}MB could not be reached.`, 'warning');
            }
        }

        // Update batch item
        renderBatchList();
        updateSummary();

    } catch (error) {
        console.error("Compression Error:", error);
        showToast("Compression failed. Try different settings.", "error");
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.classList.add('hidden');
    }
}

function updateSavingsBadge(savings) {
    elements.savingsBadge.innerText = `-${savings}%`;
    elements.savingsBadge.classList.remove('opacity-0');

    // Aesthetic update for badge based on savings
    if (savings > 50) {
        elements.savingsBadge.className = "bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-lg shadow-green-500/20";
    } else if (savings > 20) {
        elements.savingsBadge.className = "bg-primary text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-lg shadow-primary/20";
    } else {
        elements.savingsBadge.className = "bg-slate-500 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-lg shadow-slate-500/20";
    }
}

// --- Utils ---

let compressionTimeout;
function debouncedCompress() {
    clearTimeout(compressionTimeout);
    compressionTimeout = setTimeout(processCurrentFile, 400);
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function applyTheme() {
    if (state.isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function downloadCurrent() {
    const blob = state.compressedBlobs.get(state.currentFileIndex);
    if (!blob) return;

    const file = state.originalFiles[state.currentFileIndex];
    const ext = state.options.fileType === 'original' ? '' : `.${state.options.fileType.split('/')[1] || state.options.fileType}`;

    const fileName = file.name.split('.').slice(0, -1).join('.') + '_compressed' + (ext || '.' + file.name.split('.').pop());

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadZip() {
    await downloadBatch(new Set(state.originalFiles.keys()));
}

async function downloadBatch(indicesSet) {
    if (indicesSet.size === 0) return alert("Please select images to download.");

    const zip = new JSZip();
    const isPro = state.isPro || indicesSet.size <= 5;

    if (!isPro && !confirm(`Batch download is limited to 5 files in the free version. You have ${indicesSet.size} selected. Upgrade to Pro for unlimited files. Continue with first 5?`)) {
        elements.proModal.classList.remove('hidden');
        return;
    }

    const indices = Array.from(indicesSet);
    const limit = isPro ? indices.length : 5;

    for (let i = 0; i < limit; i++) {
        const idx = indices[i];
        let blob = state.compressedBlobs.get(idx);
        const file = state.originalFiles[idx];

        if (!blob) {
            try {
                blob = await imageCompression(file, state.options);
                state.compressedBlobs.set(idx, blob);
            } catch (e) { continue; }
        }

        const ext = state.options.fileType === 'original' ? ('.' + file.name.split('.').pop()) : `.${state.options.fileType.split('/')[1] || state.options.fileType}`;
        const name = file.name.split('.').slice(0, -1).join('.') + '_compressed' + ext;
        zip.file(name, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `SmartPress_${indicesSet.size}_Images.zip`;
    a.click();
}

function removeSelected() {
    if (state.selectedIndices.size === 0) return;
    if (!confirm(`Are you sure you want to remove ${state.selectedIndices.size} selected images?`)) return;

    const remainingFiles = [];
    const newCompressedBlobs = new Map();

    state.originalFiles.forEach((file, i) => {
        if (!state.selectedIndices.has(i)) {
            newCompressedBlobs.set(remainingFiles.length, state.compressedBlobs.get(i));
            remainingFiles.push(file);
        }
    });

    state.originalFiles = remainingFiles;
    state.compressedBlobs = newCompressedBlobs;
    state.selectedIndices.clear();
    state.currentFileIndex = 0;

    if (state.originalFiles.length === 0) {
        resetAll();
    } else {
        renderBatchList();
        processCurrentFile();
        updateSummary();
    }
}

function updateSummary() {
    const indices = Array.from(state.selectedIndices);
    const count = indices.length;

    if (count > 0) {
        elements.summaryBar.classList.remove('translate-y-full');
    } else {
        elements.summaryBar.classList.add('translate-y-full');
    }

    let origTotal = 0;
    let compTotal = 0;

    indices.forEach(idx => {
        const file = state.originalFiles[idx];
        const comp = state.compressedBlobs.get(idx);
        if (file) {
            origTotal += file.size;
            compTotal += comp ? comp.size : file.size;
        }
    });

    const saved = Math.max(0, origTotal - compTotal);
    const percent = origTotal > 0 ? Math.round((saved / origTotal) * 100) : 0;

    elements.summarySelectedCount.innerText = count;
    elements.summaryOriginalTotal.innerText = formatSize(origTotal);
    elements.summaryCompressedTotal.innerText = formatSize(compTotal);
    elements.summarySavedTotal.innerText = formatSize(saved);
    elements.summarySavingsPercent.innerText = `${percent}%`;

    // Update select all state
    elements.selectAll.checked = count === state.originalFiles.length && count > 0;
    elements.removeSelectedBtn.disabled = count === 0;

    // Update batch badge
    elements.batchCountBadge.innerText = `(${count} Selected)`;

    // Update Download Button text
    if (count > 1) {
        elements.summaryDownloadBtn.innerText = `Download ${count} Files`;
    } else {
        elements.summaryDownloadBtn.innerText = `Download Compressed`;
    }
}

// --- Slider Logic Removed ---

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl transform transition-all duration-300 translate-x-full font-bold text-sm flex items-center gap-3 border backdrop-blur-md`;

    const colors = {
        info: 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700',
        success: 'bg-green-500/90 text-white border-green-400',
        warning: 'bg-orange-500/90 text-white border-orange-400',
        error: 'bg-red-500/90 text-white border-red-400'
    };

    toast.className += ` ${colors[type]}`;

    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };

    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);

    // Animate out
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function resetAll() {
    state.originalFiles = [];
    state.compressedBlobs.clear();
    state.selectedIndices.clear();
    state.currentFileIndex = 0;
    state.activePreset = null;

    elements.uploadSection.classList.remove('hidden');
    elements.editorSection.classList.add('hidden');
    elements.batchContainer.classList.add('hidden');
    elements.fileInput.value = '';
    elements.summaryBar.classList.add('translate-y-full');

    // Reset controls
    elements.qualityRange.value = 80;
    elements.qualityVal.innerText = '80%';
    elements.sizePriorityToggle.checked = false;
    elements.maxSizeMB.value = '';
    elements.presetBtns.forEach(btn => btn.classList.remove('active'));
    elements.formatBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.format === 'original'));
    elements.resizeToggle.checked = false;
    elements.resizeInputs.classList.add('opacity-50', 'pointer-events-none');

    showToast("Application Reset", "info");
}

// --- PayPal Integration ---
function initPayPal() {
    if (typeof paypal === 'undefined') return;

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'pill',
            label: 'checkout'
        },
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '9.00'
                    },
                    description: 'SmartPress Pro Lifetime License'
                }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                showToast('Welcome to Pro! Your features are now unlocked.', 'success');
                state.isPro = true;
                elements.proModal.classList.add('hidden');
                elements.openProModal.innerHTML = '✨ Pro Active';
                elements.openProModal.classList.replace('bg-primary', 'bg-green-500');
                elements.batchProLimit.classList.add('hidden');

                // Unlock overlays
                const locks = [document.getElementById('zoomProLock'), document.getElementById('presetsProLock'), document.getElementById('presetsProLock2')];
                locks.forEach(l => l?.remove());
            });
        }
    }).render('#paypal-button-container');
}

// Start
init();
