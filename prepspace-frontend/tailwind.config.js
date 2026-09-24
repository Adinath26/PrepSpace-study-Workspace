/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Core "study desk" palette — pine ink on warm paper, brass ribbon accent.
        paper: {
          DEFAULT: "#F7F5EF",
          50: "#FFFFFF",
          100: "#FDFCFA",
          200: "#F0EDE3",
        },
        ink: {
          DEFAULT: "#1C2333",
          700: "#2B3247",
          500: "#4B5468",
          300: "#8890A0",
        },
        pine: {
          DEFAULT: "#2F5D50",
          50: "#EAF1EE",
          100: "#D3E3DC",
          400: "#3E7A69",
          600: "#264E43",
          700: "#1B3931",
        },
        brass: {
          DEFAULT: "#C9A15A",
          100: "#F3E7CE",
          400: "#D9B579",
          600: "#A97F3C",
        },
        clay: {
          DEFAULT: "#B3423C",
          100: "#F5DAD8",
        },
        line: "#E4E0D6",
      },
      fontFamily: {
        display: ["\"Source Serif 4\"", "Georgia", "serif"],
        sans: ["\"Inter\"", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 51, 0.06), 0 1px 12px rgba(28, 35, 51, 0.04)",
        pop: "0 8px 30px rgba(28, 35, 51, 0.12)",
      },
      borderRadius: {
        xl2: "0.875rem",
      },
    },
  },
  plugins: [],
};
