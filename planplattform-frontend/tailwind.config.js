/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Pfade, in denen Tailwind nach Klassen sucht
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
