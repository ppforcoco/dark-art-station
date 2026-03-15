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
      screens: {
        // Custom xs breakpoint — used in AdSlot and other components
        // Tailwind default starts at sm (640px); xs fills the 375–639px gap
        'xs': '375px',
      },
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