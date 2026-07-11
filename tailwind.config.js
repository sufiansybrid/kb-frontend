/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#425C52",
          hover: "#4e6e62",
          light: "#e8efed",
          lighter: "#f0f5f3",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
