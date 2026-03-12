// ============================================================================
// DESIGN CATEGORY STYLING UTILITIES
// ============================================================================
// Enhanced styling helpers for the 5 design categories
// ============================================================================

import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";

/**
 * Get CSS classes for metric card styling based on design category
 */
export function getMetricCardClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return `
        bg-white/70 backdrop-blur-xl border border-white/30
        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
        hover:bg-white/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
        transition-all duration-300
      `;
    case "dark":
      return `
        bg-gray-800/80 backdrop-blur-md border border-gray-700/50
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        hover:bg-gray-700/80 hover:border-gray-600/50
        transition-all duration-300 text-gray-100
      `;
    case "bold":
      return `
        bg-white border-2 border-black shadow-[4px_4px_0px_#000000]
        hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5
        transition-all duration-200
      `;
    case "natural":
      return `
        bg-gradient-to-br from-amber-50/80 to-yellow-50/80 
        border border-amber-200/50 rounded-2xl
        shadow-[0_4px_16px_rgba(180,83,9,0.1)]
        hover:from-amber-100/80 hover:to-yellow-100/80
        transition-all duration-300
      `;
    case "signature":
    default:
      return `
        bg-white border border-gray-200 rounded-xl
        shadow-[0_4px_16px_rgba(0,0,0,0.08)]
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        transition-all duration-300
      `;
  }
}

/**
 * Get value text styling based on design category
 */
export function getValueTextClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "text-gray-900 font-bold text-3xl";
    case "dark":
      return "text-white font-bold text-3xl";
    case "bold":
      return "text-gray-900 font-black text-3xl";
    case "natural":
      return "text-amber-900 font-bold text-3xl";
    case "signature":
    default:
      return "text-gray-900 font-bold text-3xl";
  }
}

/**
 * Get label text styling based on design category
 */
export function getLabelTextClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "text-gray-600 text-sm font-medium";
    case "dark":
      return "text-gray-300 text-sm font-medium";
    case "bold":
      return "text-gray-700 text-sm font-bold uppercase tracking-wide";
    case "natural":
      return "text-amber-700 text-sm font-medium";
    case "signature":
    default:
      return "text-gray-600 text-sm font-medium";
  }
}

/**
 * Get trend indicator styling based on design category
 */
export function getTrendClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold";
    case "dark":
      return "text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full text-xs font-semibold";
    case "bold":
      return "text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-bold text-xs";
    case "natural":
      return "text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold";
    case "signature":
    default:
      return "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold";
  }
}

/**
 * Get section header styling based on design category
 */
export function getSectionHeaderClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return `
        bg-gradient-to-r from-pink-50/60 via-purple-50/60 to-rose-50/60
        backdrop-blur-sm border border-white/40 rounded-2xl
        shadow-[0_4px_20px_rgba(236,72,153,0.1)]
      `;
    case "dark":
      return `
        bg-gradient-to-r from-gray-800 to-gray-900
        border border-gray-700 rounded-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.4)]
      `;
    case "bold":
      return `
        bg-white border-2 border-black rounded-lg
        shadow-[4px_4px_0px_#000000]
      `;
    case "natural":
      return `
        bg-gradient-to-r from-amber-100/80 to-yellow-100/80
        border border-amber-300/50 rounded-2xl
        shadow-[0_4px_16px_rgba(180,83,9,0.15)]
      `;
    case "signature":
    default:
      return `
        bg-white border border-gray-200 rounded-xl
        shadow-[0_2px_10px_rgba(0,0,0,0.05)]
      `;
  }
}

/**
 * Get section title styling based on design category
 */
export function getSectionTitleClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "text-gray-900 font-bold text-lg";
    case "dark":
      return "text-white font-bold text-lg";
    case "bold":
      return "text-gray-900 font-black text-lg uppercase";
    case "natural":
      return "text-amber-900 font-bold text-lg";
    case "signature":
    default:
      return "text-gray-900 font-bold text-lg";
  }
}

/**
 * Get task item styling based on design category
 */
