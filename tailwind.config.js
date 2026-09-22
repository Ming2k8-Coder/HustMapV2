/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hust-red': '#701818',
        'hust-bright-red': '#C00B0B',
        'hust-navy': '#203354',
        'hust-cream': '#F8EFCE',
        'hust-bg': '#FDFFF5',
      }
    },
  },
  plugins: [],
}
