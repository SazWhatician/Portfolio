/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        '90': '22.5rem',
        '125': '31.25rem',
      },
      zIndex: {
        '2': '2',
      },
      colors: {
        background: "var(--background, #ffffff)",
        foreground: "var(--foreground, #111111)",
        zinc: {
          950: "#1b1916", // Luxury espresso umber
          900: "#24211d", // Warm roasted taupe
          850: "#2a2723",
          800: "#2e2a25", // Soft mocha pill
          700: "#443f38",
          600: "#6e665c",
          500: "#8e8477",
          400: "#b5aaa0", // Muted cashmere sand
          300: "#d4c7bc",
          200: "#e8dcce",
          100: "#f0e7dd",
          50: "#f5f2eb",  // Warm alabaster cream
        },
        champagne: {
          DEFAULT: "#c9a992",
          light: "#e0cbba",
          dark: "#a88770",
        },
      },
    },
  },
  plugins: [],
};
