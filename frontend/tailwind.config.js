/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#111827",
        surface: "#1f2937",
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        textMain: "#f3f4f6",
        textMuted: "#9ca3af",
        danger: "#ef4444",
        success: "#10b981",
      },
    },
  },
  plugins: [],
};
