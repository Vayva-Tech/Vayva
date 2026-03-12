/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f5f5",
          100: "#e5e5e5",
          500: "#737373",
          600: "#525252",
          700: "#404040",
        },
        accent: {
          500: "#b45309",
          600: "#92400e",
        },
      },
    },
  },
  plugins: [],
};
