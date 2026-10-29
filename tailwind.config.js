/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#0B3B2C', 900: '#072A1F', 800: '#0B3B2C', 700: '#11503B' },
        emerald: { DEFAULT: '#127A4B', 600: '#127A4B', 700: '#0E6640', 500: '#1A9259', 50: '#EAF5EF' },
        gold: { DEFAULT: '#C9A24B', 600: '#B38A33', 400: '#D9B964', 100: '#F5EBD3' },
        ivory: { DEFAULT: '#FAF6EE', 200: '#F3ECDD' },
        ink: { DEFAULT: '#1E2420', 600: '#4A524D', 400: '#7A827D' }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,59,44,.06), 0 8px 24px -12px rgba(11,59,44,.18)'
      }
    }
  },
  plugins: []
}
