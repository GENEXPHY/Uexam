module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0f172a',
        'secondary': '#1e293b',
        'accent': '#3b82f6',
        'accent-dark': '#1e40af',
        'success': '#10b981',
        'danger': '#ef4444',
        'warning': '#f59e0b',
      },
    },
  },
  plugins: [],
}