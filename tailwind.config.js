/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
        '16/9': '16 / 9',
        '16/10': '16 / 10',
        '21/9': '21 / 9',
      },
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EAE1D5',
          300: '#DFD1BF',
          400: '#CBB499',
          500: '#B49673',
          600: '#957856',
          700: '#755B3E',
          800: '#56422C',
          900: '#382A1B',
        },
        obsidian: '#121212',
        charcoal: '#1E1E1E',
        cream: '#FDFBF7',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '.2em',
        luxury: '.25em',
      },
    },
  },
  plugins: [],
}
