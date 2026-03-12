const colors = {
    primary: {
        DEFAULT: "#0B0B0B",
        hover: "#1A1A1A",
        50: "#F9F9F9",
        100: "#F3F3F3",
        200: "#E7E7E7",
        300: "#D1D1D1",
        400: "#B0B0B0",
        500: "#0B0B0B",
        600: "#080808",
        700: "#050505",
        800: "#030303",
        900: "#000000",
    },
    accent: {
        DEFAULT: "#0D1D1E",
        hover: "#1A2F31",
        light: "#E8ECEC",
    },
    background: {
        DEFAULT: "#FFFFFF",
        subtle: "#FBFCFC",
        light: "#F8F9FA",
    },
    text: {
        primary: "#0B0B0B",
        secondary: "#6B7280",
        tertiary: "#9CA3AF",
        inverse: "#FFFFFF",
    },
    border: {
        DEFAULT: "#E5E7EB",
        subtle: "#F3F4F6",
        strong: "#D1D5DB",
    },
    status: {
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
    },
};
export const vayvaPreset = {
    content: [],
    theme: {
        extend: {
            colors: {
                primary: colors.primary,
                accent: colors.accent,
                background: colors.background,
                text: colors.text,
                border: colors.border,
                status: colors.status,
            },
            fontFamily: {
                sans: [
                    "var(--font-inter)",
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "sans-serif",
                ],
                heading: [
                    "var(--font-space-grotesk)",
                    "Space Grotesk",
                    "system-ui",
                    "sans-serif",
                ],
            },
            // Motion System (Contract Section 5)
            transitionDuration: {
                fast: "120ms",
                standard: "180ms",
                slow: "240ms",
            },
            transitionTimingFunction: {
                "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
                "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
                "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
            },
            animation: {
                "fade-in": "fadeIn 180ms ease-in-out", // standard
                "slide-up": "slideUp 240ms ease-out", // slow entrance
                "slide-down": "slideDown 240ms ease-out", // slow entrance
                "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            // Surface System (Contract Section 2 & 8)
            backgroundImage: {
                "glass-panel": "linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))", // Fallback for browsers without backdrop-filter
            },
            boxShadow: {
                glass: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", // Subtle glass shadow
                card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                focus: "0 0 0 2px rgba(11, 11, 11, 0.1)", // Tight focus ring
            },
            opacity: {
                glass: "0.6", // Standard glass opacity
            }
        },
    },
    plugins: [],
};
