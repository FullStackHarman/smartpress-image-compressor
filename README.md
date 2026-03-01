# SmartPress: Private Image Compressor & WebP Converter 🚀

SmartPress is a high-performance, **100% client-side** image optimization tool. It allows you to compress, resize, and convert images to WebP/JPEG without ever uploading your data to a server, ensuring maximum privacy and zero bandwidth costs.

## 🌟 Key Features
- **Privacy First**: All processing happens in your browser. No images are sent to any server.
- **Ultra-Fast**: Leveraging `browser-image-compression` and `heic2any` for rapid local processing.
- **Batch Processing**: Optimize dozens of images at once and download them as a ZIP.
- **Platform Presets**: (Pro) Optimized settings for Instagram, Shopify, WordPress, and more.
- **Interactive Comparison**: Side-by-side view with a slider and precision zoom.
- **Modern UI**: Clean, glassmorphic design with Dark/Light mode support.

## 🏗️ Project Structure
This repository contains two implementations of the tool:

1.  **`/smartpress-next` (Current)**: The modern version built with **Next.js (App Router)**, React, Framer Motion, and Tailwind CSS. This version includes advanced features like memoized previews, stable blob URL management, and cross-fade transitions.
2.  **Legacy Version (Root)**: The original Vanilla JS, HTML, and CSS version (preserved for simplicity/reference).

## 🚀 Getting Started

### Run the Modern App (Next.js)
```bash
# Navigate to the app directory
cd smartpress-next

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Run the Legacy Version
Simply open `index.html` in your browser.

## 🛠️ Technology Stack
- **Framework**: Next.js 14+ / React 18+
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Logic**: `browser-image-compression`, `heic2any`, `JSZip`

## 🔒 Privacy & Security
SmartPress is built on the principle of local-only compute. By performing all image operations on the client-side, we:
1.  **Guarantee Privacy**: Your photos never leave your device.
2.  **Save Bandwidth**: You don't need to upload or download large files repeatedly.
3.  **Ensure Speed**: Processing is limited only by your local machine's hardware.

---
Created by [Harman Preet Singh](https://github.com/harmanpreet7)
