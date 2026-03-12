import type { Config } from "tailwindcss";
import { vayvaPreset } from "./src/tailwind-preset";

const config: Config = {
  presets: [vayvaPreset],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
