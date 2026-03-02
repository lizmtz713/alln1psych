/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // InGauge brand colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Gauge colors
        gauge: {
          body: '#F59E0B',
          state: '#10B981',
          emotion: '#EC4899',
          connection: '#8B5CF6',
          direction: '#3B82F6',
          alignment: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
};
