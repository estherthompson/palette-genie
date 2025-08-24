/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'shine-gradient': 'linear-gradient(90deg, #FFC6AC, #F7B267, #FFC6AC)',
      },
      animation: {
        shine: 'shine 2s infinite linear',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'even-glow': '0 0 8px 2px #fad27f',
      },
    },
  },
  plugins: [],
}
