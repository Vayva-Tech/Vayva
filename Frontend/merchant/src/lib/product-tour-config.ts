/**
 * Product Tour Configuration
 * 
 * Defines the steps and behavior for the interactive product tour
 * that guides new users through key Vayva features.
 */

export interface TourStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  action?: () => void;
  showOnMobile?: boolean;
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  autoStart?: boolean;
  allowSkip?: boolean;
  showProgress?: boolean;
}

/**
 * Main dashboard tour for new users
 */
export const DASHBOARD_TOUR_CONFIG: TourConfig = {
  id: "dashboard-intro",
  name: "Dashboard Introduction",
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: "welcome",
      target: "#dashboard-header",
      title: "Welcome to Your Dashboard!",
      description: "This is your command center. Here you'll manage orders, track revenue, and configure your AI agent.",
      position: "bottom",
      showOnMobile: true,
    },
    {
      id: "ai-stats-widget",
      target: "#ai-stats-widget",
      title: "AI Performance Stats",
      description: "See how your AI agent is performing: messages handled, orders captured, and customer satisfaction.",
      position: "bottom",
      showOnMobile: false,
    },
    {
      id: "recent-orders",
      target: "#recent-orders-card",
      title: "Recent Orders",
      description: "Track all incoming orders in real-time. Your AI automatically processes and updates these.",
      position: "top",
      showOnMobile: true,
    },
    {
      id: "revenue-chart",
      target: "#revenue-analytics",
      title: "Revenue Analytics",
      description: "Watch your business grow! This chart shows your daily/weekly/monthly revenue trends.",
      position: "top",
      showOnMobile: false,
    },
    {
      id: "quick-actions",
      target: "#quick-actions-menu",
      title: "Quick Actions",
      description: "Fast access to common tasks: add products, create campaigns, view reports, and more.",
      position: "right",
      showOnMobile: true,
    },
  ],
};

/**
 * AI Agent setup tour
 */
export const AI_AGENT_TOUR_CONFIG: TourConfig = {
  id: "ai-agent-setup",
  name: "AI Agent Configuration",
  autoStart: false,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: "agent-status",
      target: "#ai-agent-status",
      title: "AI Agent Status",
      description: "Toggle your AI agent on/off. When active, it handles customer inquiries 24/7.",
      position: "bottom",
    },
    {
      id: "training-data",
      target: "#agent-training-section",
      title: "Training Your AI",
      description: "Add your business info, policies, and FAQs here. The AI uses this to answer customer questions accurately.",
      position: "top",
    },
    {
      id: "response-settings",
      target: "#response-config",
      title: "Response Settings",
      description: "Customize how your AI responds: tone, language, and when to escalate to humans.",
      position: "left",
    },
    {
      id: "test-chat",
      target: "#test-chat-interface",
      title: "Test Chat Interface",
      description: "Try out your AI! Send test messages to see how it responds before going live.",
      position: "top",
    },
  ],
};

/**
 * Order management tour
 */
export const ORDER_MANAGEMENT_TOUR_CONFIG: TourConfig = {
  id: "order-management",
  name: "Order Management System",
  autoStart: false,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: "orders-overview",
      target: "#orders-dashboard",
      title: "Orders Overview",
      description: "All your orders in one place. Filter by status, date, or customer.",
      position: "bottom",
    },
    {
      id: "order-filters",
      target: "#order-filter-controls",
      title: "Smart Filters",
      description: "Quickly find orders by status (pending, processing, delivered) or other criteria.",
      position: "right",
    },
    {
      id: "bulk-actions",
      target: "#bulk-actions-bar",
      title: "Bulk Actions",
      description: "Select multiple orders to update status, print labels, or export data.",
      position: "top",
    },
    {
      id: "order-details",
      target: "#order-detail-preview",
      title: "Quick Preview",
      description: "Click any order to see full details without leaving the page.",
      position: "left",
    },
  ],
};

