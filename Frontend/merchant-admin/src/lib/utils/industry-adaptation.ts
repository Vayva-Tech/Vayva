// ============================================================================
// Industry Adaptation Utilities
// ============================================================================
// Maps industry types to appropriate dashboard terminology and components
// ============================================================================

import type { IndustrySlug } from '@vayva/industry-core';

export interface IndustryConfig {
  displayName: string;
  primaryMetric: string;
  secondaryMetric: string;
  tertiaryMetric: string;
  quaternaryMetric: string;
  primaryAction: string;
  primaryActionIcon: string;
  headerSubtitle: string;
  taskCategories: {
    today: string[];
    tomorrow: string[];
  };
  aiAssistantLabels: {
    captured: string;
    autoOrders: string;
    avgResponse: string;
    satisfaction: string;
  };
  chartTitles: {
    main: string;
    legend1: string;
    legend2: string;
  };
  rightPanelSections: string[];
}

// Industry configuration mapping
export const INDUSTRY_ADAPTATIONS: Record<IndustrySlug, IndustryConfig> = {
  // Retail/E-commerce
  retail: {
    displayName: "Store",
    primaryMetric: "REVENUE",
    secondaryMetric: "ORDERS",
    tertiaryMetric: "CUSTOMERS",
    quaternaryMetric: "CONVERSION",
    primaryAction: "Add Product",
    primaryActionIcon: "Plus",
    headerSubtitle: "Manage and track your store",
    taskCategories: {
      today: [
        "Review 3 pending orders",
        "Restock Ankara Dress",
        "Reply to customer inquiry"
      ],
      tomorrow: [
        "Process returns",
        "Update inventory",
        "Prepare shipments"
      ]
    },
    aiAssistantLabels: {
      captured: "conversations",
      autoOrders: "created",
      avgResponse: "Response Time",
      satisfaction: "Satisfaction"
    },
    chartTitles: {
      main: "Revenue & AI Conversions",
      legend1: "Revenue",
      legend2: "AI Orders"
    },
    rightPanelSections: ["AI Performance", "Inventory Alerts", "Top Customers"]
  },

  // Food & Restaurant
  food: {
    displayName: "Kitchen",
    primaryMetric: "REVENUE",
    secondaryMetric: "ORDERS",
    tertiaryMetric: "TABLES",
    quaternaryMetric: "AVG ORDER VALUE",
    primaryAction: "New Order",
    primaryActionIcon: "Plus",
    headerSubtitle: "Monitor kitchen operations",
    taskCategories: {
      today: [
        "Prepare 15 pending orders",
        "Restock ingredients",
        "Clean prep area"
      ],
      tomorrow: [
        "Plan tomorrow's menu",
        "Check supplier deliveries",
        "Staff scheduling"
      ]
    },
    aiAssistantLabels: {
      captured: "orders",
      autoOrders: "processed",
      avgResponse: "Prep Time",
      satisfaction: "Food Rating"
    },
    chartTitles: {
      main: "Daily Revenue & Orders",
      legend1: "Revenue",
      legend2: "Orders"
    },
    rightPanelSections: ["Kitchen Status", "Ingredient Alerts", "Popular Items"]
  },

  // Legal
  legal: {
    displayName: "Practice",
    primaryMetric: "REVENUE",
    secondaryMetric: "CASES",
    tertiaryMetric: "CLIENTS",
    quaternaryMetric: "BILLABLE HOURS",
    primaryAction: "New Case",
    primaryActionIcon: "Plus",
    headerSubtitle: "Manage legal practice operations",
    taskCategories: {
      today: [
        "Review 3 pending cases",
        "Draft contract for ABC Corp",
        "Court appearance at 2 PM"
      ],
      tomorrow: [
        "Client meeting scheduled",
        "Document filing deadline",
        "Team case review"
      ]
    },
    aiAssistantLabels: {
      captured: "cases",
      autoOrders: "documents",
      avgResponse: "Response Time",
      satisfaction: "Client Rating"
    },
    chartTitles: {
      main: "Case Revenue & Billable Hours",
      legend1: "Revenue",
      legend2: "Hours"
    },
    rightPanelSections: ["Case Status", "Upcoming Deadlines", "Client Matters"]
  },

  // Healthcare
  healthcare: {
    displayName: "Clinic",
    primaryMetric: "REVENUE",
    secondaryMetric: "PATIENTS",
    tertiaryMetric: "APPOINTMENTS",
    quaternaryMetric: "AVG CONSULTATION",
    primaryAction: "New Patient",
    primaryActionIcon: "Plus",
    headerSubtitle: "Monitor clinic operations",
    taskCategories: {
      today: [
        "Review 5 patient records",
        "Follow-up on lab results",
        "Schedule surgery consultation"
      ],
      tomorrow: [
        "Patient discharge planning",
        "Medical supply restocking",
        "Staff shift coordination"
      ]
    },
    aiAssistantLabels: {
      captured: "consultations",
      autoOrders: "prescriptions",
      avgResponse: "Wait Time",
      satisfaction: "Patient Rating"
    },
    chartTitles: {
      main: "Patient Flow & Revenue",
      legend1: "Revenue",
      legend2: "Patients"
    },
    rightPanelSections: ["Patient Queue", "Medication Alerts", "Staff Schedule"]
  },

  // Education
  education: {
    displayName: "School",
    primaryMetric: "ENROLLMENT",
    secondaryMetric: "STUDENTS",
    tertiaryMetric: "COURSES",
    quaternaryMetric: "COMPLETION RATE",
    primaryAction: "New Course",
    primaryActionIcon: "Plus",
    headerSubtitle: "Manage educational programs",
    taskCategories: {
      today: [
        "Grade 12 assignment submissions",
        "Parent-teacher conference",
        "Curriculum planning"
      ],
      tomorrow: [
        "Exam schedule preparation",
        "Student performance review",
        "Faculty meeting"
      ]
    },
    aiAssistantLabels: {
      captured: "interactions",
      autoOrders: "assignments",
      avgResponse: "Response Time",
      satisfaction: "Student Rating"
    },
    chartTitles: {
      main: "Enrollment & Course Progress",
      legend1: "Enrollment",
      legend2: "Completion"
    },
    rightPanelSections: ["Class Schedule", "Grade Alerts", "Student Progress"]
  },

  // Real Estate
  real_estate: {
    displayName: "Agency",
    primaryMetric: "REVENUE",
    secondaryMetric: "LISTINGS",
    tertiaryMetric: "SHOWINGS",
    quaternaryMetric: "CONVERSION RATE",
    primaryAction: "New Listing",
    primaryActionIcon: "Plus",
    headerSubtitle: "Track property transactions",
    taskCategories: {
      today: [
        "3 property showings scheduled",
        "Client follow-up calls",
        "Contract review"
      ],
      tomorrow: [
        "Market analysis report",
        "New listing photoshoot",
        "MLS update"
      ]
    },
    aiAssistantLabels: {
      captured: "inquiries",
      autoOrders: "listings",
      avgResponse: "Response Time",
      satisfaction: "Client Rating"
    },
    chartTitles: {
      main: "Sales Volume & Listings",
      legend1: "Revenue",
      legend2: "Listings"
    },
    rightPanelSections: ["Property Pipeline", "Market Alerts", "Client Leads"]
  },

  // SaaS
  saas: {
    displayName: "Platform",
    primaryMetric: "MRR",
    secondaryMetric: "SUBSCRIPTIONS",
    tertiaryMetric: "ACTIVE USERS",
    quaternaryMetric: "CHURN RATE",
    primaryAction: "New Feature",
    primaryActionIcon: "Plus",
    headerSubtitle: "Monitor platform performance",
    taskCategories: {
      today: [
        "Deploy version 2.4.1",
        "Investigate uptime alert",
        "Customer support tickets"
      ],
      tomorrow: [
        "Feature roadmap planning",
        "Security audit preparation",
        "Team sprint review"
      ]
    },
    aiAssistantLabels: {
      captured: "support tickets",
      autoOrders: "deployments",
      avgResponse: "Resolution Time",
      satisfaction: "CSAT Score"
    },
    chartTitles: {
      main: "Revenue Growth & User Adoption",
      legend1: "MRR",
      legend2: "Users"
    },
    rightPanelSections: ["System Health", "Deployment Status", "User Feedback"]
  },

  // Creative Agency
  creative: {
    displayName: "Studio",
    primaryMetric: "REVENUE",
    secondaryMetric: "PROJECTS",
    tertiaryMetric: "CLIENTS",
    quaternaryMetric: "ON-TIME DELIVERY",
    primaryAction: "New Project",
    primaryActionIcon: "Plus",
    headerSubtitle: "Manage creative workflows",
    taskCategories: {
      today: [
        "Client presentation prep",
        "Design revision requests",
        "Team collaboration session"
      ],
      tomorrow: [
        "Project milestone review",
        "Creative asset delivery",
        "Client feedback incorporation"
      ]
    },
    aiAssistantLabels: {
      captured: "briefs",
      autoOrders: "deliverables",
      avgResponse: "Turnaround Time",
      satisfaction: "Client Rating"
    },
    chartTitles: {
      main: "Project Revenue & Delivery",
      legend1: "Revenue",
      legend2: "Projects"
    },
    rightPanelSections: ["Project Timeline", "Resource Allocation", "Creative Assets"]
  },

  // Default fallback for any unmapped industry
  default: {
    displayName: "Business",
    primaryMetric: "REVENUE",
    secondaryMetric: "ACTIVITY",
    tertiaryMetric: "CUSTOMERS",
    quaternaryMetric: "GROWTH",
    primaryAction: "New Activity",
    primaryActionIcon: "Plus",
    headerSubtitle: "Monitor business performance",
    taskCategories: {
      today: [
        "Review daily operations",
        "Follow up on priorities",
        "Team coordination"
      ],
      tomorrow: [
        "Strategic planning",
        "Process improvements",
        "Stakeholder updates"
      ]
    },
    aiAssistantLabels: {
      captured: "interactions",
      autoOrders: "activities",
      avgResponse: "Response Time",
      satisfaction: "Rating"
    },
    chartTitles: {
      main: "Performance Metrics",
      legend1: "Metric 1",
      legend2: "Metric 2"
    },
    rightPanelSections: ["Performance", "Alerts", "Key Contacts"]
  }
};

