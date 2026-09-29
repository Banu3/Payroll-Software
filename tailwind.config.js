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
        bg: {
          DEFAULT: '#EAF0EC',
          page: '#EAF0EC',
          card: '#FFFFFF',
          subtle: '#F3F7F5',
          'table-head': '#F3F7F5',
          hover: '#F0F6F3',
        },
        'surface-alt': '#EEF3F0',
        card: '#FFFFFF',
        brand: {
          DEFAULT: '#167C63',
          hover: '#11664F',
          soft: '#E5F4EE',
          50: '#E5F4EE',
          100: '#CFE6DC',
          500: '#167C63',
          600: '#167C63',
          700: '#11664F',
        },
        text: {
          DEFAULT: '#12201A',
          heading: '#12201A',
          body: '#33413A',
          muted: '#5A6A61',
          'section-label': '#6B7A72',
        },
        border: {
          DEFAULT: '#CBD8D1',
          strong: '#BCCBC3',
          row: '#E1E9E4',
          'soft-brand': '#CFE6DC',
        },
        hover: '#F0F6F3',
        row: {
          hover: '#F4F8F5',
        },
        status: {
          success: '#167C63',
          'success-bg': '#E5F4EE',
          warning: '#9A6700',
          'warning-bg': '#FFF7E5',
          error: '#C24141',
          'error-bg': '#FFF1F1',
          info: '#3674A5',
          'info-bg': '#EEF6FC',
          locked: '#526158',
          'locked-bg': '#EEF0EE',
        }
      },
      borderRadius: {
        input: '10px',
        button: '9px',
        card: '14px',
        modal: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,50,35,0.08), 0 6px 16px rgba(20,50,35,0.07)',
        'card-hover': '0 2px 4px rgba(20,50,35,0.10), 0 10px 24px rgba(20,50,35,0.10)',
        bar: '0 1px 4px rgba(20,50,35,0.08)',
        sidebar: '1px 0 10px rgba(20,50,35,0.08)',
        overlay: '0 12px 32px rgba(20,50,35,0.14)',
        custom: '0 1px 2px rgba(20,50,35,0.08), 0 6px 16px rgba(20,50,35,0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
