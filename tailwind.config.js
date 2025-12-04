/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'rick-green': '#97ce4c',
        'morty-yellow': '#f0e14a',
        'portal-blue': '#00d9ff',
      },
    },
  },
  plugins: [],
}

