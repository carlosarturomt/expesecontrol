/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          light: '#F5F6FA',
          dark: '#1C1C1E',
          primary: '#C2185B',
          highlight: '#00A86B',
          warning: '#FFCA28',
          error: '#EF5350',
          blue: '#7c90bc',
          purple: '#580d71',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out forwards',
      },
    },
  },
  plugins: [],
  darkMode: "class",
}

