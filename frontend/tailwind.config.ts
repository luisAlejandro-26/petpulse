/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        petpulse: {
          olive: '#6B8C6C',
          'olive-dark': '#5a7a5b',
          coral: '#E07A5F',
          'coral-dark': '#c96a52',
          gray: '#7A7A7A',
          'card-border': '#e5e7eb',
        },
      },
      borderRadius: {
        'card': '20px',
      },
    },
  },
  plugins: [],
}