// Get industry configuration with fallback
export function getIndustryConfig(industry: IndustrySlug): IndustryConfig {
  return INDUSTRY_ADAPTATIONS[industry] || INDUSTRY_ADAPTATIONS.default;
}

// Get adaptive header title
export function getAdaptiveHeaderTitle(industry: IndustrySlug): string {
  const config = getIndustryConfig(industry);
  return `${config.displayName} Dashboard`;
}

// Get adaptive header subtitle
export function getAdaptiveHeaderSubtitle(industry: IndustrySlug): string {
  return getIndustryConfig(industry).headerSubtitle;
}

// Get adaptive primary action
export function getAdaptivePrimaryAction(industry: IndustrySlug): { label: string; icon: string } {
  const config = getIndustryConfig(industry);
  return {
    label: config.primaryAction,
    icon: config.primaryActionIcon
  };
}

// Get adaptive metrics configuration
export function getAdaptiveMetrics(industry: IndustrySlug): [string, string, string, string] {
  const config = getIndustryConfig(industry);
  return [
    config.primaryMetric,
    config.secondaryMetric,
    config.tertiaryMetric,
    config.quaternaryMetric
  ];
}

// Get adaptive task suggestions
export function getAdaptiveTasks(industry: IndustrySlug, period: 'today' | 'tomorrow' = 'today'): string[] {
  const config = getIndustryConfig(industry);
  return config.taskCategories[period] || config.taskCategories.today;
}

// Get adaptive AI assistant labels
export function getAdaptiveAILabels(industry: IndustrySlug) {
  return getIndustryConfig(industry).aiAssistantLabels;
}

// Get adaptive chart titles
export function getAdaptiveChartTitles(industry: IndustrySlug) {
  return getIndustryConfig(industry).chartTitles;
}

// Get adaptive right panel sections
export function getAdaptiveRightPanelSections(industry: IndustrySlug): string[] {
  return getIndustryConfig(industry).rightPanelSections;
}