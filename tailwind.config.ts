import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#db2777",
        "primary-hover": "#be185d",
        secondary: "#fbcfe8",
        "background-light": "#fffbfc",
        "background-dark": "#2d0818",
        "card-light": "#ffffff",
        "card-dark": "#4a0d26",
        "border-light": "#f3e8eb",
        "border-dark": "#831843",
        "text-main": "#4a044e",
        "text-body": "#706569",
        "text-secondary": "#fce7f3",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(219, 39, 119, 0.1)",
        glow: "0 0 15px rgba(219, 39, 119, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;


