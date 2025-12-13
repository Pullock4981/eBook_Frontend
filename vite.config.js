import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// Copy PDF.js worker to public folder during build
try {
    copyFileSync(
        path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
        path.resolve(__dirname, 'public/pdf.worker.min.mjs')
    );
    console.log('✅ PDF.js worker copied to public folder');
} catch (error) {
    console.warn('⚠️ Could not copy PDF.js worker:', error.message);
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
})

