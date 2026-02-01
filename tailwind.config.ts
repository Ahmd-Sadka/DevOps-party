import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        xp: {
          DEFAULT: "hsl(var(--xp))",
          foreground: "hsl(var(--xp-foreground))",
        },
        streak: "hsl(var(--streak))",
        level: {
          linux: "hsl(var(--level-linux))",
          bash: "hsl(var(--level-bash))",
          git: "hsl(var(--level-git))",
          docker: "hsl(var(--level-docker))",
          ansible: "hsl(var(--level-ansible))",
          kubernetes: "hsl(var(--level-kubernetes))",
          terraform: "hsl(var(--level-terraform))",
          aws: "hsl(var(--level-aws))",
          cicd: "hsl(var(--level-cicd))",
          openshift: "hsl(var(--level-openshift))",
          devops: "hsl(var(--level-devops))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "SF Mono", "Consolas", "monospace"],
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
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            opacity: "1",
            filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))",
          },
          "50%": { 
            opacity: "0.8",
            filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.8))",
          },
        },
        "fire-flicker": {
          "0%, 100%": { 
            transform: "scale(1) rotate(-2deg)",
            filter: "brightness(1)",
          },
          "25%": { 
            transform: "scale(1.1) rotate(2deg)",
            filter: "brightness(1.2)",
          },
          "50%": { 
            transform: "scale(0.95) rotate(-1deg)",
            filter: "brightness(0.9)",
          },
          "75%": { 
            transform: "scale(1.05) rotate(1deg)",
            filter: "brightness(1.1)",
          },
        },
        "badge-unlock": {
          "0%": {
            transform: "scale(0) rotate(-180deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.2) rotate(10deg)",
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
        },
        "confetti": {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fire-flicker": "fire-flicker 0.5s ease-in-out infinite",
        "badge-unlock": "badge-unlock 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "confetti": "confetti 3s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "shake": "shake 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
