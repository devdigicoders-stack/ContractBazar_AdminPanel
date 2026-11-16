/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E65100', // Deep Safety Orange / Terracotta
          dark: '#BF360C',
          light: '#FF8A50',
        },
        navy: {
          DEFAULT: '#0F172A',
          dark: '#020617',
          light: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}

