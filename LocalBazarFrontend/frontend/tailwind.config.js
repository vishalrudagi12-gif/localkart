/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bazaar: {
          50: '#f4f8f4',
          100: '#e4eee3',
          200: '#cbe0c9',
          300: '#a5ca9f',
          400: '#79ae72',
          500: '#52914c',
          600: '#3f743a',
          700: '#2a4d38',
          800: '#244030',
          900: '#1a3024',
          950: '#0c1a12',
        },
        terracotta: {
          50: '#fdf6f3',
          100: '#faeee6',
          500: '#cf5c36',
          600: '#b84926',
        },
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'lift': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
