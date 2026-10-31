import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Montserrat", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-flat": "var(--surface-flat)",
        "surface-2": "var(--surface-flat)",
        line: "var(--line)",
        border: "var(--line)",
        "border-strong": "var(--line)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-soft": "var(--ink-muted)",
        teal: "var(--teal)",
        "teal-mid": "var(--teal-mid)",
        "on-teal": "var(--on-teal)",
        coral: "var(--coral)",
        "on-coral": "var(--on-coral)",
        "coral-soft": "var(--coral-soft)",
        "coral-ink": "var(--coral-ink)",
        "blue-soft": "var(--blue-soft)",
        "blue-ink": "var(--blue-ink)",
        backdrop: "var(--backdrop)",
        tide: "var(--teal)",
        amber: "var(--coral)",
        success: "var(--teal)",
        danger: "var(--coral)",
      },
      borderRadius: {
        card: "24px",
        sheet: "32px",
        pill: "999px",
      },
      boxShadow: {
        focused: "0 12px 32px rgba(74,117,137,0.18)",
        fab: "0 10px 24px rgba(232,100,58,0.35)",
        sheet: "0 -8px 32px rgba(74,117,137,0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
