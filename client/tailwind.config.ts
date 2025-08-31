import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        'rgpv-pink': '#E91E63',
        'rgpv-light': '#F8BBD9',
        'rgpv-bg': '#FDF2F8',
        'rgpv-dark': '#AD1457'
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
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseGlow: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 10px rgba(233, 30, 99, 0.3)'
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 20px rgba(233, 30, 99, 0.6)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' }
        },
        slideInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(50px) scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        messageBounce: {
          '0%': {
            transform: 'scale(0) rotate(180deg)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.1) rotate(0deg)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1'
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'slideIn': 'slideIn 0.3s ease-out',
        'bounce': 'bounce 2s ease-in-out infinite',
        'pulseGlow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slideInUp': 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'messageBounce': 'messageBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