export function getTaskItemClasses(category: DesignCategory, isCompleted: boolean): string {
  const baseClasses = "flex items-center gap-3 p-4 rounded-xl transition-all duration-200";
  
  if (isCompleted) {
    switch (category) {
      case "glass":
        return `${baseClasses} bg-emerald-50/50 border border-emerald-200/30`;
      case "dark":
        return `${baseClasses} bg-emerald-900/20 border border-emerald-800/30`;
      case "bold":
        return `${baseClasses} bg-emerald-100 border-2 border-emerald-300`;
      case "natural":
        return `${baseClasses} bg-green-50/50 border border-green-200/30`;
      case "signature":
      default:
        return `${baseClasses} bg-emerald-50 border border-emerald-200`;
    }
  } else {
    switch (category) {
      case "glass":
        return `${baseClasses} bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60`;
      case "dark":
        return `${baseClasses} bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60`;
      case "bold":
        return `${baseClasses} bg-white border border-gray-300 hover:border-gray-400 hover:-translate-y-0.5`;
      case "natural":
        return `${baseClasses} bg-amber-50/60 border border-amber-200/50 hover:bg-amber-100/60`;
      case "signature":
      default:
        return `${baseClasses} bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm`;
    }
  }
}

/**
 * Get priority badge styling based on design category
 */
export function getPriorityBadgeClasses(category: DesignCategory, priority: 'high' | 'medium' | 'low'): string {
  const priorityColors = {
    high: {
      glass: "bg-red-100 text-red-700 border-red-200",
      dark: "bg-red-900/30 text-red-300 border-red-800/50",
      bold: "bg-red-500 text-white border-red-600",
      natural: "bg-red-100 text-red-700 border-red-200",
      signature: "bg-red-100 text-red-700 border-red-200"
    },
    medium: {
      glass: "bg-amber-100 text-amber-700 border-amber-200",
      dark: "bg-amber-900/30 text-amber-300 border-amber-800/50",
      bold: "bg-amber-500 text-white border-amber-600",
      natural: "bg-amber-100 text-amber-700 border-amber-200",
      signature: "bg-amber-100 text-amber-700 border-amber-200"
    },
    low: {
      glass: "bg-blue-100 text-blue-700 border-blue-200",
      dark: "bg-blue-900/30 text-blue-300 border-blue-800/50",
      bold: "bg-blue-500 text-white border-blue-600",
      natural: "bg-blue-100 text-blue-700 border-blue-200",
      signature: "bg-blue-100 text-blue-700 border-blue-200"
    }
  };

  return `px-2 py-1 rounded-full text-xs font-semibold border ${priorityColors[priority][category]}`;
}

/**
 * Get chart container styling based on design category
 */
export function getChartContainerClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return `
        bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
      `;
    case "dark":
      return `
        bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
      `;
    case "bold":
      return `
        bg-white border-2 border-black rounded-xl
        shadow-[4px_4px_0px_#000000]
      `;
    case "natural":
      return `
        bg-gradient-to-br from-amber-50/80 to-yellow-50/80
        border border-amber-200/50 rounded-2xl
        shadow-[0_4px_16px_rgba(180,83,9,0.1)]
      `;
    case "signature":
    default:
      return `
        bg-white border border-gray-200 rounded-xl
        shadow-[0_4px_16px_rgba(0,0,0,0.08)]
      `;
  }
}

/**
 * Get background gradient for the entire dashboard based on design category
 */
export function getDashboardBackgroundGradient(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50";
    case "dark":
      return "bg-gradient-to-br from-gray-900 to-gray-800";
    case "bold":
      return "bg-gradient-to-br from-orange-50 to-yellow-50";
    case "natural":
      return "bg-gradient-to-b from-amber-50 to-yellow-50";
    case "signature":
    default:
      return "bg-gray-50";
  }
}

/**
 * Get accent color for interactive elements based on design category
 */
export function getAccentColor(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "#EC4899"; // Rose
    case "dark":
      return "#6366F1"; // Electric Blue
    case "bold":
      return "#F97316"; // Orange
    case "natural":
      return "#D97706"; // Amber
    case "signature":
    default:
      return "#3B82F6"; // Blue
  }
}