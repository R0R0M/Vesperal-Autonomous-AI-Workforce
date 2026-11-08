import type { Config } from "tailwindcss";

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: channel("paper"), 2: channel("paper-2"), 3: channel("paper-3") },
        ink: { DEFAULT: channel("ink"), 2: channel("ink-2") },
        mute: channel("mute"),
        rule: { DEFAULT: channel("rule"), 2: channel("rule-2") },
        accent: channel("accent"),
        ok: channel("ok"),
        warn: channel("warn"),
        bad: channel("bad"),
        ideator: channel("ideator"),
        coder: channel("coder"),
        tester: channel("tester"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      maxWidth: {
        page: "76rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
