/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cinzel)", "cursive"],
        body:    ["var(--font-cormorant)", "serif"],
        mono:    ["var(--font-space)", "monospace"],
      },
      aspectRatio: {
        portrait:  "9 / 16",
        landscape: "16 / 9",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};