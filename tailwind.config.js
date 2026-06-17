/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        akrus: {
          DEFAULT: "#173F62",
          50: "#edf4fa",
          100: "#dce9f4",
          700: "#173F62",
          800: "#123450",
          900: "#0f2b44"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(15, 43, 68, 0.12)"
      }
    }
  },
  plugins: []
};
