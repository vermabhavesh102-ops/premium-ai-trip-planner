/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5fbff',
          100: '#d6efff',
          200: '#9ddcff',
          300: '#5cc2ff',
          400: '#1aa8ff',
          500: '#008fff',
          600: '#0077d6',
          700: '#0063aa',
          800: '#004f82',
          900: '#003a5c'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.08)',
        luxe: '0 24px 80px rgba(0, 0, 0, 0.22)',
        glow: '0 0 0 1px rgba(255,255,255,0.18), 0 20px 60px rgba(0,143,255,0.2)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}


