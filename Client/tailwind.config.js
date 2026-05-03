/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /*
         * Override the entire "blue" scale → Ocean Teal
         * Every `bg-blue-*`, `text-blue-*`, `border-blue-*` in JSX
         * automatically becomes teal — no JSX changes needed.
         */
        blue: {
          50:  "#f0f9f7",
          100: "#c5eaee",
          200: "#8ad5db",
          300: "#4abdc6",
          400: "#29a89c",
          500: "#1a8a82",
          600: "#0a6e8a",
          700: "#0a5f7a",
          800: "#084d62",
          900: "#063a4a",
          950: "#041f28",
        },

        /* Ocean dark-mode palette */
        ocean: {
          base:    "#040d10",   /* page background          */
          sidebar: "#060f13",   /* sidebar / drawer         */
          card:    "#071a20",   /* cards / modals           */
          surface: "#0a2530",   /* inputs / rows            */
          hover:   "#0f3040",   /* hover / subtle highlight */
          border:  "#164555",   /* default border           */
          muted:   "#1e5a6a",   /* stronger border          */
        },

        /* Accent colours */
        teal: {
          primary:  "#0a6e8a",
          light:    "#29a89c",
          green:    "#1db88a",
          cyan:     "#0ccdd6",
          rose:     "#f43f5e",
        },
      },

      backgroundImage: {
        "teal-gradient":  "linear-gradient(135deg,#0a6e8a 0%,#0a5f7a 100%)",
        "hero-gradient":  "linear-gradient(135deg,#0a6e8a 0%,#29a89c 50%,#0ccdd6 100%)",
      },

      boxShadow: {
        "teal-glow":    "0 4px 20px rgba(10,110,138,.45)",
        "teal-glow-lg": "0 8px 32px rgba(10,110,138,.55)",
        "card-light":   "0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(10,95,122,.07)",
        "card-dark":    "0 4px 24px rgba(0,0,0,.55),inset 0 1px 0 rgba(41,168,156,.08)",
      },

      animation: {
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
