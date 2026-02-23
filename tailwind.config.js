/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-cinzel)", "cursive"],
        body:    ["var(--font-cormorant)", "serif"],
        mono:    ["var(--font-space)", "monospace"],
      },
      colors: {
        void:    "#070710",
        black:   "#0a0a0a",
        deep:    "#0e0c14",
        crimson: "#8b0000",
        blood:   "#c0001a",
        ember:   "#ff3c00",
        gold:    "#c9a84c",
        ash:     "#2a2535",
        smoke:   "#4a445a",
        ghost:   "#8a8099",
        pale:    "#d4cde8",
        // shadcn compat tokens (kept from original)
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        "fade-up": "fadeUp 0.8s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};