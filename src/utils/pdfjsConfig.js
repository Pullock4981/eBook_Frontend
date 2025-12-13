/**
 * PDF.js Global Configuration
 * 
 * Configure PDF.js worker once for the entire application
 * This ensures the worker is set before any PDF.js operations
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - MUST be set before any PDF.js operations
// PDF.js 5.4.449 uses .mjs extension for worker (NOT .js)
const workerVersion = pdfjsLib.version || '5.4.449';

// CRITICAL: Use unpkg CDN with .mjs extension (NOT .js)
// The error shows it's trying .js which is wrong for PDF.js 5.x
// unpkg is the most reliable CDN for npm packages
const workerSrc = `https://unpkg.com/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`;

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Log for debugging
if (import.meta.env.DEV) {
    console.log('📄 PDF.js Worker configured:', workerSrc);
    console.log('📄 PDF.js Version:', pdfjsLib.version);
}

// Log worker configuration for debugging
if (import.meta.env.DEV) {
    console.log('📄 PDF.js Worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    console.log('📄 PDF.js Version:', pdfjsLib.version);
}

export default pdfjsLib;

