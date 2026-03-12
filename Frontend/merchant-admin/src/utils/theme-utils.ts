export const THEME_STYLES = {
  minimal: {
    bg: "bg-white",
    text: "text-gray-900",
    card: "bg-white border border-gray-100",
    buttonPrimary: "bg-black text-white hover:bg-gray-800",
    buttonSecondary:
      "bg-white text-black border border-gray-200 hover:bg-gray-50",
    font: "font-sans",
    radius: "rounded-lg",
    shadow: "shadow-sm",
    border: "border-gray-100",
  },
  bold: {
    bg: "bg-gray-50",
    text: "text-black",
    card: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    buttonPrimary:
      "bg-blue-600 text-white font-black uppercase tracking-wide hover:bg-blue-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
    buttonSecondary:
      "bg-white text-black font-bold border-2 border-black hover:bg-gray-100",
    font: "font-sans", // Could be a distinct display font if available
    radius: "rounded-none",
    shadow: "shadow-md",
    border: "border-black",
  },
  premium: {
    bg: "bg-slate-900",
    text: "text-slate-50",
    card: "bg-slate-800/50 border border-slate-700 backdrop-blur-sm",
    buttonPrimary:
      "bg-gradient-to-r from-amber-200 to-amber-400 text-amber-950 font-medium hover:brightness-110",
    buttonSecondary:
      "bg-transparent text-amber-200 border border-amber-200/30 hover:bg-amber-900/30",
    font: "font-serif",
    radius: "rounded-2xl",
    shadow: "shadow-2xl",
    border: "border-slate-700",
  },
};
export function getThemeStyles(theme: string): Record<string, string> {
  return (
    THEME_STYLES[theme as keyof typeof THEME_STYLES] || THEME_STYLES.minimal
  );
}
