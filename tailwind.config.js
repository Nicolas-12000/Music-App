const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        primary: '#3fa9f5',
        accent: '#c6952c',
        text: '#e0e0e0',
      },
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
      },
      animation: {
        'card-hover': 'hover 0.2s ease-in-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}