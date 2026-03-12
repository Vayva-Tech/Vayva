import type { IndustrySlug } from "@/lib/templates/types";

// ---------------------------------------------------------------------------
// Autopilot Rule Definitions
//
// Static config — rules are evaluated by the autopilot engine against live
// business data. Each rule maps to one or more industries and defines what
// data it needs and what condition triggers it.
// ---------------------------------------------------------------------------

export type AutopilotCategory =
  | "inventory"
  | "pricing"
  | "marketing"
  | "engagement"
  | "operations"
  | "content"
  | "financial";

export interface AutopilotRuleDefinition {
  slug: string;
  title: string;
  description: string;
  category: AutopilotCategory;
  industries: IndustrySlug[] | "all";
  triggerCondition: string;
  promptTemplate: string;
  icon: string;
  severity: "critical" | "warning" | "info";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMMERCE_INDUSTRIES: IndustrySlug[] = [
  "retail",
  "fashion",
  "electronics",
  "beauty",
  "grocery",
  "one_product",
  "marketplace",
];

const BOOKING_INDUSTRIES: IndustrySlug[] = [
  "services",
  "automotive",
  "travel_hospitality",
  "real_estate",
  "education",
  "nightlife",
];

const ALL_INDUSTRIES = "all" as const;

// ---------------------------------------------------------------------------
// Rule Definitions (~35 rules across all 19 industries)
// ---------------------------------------------------------------------------

export const AUTOPILOT_RULES: AutopilotRuleDefinition[] = [
  // ── INVENTORY ──────────────────────────────────────────────────────────
  {
    slug: "dead_stock_markdown",
    title: "Dead Stock Markdown",
    description:
      "Suggest discounts for products with zero sales in the last 30 days.",
    category: "inventory",
    industries: COMMERCE_INDUSTRIES,
    triggerCondition: "deadStockCount > 0",
    promptTemplate: `You are a retail business advisor for a {{industryName}} store called "{{storeName}}".

These products have had ZERO sales in the last 30 days:
{{deadStockList}}

Suggest a markdown strategy. For each product, recommend a specific discount percentage (10-50%) based on how long it's been stagnant. Explain your reasoning briefly. Format as a numbered list.`,
    icon: "PackageMinus",
    severity: "warning",
  },
  {
    slug: "low_stock_reorder",
    title: "Low Stock Reorder Alert",
    description:
      "Flag products running low on stock based on recent sales velocity.",
    category: "inventory",
    industries: COMMERCE_INDUSTRIES,
    triggerCondition: "lowStockCount > 0",
    promptTemplate: `You are an inventory advisor for "{{storeName}}" ({{industryName}}).

These products are running low on stock:
{{lowStockList}}

For each, estimate days until stockout based on the sales velocity shown. Recommend reorder quantities and urgency level. Format as a numbered list.`,
    icon: "PackageSearch",
    severity: "critical",
  },
  {
    slug: "overstock_alert",
    title: "Overstock Detection",
    description:
      "Identify products with excess inventory relative to sales velocity.",
    category: "inventory",
    industries: COMMERCE_INDUSTRIES,
    triggerCondition: "overstockCount > 0",
    promptTemplate: `You are an inventory optimization advisor for "{{storeName}}" ({{industryName}}).

These products have high stock levels relative to their sales rate:
{{overstockList}}

Suggest strategies to move this inventory: bundle deals, flash sales, or cross-promotions. Be specific with actionable recommendations.`,
    icon: "Warehouse",
    severity: "info",
  },

  // ── PRICING ────────────────────────────────────────────────────────────
  {
    slug: "slow_mover_discount",
    title: "Slow Mover Discount Suggestion",
    description:
      "Recommend targeted discounts for products with declining sales trends.",
    category: "pricing",
    industries: COMMERCE_INDUSTRIES,
    triggerCondition: "slowMoverCount > 0",
    promptTemplate: `You are a pricing strategist for "{{storeName}}" ({{industryName}}).

These products have seen declining sales over the past 2 weeks:
{{slowMoverList}}

Suggest specific discount percentages or promotional strategies for each. Consider the product category and price point. Keep recommendations actionable.`,
    icon: "TrendingDown",
    severity: "warning",
  },
  {
    slug: "flash_sale_opportunity",
    title: "Flash Sale Opportunity",
    description:
      "Identify products that could benefit from a time-limited flash sale.",
    category: "pricing",
    industries: [...COMMERCE_INDUSTRIES, "food", "digital"],
    triggerCondition: "flashSaleCandidateCount > 0",
    promptTemplate: `You are a sales strategist for "{{storeName}}" ({{industryName}}).

Based on recent traffic and conversion data, these products are good candidates for a flash sale:
{{flashSaleCandidates}}

Recommend duration (2-24 hours), discount percentage, and the best day/time to run it. Explain why each product was selected.`,
    icon: "Zap",
    severity: "info",
  },

  // ── MARKETING ──────────────────────────────────────────────────────────
  {
    slug: "product_description_improve",
    title: "Product Description Improvement",
    description:
      "Generate improved descriptions for products with weak or missing copy.",
    category: "marketing",
    industries: ALL_INDUSTRIES,
    triggerCondition: "weakDescriptionCount > 0",
    promptTemplate: `You are a copywriter for "{{storeName}}" ({{industryName}}).

These products have weak or missing descriptions:
{{weakDescriptionList}}

Write compelling, SEO-friendly product descriptions for each (2-3 sentences). Match the brand tone: {{storeTone}}. Include key selling points and a call to action.`,
    icon: "PenLine",
    severity: "info",
  },
  {
    slug: "social_media_content",
    title: "Social Media Content Ideas",
    description:
      "Generate social media post ideas based on top-selling products and trends.",
    category: "marketing",
    industries: ALL_INDUSTRIES,
    triggerCondition: "hasTopSellingProducts",
    promptTemplate: `You are a social media manager for "{{storeName}}" ({{industryName}}).

Top-selling products this week:
{{topSellingList}}

Generate 3 social media post ideas (Instagram/WhatsApp Status). For each, include: caption text, suggested image description, and best posting time. Keep the tone {{storeTone}}.`,
    icon: "Share2",
    severity: "info",
  },
  {
    slug: "abandoned_cart_followup",
    title: "Abandoned Cart Follow-Up",
    description:
      "Draft follow-up messages for customers who abandoned their carts.",
    category: "marketing",
    industries: COMMERCE_INDUSTRIES,
    triggerCondition: "abandonedCartCount > 0",
    promptTemplate: `You are a customer recovery specialist for "{{storeName}}" ({{industryName}}).

{{abandonedCartCount}} customers abandoned their carts in the last 48 hours. Top abandoned products:
{{abandonedProducts}}

Draft 2 WhatsApp follow-up message templates: one friendly reminder (send after 2 hours) and one with a small incentive (send after 24 hours). Keep messages short and conversational.`,
    icon: "ShoppingCart",
    severity: "warning",
  },

  // ── CUSTOMER ENGAGEMENT ────────────────────────────────────────────────
  {
    slug: "dormant_customer_reengagement",
    title: "Dormant Customer Re-engagement",
    description:
      "Identify customers who haven't purchased in 60+ days and suggest re-engagement.",
    category: "engagement",
    industries: ALL_INDUSTRIES,
    triggerCondition: "dormantCustomerCount > 0",
    promptTemplate: `You are a customer retention specialist for "{{storeName}}" ({{industryName}}).

{{dormantCustomerCount}} customers haven't made a purchase in over 60 days.

Suggest 3 re-engagement strategies specific to the {{industryName}} industry. Include message templates for WhatsApp outreach. Consider offering personalized recommendations based on their purchase history.`,
    icon: "UserCheck",
    severity: "warning",
  },
  {
    slug: "review_request",
    title: "Review Request Campaign",
    description: "Identify recent buyers who could be asked for reviews.",
    category: "engagement",
    industries: ALL_INDUSTRIES,
    triggerCondition: "recentBuyersWithoutReview > 0",
    promptTemplate: `You are a customer success manager for "{{storeName}}" ({{industryName}}).

{{recentBuyersWithoutReview}} customers purchased in the last 7 days but haven't left a review.

Draft a friendly WhatsApp message template requesting a review. Make it personal, mention the product they bought, and keep it under 3 sentences.`,
    icon: "Star",
    severity: "info",
  },
  {
    slug: "vip_customer_reward",
    title: "VIP Customer Reward",
    description: "Identify top spenders and suggest exclusive offers.",
    category: "engagement",
    industries: ALL_INDUSTRIES,
    triggerCondition: "vipCustomerCount > 0",
    promptTemplate: `You are a loyalty strategist for "{{storeName}}" ({{industryName}}).

Your top {{vipCustomerCount}} customers by lifetime spend:
{{vipCustomerList}}

Suggest personalized reward strategies for each: early access, exclusive discounts, or loyalty perks. Be specific to the {{industryName}} industry.`,
    icon: "Crown",
    severity: "info",
  },

  // ── OPERATIONS (Food) ──────────────────────────────────────────────────
  {
    slug: "prep_time_optimization",
    title: "Prep Time Optimization",
    description:
      "Alert when average preparation time exceeds target thresholds.",
    category: "operations",
    industries: ["food"],
    triggerCondition: "avgPrepTimeMinutes > 20",
    promptTemplate: `You are a restaurant operations advisor for "{{storeName}}".

Average prep time is {{avgPrepTimeMinutes}} minutes (target: 20 min). Breakdown by menu category:
{{prepTimeBreakdown}}

Identify bottlenecks and suggest specific operational improvements: prep batching, menu simplification, or kitchen workflow changes.`,
    icon: "Timer",
    severity: "critical",
  },
  {
    slug: "kitchen_backlog_alert",
    title: "Kitchen Backlog Alert",
    description: "Flag when order queue exceeds manageable levels.",
    category: "operations",
    industries: ["food"],
    triggerCondition: "kitchenBacklog > 5",
    promptTemplate: `You are a restaurant operations advisor for "{{storeName}}".

Current kitchen backlog: {{kitchenBacklog}} orders. Average prep time: {{avgPrepTimeMinutes}} min.

Suggest immediate actions to clear the backlog: pause new orders, simplify menu temporarily, or prioritize high-value orders. Be practical and urgent.`,
    icon: "AlertTriangle",
    severity: "critical",
  },

  // ── OPERATIONS (Services/Bookings) ─────────────────────────────────────
  {
    slug: "no_show_followup",
    title: "No-Show Follow-Up",
    description: "Draft rebooking messages for customers who didn't show up.",
    category: "operations",
    industries: BOOKING_INDUSTRIES,
    triggerCondition: "noShowCount > 0",
    promptTemplate: `You are a booking manager for "{{storeName}}" ({{industryName}}).

{{noShowCount}} customers didn't show up for their appointments today.

Draft a friendly rebooking message template for WhatsApp. Be understanding (not accusatory), offer to reschedule, and mention any no-show policy if applicable.`,
    icon: "UserX",
    severity: "warning",
  },
  {
    slug: "empty_slot_filler",
    title: "Empty Slot Filler",
    description: "Suggest promotions to fill upcoming empty booking slots.",
    category: "operations",
    industries: BOOKING_INDUSTRIES,
    triggerCondition: "emptySlotCount > 3",
    promptTemplate: `You are a booking optimization advisor for "{{storeName}}" ({{industryName}}).

You have {{emptySlotCount}} unfilled slots in the next 3 days:
{{emptySlotDetails}}

Suggest strategies to fill them: last-minute discounts, WhatsApp blast to recent customers, or social media promotion. Be specific about timing and messaging.`,
    icon: "CalendarPlus",
    severity: "warning",
  },
  {
    slug: "overbooking_prevention",
    title: "Overbooking Prevention",
    description: "Alert when booking density approaches capacity limits.",
    category: "operations",
    industries: BOOKING_INDUSTRIES,
    triggerCondition: "bookingUtilization > 85",
    promptTemplate: `You are a capacity planning advisor for "{{storeName}}" ({{industryName}}).

Booking utilization is at {{bookingUtilization}}% for the next 3 days. Peak slots:
{{peakSlotDetails}}

Recommend capacity management strategies: waitlisting, extending hours, or redistributing bookings to off-peak times.`,
    icon: "ShieldAlert",
    severity: "warning",
  },

  // ── OPERATIONS (Events) ────────────────────────────────────────────────
  {
    slug: "low_ticket_boost",
    title: "Low Ticket Sales Boost",
    description:
      "Suggest promotional push when event tickets are selling slowly.",
    category: "operations",
    industries: ["events", "nightlife"],
    triggerCondition: "lowTicketSalesEventCount > 0",
    promptTemplate: `You are an event marketing advisor for "{{storeName}}".

These upcoming events have low ticket sales:
{{lowTicketEvents}}

For each event, suggest a promotional strategy: early bird extension, group discounts, influencer partnerships, or social media campaign. Include specific messaging ideas.`,
    icon: "Ticket",
    severity: "warning",
  },

  // ── OPERATIONS (B2B) ───────────────────────────────────────────────────
  {
    slug: "overdue_invoice_reminder",
    title: "Overdue Invoice Reminder",
    description: "Draft follow-up communications for overdue invoices.",
    category: "operations",
    industries: ["b2b"],
    triggerCondition: "overdueInvoiceCount > 0",
    promptTemplate: `You are a B2B accounts receivable advisor for "{{storeName}}".

{{overdueInvoiceCount}} invoices are overdue:
{{overdueInvoiceList}}

Draft professional follow-up email templates for 3 escalation stages: friendly reminder (7 days), firm follow-up (14 days), and final notice (30 days). Keep tone professional but firm.`,
    icon: "FileWarning",
    severity: "critical",
  },
  {
    slug: "quote_followup",
    title: "Pending Quote Follow-Up",
    description: "Remind about quotes that haven't been accepted.",
    category: "operations",
    industries: ["b2b"],
    triggerCondition: "pendingQuoteCount > 0",
    promptTemplate: `You are a B2B sales advisor for "{{storeName}}".

{{pendingQuoteCount}} quotes are pending acceptance for over 5 days:
{{pendingQuoteList}}

Draft a follow-up message for each. Address potential objections, offer to adjust terms, and create urgency without being pushy.`,
    icon: "FileText",
    severity: "warning",
  },

  // ── CONTENT ────────────────────────────────────────────────────────────
  {
    slug: "blog_content_ideas",
    title: "Blog Content Ideas",
    description:
      "Generate blog post ideas based on trending products and customer questions.",
    category: "content",
    industries: ["blog_media", "education", "creative_portfolio"],
    triggerCondition: "daysSinceLastPost > 7",
    promptTemplate: `You are a content strategist for "{{storeName}}" ({{industryName}}).

It's been {{daysSinceLastPost}} days since the last blog post. Recent trending topics in the store:
{{trendingTopics}}

Suggest 5 blog post ideas with titles, brief outlines (3 bullet points each), and estimated word counts. Focus on topics that drive traffic and conversions.`,
    icon: "Newspaper",
    severity: "info",
  },
  {
    slug: "seo_title_improvement",
    title: "SEO Title Improvement",
    description:
      "Suggest improved SEO titles for products with poor search visibility.",
    category: "content",
    industries: ALL_INDUSTRIES,
    triggerCondition: "poorSeoTitleCount > 0",
    promptTemplate: `You are an SEO specialist for "{{storeName}}" ({{industryName}}).

These products have weak or generic titles that hurt search visibility:
{{poorSeoTitleList}}

Rewrite each title to be SEO-friendly: include relevant keywords, keep under 60 characters, and make them compelling for click-through. Show before/after.`,
    icon: "Search",
    severity: "info",
  },

  // ── NONPROFIT ──────────────────────────────────────────────────────────
  {
    slug: "donor_reengagement",
    title: "Donor Re-engagement",
    description: "Identify lapsed donors and suggest re-engagement campaigns.",
    category: "engagement",
    industries: ["nonprofit"],
    triggerCondition: "lapsedDonorCount > 0",
    promptTemplate: `You are a fundraising advisor for "{{storeName}}" (nonprofit).

{{lapsedDonorCount}} donors haven't contributed in over 90 days.

Suggest a re-engagement campaign: personalized thank-you messages, impact reports showing how their donations helped, and a compelling ask for renewed support. Draft 2 message templates.`,
    icon: "Heart",
    severity: "warning",
  },
  {
    slug: "campaign_ending_soon",
    title: "Campaign Ending Soon",
    description:
      "Alert about fundraising campaigns approaching their end date.",
    category: "operations",
    industries: ["nonprofit"],
    triggerCondition: "campaignsEndingSoonCount > 0",
    promptTemplate: `You are a campaign manager for "{{storeName}}" (nonprofit).

These campaigns are ending within 7 days:
{{campaignsEndingSoon}}

For each, suggest a final push strategy: urgency messaging, matching donation appeals, or social media countdown. Draft specific messages.`,
    icon: "Clock",
    severity: "warning",
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────
  {
    slug: "low_completion_nudge",
    title: "Low Completion Rate Nudge",
    description: "Encourage learners who haven't completed their courses.",
    category: "engagement",
    industries: ["education"],
    triggerCondition: "lowCompletionLearnerCount > 0",
    promptTemplate: `You are an education engagement specialist for "{{storeName}}".

{{lowCompletionLearnerCount}} learners are enrolled but haven't completed their courses (below 50% progress).

Draft encouraging messages to re-engage them. Include: progress acknowledgment, next milestone preview, and a motivational nudge. Create 2 template variations.`,
    icon: "GraduationCap",
    severity: "warning",
  },

  // ── REAL ESTATE ────────────────────────────────────────────────────────
  {
    slug: "stale_listing_refresh",
    title: "Stale Listing Refresh",
    description:
      "Suggest updates for property listings that haven't had inquiries.",
    category: "marketing",
    industries: ["real_estate"],
    triggerCondition: "staleListingCount > 0",
    promptTemplate: `You are a real estate marketing advisor for "{{storeName}}".

These listings have had no inquiries in 14+ days:
{{staleListings}}

For each, suggest: updated description copy, new photo angles to request, price adjustment considerations, and promotional strategies to increase visibility.`,
    icon: "Building",
    severity: "warning",
  },

  // ── AUTOMOTIVE ─────────────────────────────────────────────────────────
  {
    slug: "test_drive_followup",
    title: "Test Drive Follow-Up",
    description:
      "Draft follow-up messages for customers who completed test drives.",
    category: "engagement",
    industries: ["automotive"],
    triggerCondition: "recentTestDriveCount > 0",
    promptTemplate: `You are an automotive sales advisor for "{{storeName}}".

{{recentTestDriveCount}} customers completed test drives in the last 7 days but haven't purchased:
{{testDriveList}}

Draft personalized follow-up messages for each. Reference the specific vehicle they tested, address common objections, and create a sense of limited availability.`,
    icon: "Car",
    severity: "info",
  },

  // ── TRAVEL & HOSPITALITY ───────────────────────────────────────────────
  {
    slug: "low_occupancy_promotion",
    title: "Low Occupancy Promotion",
    description: "Suggest promotions for periods with low booking occupancy.",
    category: "pricing",
    industries: ["travel_hospitality"],
    triggerCondition: "lowOccupancyPeriodCount > 0",
    promptTemplate: `You are a hospitality revenue manager for "{{storeName}}".

These upcoming periods have low occupancy:
{{lowOccupancyPeriods}}

Suggest dynamic pricing strategies: last-minute deals, package bundles (stay + experience), or targeted promotions for specific customer segments.`,
    icon: "BedDouble",
    severity: "warning",
  },

  // ── FINANCIAL (All) ────────────────────────────────────────────────────
  {
    slug: "revenue_trend_insight",
    title: "Revenue Trend Insight",
    description: "Analyze revenue trends and provide actionable insights.",
    category: "financial",
    industries: ALL_INDUSTRIES,
    triggerCondition: "hasRevenueData",
    promptTemplate: `You are a business analyst for "{{storeName}}" ({{industryName}}).

Revenue data for the last 30 days:
{{revenueData}}

Provide a brief analysis: identify trends (growth/decline), compare to previous period, highlight best/worst performing days, and suggest 2-3 specific actions to improve revenue next month.`,
    icon: "TrendingUp",
    severity: "info",
  },
  {
    slug: "expense_anomaly",
    title: "Expense Anomaly Detection",
    description: "Flag unusual expense patterns that may need attention.",
    category: "financial",
    industries: ALL_INDUSTRIES,
    triggerCondition: "hasExpenseAnomaly",
    promptTemplate: `You are a financial advisor for "{{storeName}}" ({{industryName}}).

An unusual expense pattern was detected:
{{anomalyDetails}}

Explain what this anomaly might indicate, whether it requires immediate action, and suggest next steps for investigation.`,
    icon: "AlertOctagon",
    severity: "warning",
  },

  // ── MARKETPLACE ────────────────────────────────────────────────────────
  {
    slug: "dispute_resolution_guide",
    title: "Dispute Resolution Guide",
    description: "Provide guidance for resolving open customer disputes.",
    category: "operations",
    industries: ["marketplace"],
    triggerCondition: "openDisputeCount > 0",
    promptTemplate: `You are a marketplace operations advisor for "{{storeName}}".

{{openDisputeCount}} customer disputes are currently open:
{{disputeList}}

For each dispute, suggest a resolution approach: refund, replacement, partial credit, or mediation. Consider the dispute reason and customer history. Draft response templates.`,
    icon: "Scale",
    severity: "critical",
  },

  // ── CREATIVE PORTFOLIO ─────────────────────────────────────────────────
  {
    slug: "portfolio_refresh",
    title: "Portfolio Refresh Suggestion",
    description:
      "Suggest updates to showcase recent work and attract new clients.",
    category: "content",
    industries: ["creative_portfolio"],
    triggerCondition: "daysSincePortfolioUpdate > 30",
    promptTemplate: `You are a creative business advisor for "{{storeName}}".

The portfolio hasn't been updated in {{daysSincePortfolioUpdate}} days. Recent completed projects:
{{recentProjects}}

Suggest which projects to feature prominently, how to write compelling case study descriptions, and social media teasers to drive traffic to the portfolio.`,
    icon: "Palette",
    severity: "info",
  },

  // ── NIGHTLIFE ──────────────────────────────────────────────────────────
  {
    slug: "table_utilization_optimize",
    title: "Table Utilization Optimization",
    description:
      "Suggest strategies to improve table turnover and reservation management.",
    category: "operations",
    industries: ["nightlife"],
    triggerCondition: "tableUtilizationBelow60",
    promptTemplate: `You are a nightlife venue operations advisor for "{{storeName}}".

Table utilization is below 60% for upcoming nights:
{{utilizationDetails}}

Suggest strategies: themed nights, happy hour extensions, group booking promotions, or influencer partnerships. Be specific about which nights need the most attention.`,
    icon: "Wine",
    severity: "warning",
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getRulesForIndustry(
  industrySlug: IndustrySlug,
): AutopilotRuleDefinition[] {
  return AUTOPILOT_RULES.filter(
    (r) => r.industries === "all" || r.industries?.includes(industrySlug),
  );
}

export function getRuleBySlug(
  slug: string,
): AutopilotRuleDefinition | undefined {
  return AUTOPILOT_RULES.find((r) => r.slug === slug);
}
