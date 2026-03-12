/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf4f4",
          100: "#fce8e8",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        dark: {
          900: "#0f0f0f",
          800: "#1a1a1a",
        },
      },
    },
  },
  plugins: [],
};