/**
 * Analytics tour
 */
export const ANALYTICS_TOUR_CONFIG: TourConfig = {
  id: "analytics-tour",
  name: "Analytics & Insights",
  autoStart: false,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: "metrics-overview",
      target: "#analytics-header",
      title: "Analytics Overview",
      description: "Comprehensive insights into your business performance across all channels.",
      position: "bottom",
    },
    {
      id: "key-metrics",
      target: "#kpi-cards",
      title: "Key Metrics",
      description: "Track what matters: revenue, orders, conversion rate, and customer count.",
      position: "top",
    },
    {
      id: "trend-charts",
      target: "#trend-visualization",
      title: "Trend Analysis",
      description: "Visualize growth patterns over time. Compare periods and identify seasonal trends.",
      position: "bottom",
    },
    {
      id: "export-options",
      target: "#analytics-export",
      title: "Export Reports",
      description: "Download detailed reports as PDF or CSV for accounting or presentations.",
      position: "left",
    },
  ],
};

/**
 * All available tours mapped by route pattern
 */
export const TOURS_BY_ROUTE: Record<string, TourConfig> = {
  "/dashboard": DASHBOARD_TOUR_CONFIG,
  "/dashboard/ai-agent": AI_AGENT_TOUR_CONFIG,
  "/dashboard/orders": ORDER_MANAGEMENT_TOUR_CONFIG,
  "/dashboard/analytics": ANALYTICS_TOUR_CONFIG,
};

/**
 * Get tour config for current route
 */
export function getTourForRoute(pathname: string): TourConfig | null {
  for (const [routePattern, config] of Object.entries(TOURS_BY_ROUTE)) {
    if (pathname.startsWith(routePattern)) {
      return config;
    }
  }
  return null;
}

/**
 * Check if user has completed a specific tour
 */
export async function hasUserCompletedTour(
  userId: string,
  tourId: string
): Promise<boolean> {
  try {
    // In production, check database or localStorage
    // For now, use localStorage simulation
    if (typeof window === "undefined") return false;
    
    const completedTours = localStorage.getItem(`vayva_completed_tours_${userId}`);
    if (!completedTours) return false;
    
    const tours = JSON.parse(completedTours) as string[];
    return tours.includes(tourId);
  } catch {
    return false;
  }
}

/**
 * Mark tour as completed
 */
export async function markTourAsCompleted(
  userId: string,
  tourId: string
): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    
    const completedTours = localStorage.getItem(`vayva_completed_tours_${userId}`);
    const tours = completedTours ? JSON.parse(completedTours) : [];
    
    if (!tours.includes(tourId)) {
      tours.push(tourId);
      localStorage.setItem(`vayva_completed_tours_${userId}`, JSON.stringify(tours));
    }
  } catch (error) {
    console.error("[TOUR] Failed to mark tour as completed:", error);
  }
}

/**
 * Dismiss tour (user chose to skip)
 */
export async function dismissTour(
  userId: string,
  tourId: string
): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    
    const dismissedTours = localStorage.getItem(`vayva_dismissed_tours_${userId}`);
    const tours = dismissedTours ? JSON.parse(dismissedTours) : [];
    
    if (!tours.includes(tourId)) {
      tours.push(tourId);
      localStorage.setItem(`vayva_dismissed_tours_${userId}`, JSON.stringify(tours));
    }
  } catch (error) {
    console.error("[TOUR] Failed to dismiss tour:", error);
  }
}

/**
 * Check if user has dismissed a tour
 */
export function hasUserDismissedTour(userId: string, tourId: string): boolean {
  if (typeof window === "undefined") return false;
  
  const dismissedTours = localStorage.getItem(`vayva_dismissed_tours_${userId}`);
  if (!dismissedTours) return false;
  
  const tours = JSON.parse(dismissedTours) as string[];
  return tours.includes(tourId);
}
