/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bazaar: {
          50: '#f4f7f2',
          100: '#e4eee0',
          500: '#3d6b4f',
          700: '#2a4d38',
          900: '#1a3024',
        },
      },
    },
  },
  plugins: [],
};
