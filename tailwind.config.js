/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#1e293b",        // Deep Slate Blue (from previous palette)
                    "secondary": "#64748b",      // Muted Blue-Gray (from previous palette)
                    "accent": "#6b8e6b",         // Soft Sage Green (from previous palette)
                    "neutral": "#64748b",        // Using secondary for neutral
                    "base-100": "#EFECE3",       // Light Cream background (new)
                    "base-200": "#ffffff",       // Pure White
                    "base-300": "#e2e8f0",       // Light gray for borders
                    "info": "#1e293b",           // Using primary for info
                    "success": "#6b8e6b",        // Using accent for success
                    "warning": "#f59e0b",        // Amber (kept for warnings)
                    "error": "#ef4444",          // Red (kept for errors)
                },
                dark: {
                    "primary": "#6b8e6b",        // Button color for dark mode (#6B8E6B)
                    "secondary": "#64748b",      // Muted Blue-Gray
                    "accent": "#1e293b",         // Deep Slate Blue (as accent in dark)
                    "neutral": "#475569",        // Medium gray
                    "base-100": "#1e293b",       // Deep Slate Blue (from palette)
                    "base-200": "#0f172a",       // Very dark for contrast
                    "base-300": "#334155",       // Slate gray
                    "info": "#6b8e6b",           // Using primary for info
                    "success": "#6b8e6b",        // Using primary for success
                    "warning": "#f59e0b",        // Amber
                    "error": "#ef4444",          // Red
                },
            },
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
        prefix: "",
        logs: true,
        themeRoot: ":root",
    },
}

