import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EE",
        ink: "#1F2A1D",
        forest: "#233D24",
        moss: "#4C7A3F",
        leaf: "#7FB069",
        tomato: "#E4572E",
        yolk: "#F2B705",
        stone: "#DCD5C1",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        stamp: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
