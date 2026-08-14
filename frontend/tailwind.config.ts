import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1220",
        secondary: "#111827",
        card: "#1E293B",
        foreground: "#F8FAFC",
        "text-secondary": "#94A3B8",
        brand: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;
