/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'petpulse-bg': '#FAF9F6',
        'petpulse-card': '#FFFFFF',
        'petpulse-primary': '#7A9A7B',
        'petpulse-primary-dark': '#6B8C6C',
        'petpulse-accent': '#E07A5F',
        'petpulse-text': '#2F3E32',
        'petpulse-text-secondary': '#7A7A7A',
        'petpulse-border': '#D8D3CD',
        'petpulse-google-bg': '#F3F3F3',
      },
      fontFamily: {
        'encode-condensed': ['"Encode Sans Condensed"', 'sans-serif'],
        'encode-expanded': ['"Encode Sans Expanded"', 'sans-serif'],
        'encode-semi': ['"Encode Sans Semi Expanded"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}