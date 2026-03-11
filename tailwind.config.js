/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        "resident-orange": "#FFBE8A",
        "resident-purple": "#C9B8FF",
        "resident-green": "#A8E6B0",
        "resident-pink": "#FFB3C6",
        "primary": "#1E6FD9",
        "primary-dark": "#1452A8",
        "teal": "#0EA5BF",
        "teal-dark": "#0A7A8F",
      },
    },
  },
  plugins: [],
};
