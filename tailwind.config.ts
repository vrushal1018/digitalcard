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
        card: {
          bg: "#0d0f12",
          surface: "#16191f",
          surfaceHover: "#1f232b",
          border: "#252b36",
          accent: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};
export default config;

