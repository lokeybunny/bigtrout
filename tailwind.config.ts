import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Bangers", "Orbitron", "monospace"],
        body: ["Rajdhani", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        pepe: {
          dark: "hsl(var(--pepe-dark))",
          core: "hsl(var(--pepe-core))",
          glow: "hsl(var(--pepe-glow))",
          light: "hsl(var(--pepe-light))",
        },
        sakura: {
          deep: "hsl(var(--sakura-deep))",
          mid: "hsl(var(--sakura-mid))",
          glow: "hsl(var(--sakura-glow))",
          light: "hsl(var(--sakura-light))",
        },
        garden: {
          dark: "hsl(var(--garden-dark))",
          mid: "hsl(var(--garden-mid))",
          pond: "hsl(var(--garden-pond))",
          wood: "hsl(var(--garden-wood))",
        },
        // Ukiyo-e colors
        ukiyo: {
          sky: "hsl(var(--ukiyo-sky))",
          parchment: "hsl(var(--ukiyo-parchment))",
          ink: "hsl(var(--ukiyo-ink))",
        },
        // Legacy aliases
        lava: {
          deep: "hsl(var(--pepe-dark))",
          core: "hsl(var(--pepe-core))",
          glow: "hsl(var(--pepe-glow))",
        },
        ember: "hsl(var(--pepe-glow))",
        fire: "hsl(var(--pepe-core))",
        ice: {
          deep: "hsl(var(--sakura-deep))",
          mid: "hsl(var(--sakura-mid))",
          glow: "hsl(var(--sakura-glow))",
        },
        snow: "hsl(var(--sakura-light))",
        frost: "hsl(var(--sakura-glow))",
        storm: {
          dark: "hsl(var(--garden-dark))",
          mid: "hsl(var(--garden-mid))",
          cloud: "hsl(var(--garden-pond))",
        },
        ash: "hsl(var(--muted-foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
