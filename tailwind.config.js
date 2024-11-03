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
        },
      }
    },
  },
  plugins: [],
  darkMode: "class",
}

