/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Farbpalette
      colors: {
        // Haupt-Blau-Töne
        blue: {
          50:  '#f0f7ff',
          100: '#d9eaff',
          200: '#add4ff',
          300: '#82bdff',
          400: '#569eff',
          500: '#2a7eff',  // primary
          600: '#1f5fcc',
          700: '#174799',
          800: '#102f66',
          900: '#091933',
        },
        // neutrales Grau–Spektrum
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        black: '#000000',
        white: '#ffffff',
      },

      // Typografie
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'ui-serif', 'Georgia'],
      },
      fontSize: {
        xs:  ['0.75rem', { lineHeight: '1rem' }],
        sm:  ['0.875rem', { lineHeight: '1.25rem' }],
        base:['1rem', { lineHeight: '1.5rem' }],
        lg:  ['1.125rem', { lineHeight: '1.75rem' }],
        xl:  ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl':['1.5rem', { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  plugins: [
    // Für lesefreundliche Fließtexte
    require('@tailwindcss/typography'),
  ],
}
