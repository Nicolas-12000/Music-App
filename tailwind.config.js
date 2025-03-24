const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow:{
        'card': '0 8px 30px rgba(0,0,0,0.3)',
        'glow': '0 0 20px rgba(63, 169, 245, 0.2)'
      },
      colors: {
        background: '#1a1a1a',
        primary: '#3fa9f5',
        accent: '#c6952c',
        text: '#e0e0e0',
        'spotify-green': '#1DB954',
        'spotify-dark': '#191414',
      },
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
      },
      animation: {
        'card-hover': 'hover 0.2s ease-in-out',
      },
      keyframes: {
        hover: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}