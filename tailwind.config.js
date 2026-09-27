/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F4F1',
          100: '#CCECF0',
          500: '#0F766E',
          600: '#0F766E',
          700: '#115E59',
        },
        primary: {
          50: '#E6F4F1',
          100: '#CCECF0',
          500: '#0F766E',
          600: '#0F766E',
          700: '#115E59',
        }
      },
    },
  },
  plugins: [],
};

