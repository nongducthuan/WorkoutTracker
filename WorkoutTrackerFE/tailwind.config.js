/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        surface: 'var(--surface)',
        electric: 'var(--electric)',
        'electric-dim': 'var(--electric-dim)',
        'electric-orange': 'var(--electric-orange)',
        'on-surface': 'var(--on-surface)',
        'muted-gray': 'var(--muted-gray)',
        'border-gray': 'var(--border-gray)',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['System'],
      }
    },
  },
  plugins: [],
}
