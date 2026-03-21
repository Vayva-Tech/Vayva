import type { IndustryContent } from "@/components/marketing/IndustryPageClient";

export const landingContent = {
  heroBadge: "Business Operating System • Powered by Artificial Intelligence",
  heroTitle: "The commerce operating system",
  heroHighlight: "that runs your business smoothly",
  heroDescription:
    "Turn WhatsApp conversations into organized business records. Track orders, manage inventory, and grow your revenue—all in one command center. AI handles the busywork while you focus on growth.",
  heroStats: ["7-day free trial", "No credit card", "AI-powered automation"],
  trustTitle: "Powering commerce with intelligent automation.",
  trustHighlights: [
    "Paystack payments",
    "Kwik delivery",
    "AI order capture",
    "Smart insights",
    "WhatsApp & Instagram",
  ],
  platformPillars: [
    {
      title: "Unified order capture",
      description:
        "Smart system converts WhatsApp, Instagram, and web requests into structured orders automatically.",
    },
    {
      title: "Instant payments",
      description:
        "Paystack-powered cards, transfers, USSD, and global payments in Naira. All automated.",
    },
    {
      title: "Storefront builder",
      description:
        "Professional templates with easy customization. Free plan includes 4 templates; upgrade for full library.",
    },
    {
      title: "Operational command",
      description:
        "Inventory, delivery, customers, campaigns, and payouts—all in sync. AI-powered insights guide your decisions.",
    },
  ],
  workflowSteps: [
    {
      step: "01",
      title: "Connect your channels",
      description: "Sync WhatsApp, Instagram, storefront, and payments in minutes.",
    },
    {
      step: "02",
      title: "Set up your storefront",
      description: "Choose from professional templates and customize your brand.",
    },
    {
      step: "03",
      title: "Automate order capture",
      description: "Every request from WhatsApp or Instagram is parsed and logged automatically.",
    },
    {
      step: "04",
      title: "Deliver with confidence",
      description: "Track dispatch, inventory, and team tasks in one unified timeline.",
    },
    {
      step: "05",
      title: "Scale the business",
      description: "Use integrated features and AI insights to grow faster.",
    },
  ],
  infrastructure: [
    {
      title: "Professional Templates",
      description:
        "Choose from ready-made designs. Free plan includes 4 templates; upgrade to unlock the full library.",
    },
    {
      title: "AI-Powered Automation",
      description:
        "WhatsApp and Instagram conversations automatically converted into structured orders.",
    },
    {
      title: "Intelligent performance",
      description:
        "Optimized with AI for multiple industries, providing smart recommendations.",
    },
    {
      title: "Bank-grade security",
      description: "Encrypted transactions, PCI compliance, and secure payouts.",
    },
    {
      title: "Always-on reliability",
      description:
        "Resilient infrastructure that keeps revenue flowing every day.",
    },
    {
      title: "Human support",
      description: "Success managers who understand commerce at scale.",
    },
  ],
};

export const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for testing ideas and side hustles",
    features: [
      "4 included templates",
      "Basic storefront with Vayva branding",
      "Standard analytics dashboard",
      "WhatsApp order capture",
      "Paystack payment integration",
    ],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Starter",
    price: 25000,
    description: "For growing businesses ready to scale",
    features: [
      "Up to 500 products",
      "Unlimited orders",
      "Vayva Automation (WhatsApp & Instagram)",
      "Storefront setup & customization",
      "Advanced conversation customization",
      "Remove Vayva branding",
      "Priority support & training",
      "7-day free trial included",
    ],
    cta: "Start Growing",
    href: "/checkout?plan=starter",
    popular: true,
    trialDays: 7,
  },
  {
    name: "Pro",
    price: 40000,
    description: "High-volume sellers scaling operations",
    features: [
      "Everything in Starter, plus:",
      "Advanced conversation customization",
      "Multi-location & warehouse support",
      "API access for custom integrations",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options available",
    ],
    cta: "Scale Your Business",
    href: "/checkout?plan=pro",
  },
];

export const aboutContent = {
  heroTitle: "Building tools that support",
  heroHighlight: "business owners everywhere",
  heroDescription:
    "Vayva was born from a simple observation: millions of businesses run on WhatsApp, but the platform wasn't built for commerce. We're changing that.",
  stats: [
    { value: "2026", label: "Founded" },
    { value: "Global", label: "Built for businesses worldwide" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "System availability" },
  ],
  founder: {
    name: "Nyamsi Fredrick",
    role: "Founder",
    image: "/images/nyamsi-fredrick.png",
  },
  storyTitle: "It started with a side hustle",
  storyParagraphs: [
    "Like many Nigerians, I had a 9-to-5 that wasn’t quite enough. So I started selling on WhatsApp—clothes, gadgets, whatever had margin. But instead of freedom, I got stress.",
    "Every night, 50+ unread messages. Manual replies. Missed orders. Lost sales. I was working two jobs but only getting paid for one.",
    "African commerce doesn’t need another Shopify. It needs tools built for how we actually sell—through conversations, relationships, and trust.",
  ],
  storyQuote:
    "Vayva is that tool. Built by Africans, for African businesses.",
  missionTitle: "Our Mission",
  missionQuote:
    "Empower every African business to operate at the speed of chat with the rigor of a bank.",
  timeline: [
    { year: "2026", event: "Vayva founded" },
    { year: "2026", event: "AI order capture launch" },
  ],
  values: [
    {
      key: "simplicity",
      title: "Radical simplicity",
      description:
        "Every feature is designed for immediate clarity and zero learning curve.",
    },
    {
      key: "reliability",
      title: "Relentless reliability",
      description:
        "When businesses depend on you, downtime isn’t an option.",
    },
    {
      key: "african",
      title: "African-first design",
      description:
        "Built from the ground up for Nigerian connectivity, power, and business realities.",
    },
  ],
  backing: ["Paystack", "YouVerify", "Kwik Delivery", "123Design"],
  ctaTitle: "Join us in building the future",
  ctaDescription:
    "We’re hiring engineers, designers, and operators who believe African commerce deserves world-class tools.",
  ctaPrimary: { label: "Get in touch", href: "/contact" },
  ctaSecondary: { label: "Start using Vayva", href: "/signup" },
};

export const contactContent = {
  heroTitle: "Let’s talk.",
  heroDescription:
    "We’re here to help you grow. Reach out to our team for support, sales, or partnerships.",
  sections: [
    {
      title: "Support",
      description: "Our support team is available 24/7 on WhatsApp and Email.",
      email: "support@vayva.ng",
    },
    {
      title: "General Inquiries",
      description: "Questions about Vayva? Partnerships? We’d love to hear from you.",
      email: "hello@vayva.ng",
    },
    {
      title: "Office",
      description:
        "4 Balarabe Musa Crescent, Victoria Island, Lagos, Nigeria.",
    },
  ],
  socials: [
    { label: "Twitter", href: "https://twitter.com/vayva_ng" },
    { label: "LinkedIn", href: "https://linkedin.com/company/vayva" },
    { label: "Instagram", href: "https://instagram.com/vayva.ng" },
  ],
};

export const trustContent = {
  heroTitle: "Trust & Security at Vayva",
  heroDescription:
    "We are committed to providing a secure, reliable, and compliant platform for your business operations.",
  pillars: [
    {
      title: "Secure Authentication",
      description:
        "Industry-standard authentication with optional two-factor verification for account protection.",
    },
    {
      title: "Role-Based Access",
      description:
        "Control who can access what within your organization through granular permission settings.",
    },
    {
      title: "Comprehensive Audit Logs",
      description:
        "Track all critical actions within your account for transparency and accountability.",
    },
  ],
  complianceTitle: "Data Privacy & Compliance",
  complianceDescription:
    "We handle your data responsibly and in accordance with applicable Nigerian regulations.",
  complianceCards: [
    {
      title: "Data Isolation",
      description:
        "Your merchant data is logically separated and never shared with other businesses.",
    },
    {
      title: "Regulatory Compliance",
      description:
        "We comply with Nigerian data protection and commerce regulations.",
    },
    {
      title: "User Control",
      description:
        "You maintain control over your data with export and deletion capabilities.",
    },
    {
      title: "Privacy Policy",
      description:
        "All data handling is governed by our comprehensive Privacy Policy.",
    },
  ],
  paymentsTitle: "Secure Payment Handling",
  paymentsDescription:
    "We take payment security seriously. Your customers' financial information is protected through industry-standard practices.",
  paymentHighlights: [
    {
      title: "No Card Storage",
      description:
        "We do not store sensitive card data on our servers. All payment processing is handled by certified partners.",
    },
    {
      title: "Trusted Partners",
      description:
        "We work with regulated payment providers to ensure secure transaction processing.",
    },
    {
      title: "Transaction Monitoring",
      description:
        "All transactions are monitored for suspicious activity to protect both merchants and customers.",
    },
  ],
  reliabilityTitle: "Built to stay online.",
  reliabilityDescription:
    "We understand that downtime means lost revenue. Our infrastructure is designed for reliability.",
  reliabilityCards: [
    {
      title: "System Monitoring",
      description:
        "24/7 automated monitoring of all critical systems and services.",
    },
    {
      title: "Incident Response",
      description:
        "Dedicated team ready to respond to and resolve any platform issues.",
    },
    {
      title: "Status Transparency",
      description:
        "Real-time system status available to all merchants at any time.",
    },
  ],
  ctaTitle: "Questions about security?",
  ctaDescription:
    "We are transparent about how we protect your business. Review our policies or check our system status.",
  ctaPrimary: { label: "View System Status", href: "/system-status" },
  ctaSecondary: { label: "Legal & Compliance", href: "/legal" },
};

export const helpContent = {
  heroTitle: "Help Center",
  heroDescription:
    "Find answers to common questions, learn how to use Vayva, or reach our support team directly.",
  searchPlaceholder: "Search for a topic...",
  contactTitle: "Contact",
  contactLinks: [
    { label: "support@vayva.ng", href: "mailto:support@vayva.ng", icon: "EnvelopeSimple" },
    { label: "Open a ticket", href: "/contact", icon: "HandWaving" },
  ],
  emptySearchTitle: "No results found",
  emptySearchDescription: "No results for",
};

export const howItWorksContent = {
  heroTitle: "How Vayva Works",
  heroDescription:
    "Vayva acts as the operating system for your WhatsApp business. We turn messy chat threads into structured, automated workflows so you can scale without the chaos.",
  primaryCta: { label: "Get Started", href: "/signup" },
  secondaryCta: { label: "View Pricing", href: "/pricing" },
  flowTitle: "From Conversation to Conversion",
  flowDescription: "Five steps to professionalize your business.",
  steps: [
    {
      step: "1",
      title: "Connect WhatsApp",
      description:
        "Link your existing business number safely. Vayva immediately starts listening for customer intent, turning \"how much?\" into structured product queries.",
    },
    {
      step: "2",
      title: "Choose a Store Template",
      description:
        "Select from professionally designed templates. Free plan includes 4 templates; upgrade to unlock more designs. Preview, customize, and launch—no coding needed.",
    },
    {
      step: "3",
      title: "Customize Your Storefront",
      description:
        "Use the visual editor to add your brand colors, logo, and products. Drag-and-drop customization that anyone can use. See changes live and publish when you're ready.",
    },
    {
      step: "4",
      title: "Accept Payments",
      description:
        "Accept cards (Visa, Mastercard), bank transfers, USSD, and mobile money powered by Paystack. All payment methods Nigerians use, integrated automatically.",
    },
    {
      step: "5",
      title: "Fulfill Orders & Delivery",
      description:
        "Track every order in your unified dashboard. Connect with Kwik Delivery for dispatch, and let Vayva send automated status updates to customers via WhatsApp.",
    },
  ],
  stagesTitle: "Built for Every Stage",
  stages: [
    {
      title: "Solo Sellers",
      description:
        "Perfect for Instagram vendors and side-hustlers. Get a professional link-in-bio store with ready-made templates. Stop manually replying to DMs—let AI handle order capture.",
    },
    {
      title: "Small Businesses",
      description:
        "For shops with physical inventory and staff. Manage catalogue, track stock with real-time alerts, and handle delivery logistics from one dashboard with integrated features.",
    },
    {
      title: "Growing Brands",
      description:
        "Scale your operations with automated workflows, team permissions, and deep analytics without breaking your personal WhatsApp. Use flash sales, affiliate programs, and advanced marketing tools.",
    },
  ],
  advantagesTitle: "Why Vayva beats manual chat",
  advantages: [
    "WhatsApp is great for talk, bad for tracking—Vayva adds the structure layer.",
    "Manual replies act as a bottleneck to sales—AI captures orders 24/7.",
    "Screenshots of transfers are unreliable—automated payment confirmation is instant.",
    "Professional templates mean your store looks great from day one.",
    "Integrated features eliminate the need for multiple tools.",
  ],
  finalCtaTitle: "Ready to professionalize?",
  finalCtaLabel: "Start Building Your Store",
};

export const industriesContent: Record<string, IndustryContent> = {
  retail: {
    label: "Industry Solution",
    title: "Retail Commerce",
    highlight: "Made Predictable",
    description:
      "Track stock, capture WhatsApp orders, and manage delivery from one dashboard built for day-to-day retail.",
    stats: [
      { value: "2x", label: "Faster Fulfillment", description: "with automated order capture" },
      { value: "35%", label: "Fewer Stockouts", description: "with inventory alerts" },
      { value: "24/7", label: "Order Visibility", description: "even when you're offline" },
    ],
    featureTitle: "Built for general retail",
    featureDescription: "Every core workflow you need to run a modern retail business",
    features: [
      { icon: "🧾", title: "WhatsApp Orders", description: "Turn chats into structured orders automatically" },
      { icon: "📦", title: "Inventory Sync", description: "Live stock counts across products and variants" },
      { icon: "🚚", title: "Delivery Tracking", description: "Dispatch updates for every order" },
      { icon: "💳", title: "Payment Links", description: "Collect instant Paystack payments" },
      { icon: "👥", title: "Customer CRM", description: "Track repeat customers and order history" },
      { icon: "📈", title: "Sales Insights", description: "Know what sells, when, and why" },
    ],
    tools: [
      { title: "Order Inbox", description: "One queue for WhatsApp, Instagram, and web orders." },
      { title: "Stock Alerts", description: "Low-stock and dead-stock notifications that prevent lost sales." },
      { title: "Delivery Board", description: "Track riders, ETA, and proof of delivery in one view." },
    ],
    aiAdvantages: [
      "Auto-classifies incoming chats into ready-to-fulfill orders.",
      "Suggests restock quantities based on sales velocity.",
      "Flags repeat buyers and prompts loyalty outreach.",
      "Recommends promotional bundles for slow-moving SKUs.",
    ],
    ctaTitle: "Ready to organize your retail operation?",
    ctaDescription: "Launch your store and start tracking every order automatically.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
  },
  beauty: {
    label: "Industry Solution",
    title: "Beauty & Wellness",
    highlight: "Simplified",
    description:
      "From booking to checkout. Manage appointments, services, and payments all through WhatsApp.",
    stats: [
      { value: "60%", label: "Fewer No-Shows", description: "with prepayment requirements" },
      { value: "3x", label: "More Bookings", description: "via WhatsApp convenience" },
      { value: "30%", label: "Time Saved", description: "automated scheduling" },
    ],
    featureTitle: "Built for salons & spas",
    featureDescription: "Every feature you need to run your beauty business",
    features: [
      { icon: "📱", title: "WhatsApp Booking", description: "Appointments booked directly via chat" },
      { icon: "💅", title: "Service Menu", description: "Digital menu with pricing and duration" },
      { icon: "📅", title: "Calendar Sync", description: "Availability management with buffer times" },
      { icon: "💳", title: "Prepayments", description: "Deposits and full payments upfront" },
      { icon: "⭐", title: "Review System", description: "Automated review requests post-service" },
      { icon: "👥", title: "Staff Management", description: "Assign bookings to team members" },
    ],
    tools: [
      { title: "Appointment Pipeline", description: "Track bookings from request to completion." },
      { title: "Client Notes", description: "Keep preferences, allergies, and past services handy." },
      { title: "Service Calendar", description: "Blockout times and manage peak hour demand." },
    ],
    aiAdvantages: [
      "Predicts no-show risk and recommends reminders.",
      "Suggests upsells based on service history.",
      "Highlights top-earning treatments each week.",
      "Drafts follow-up messages to win repeat visits.",
    ],
    ctaTitle: "Ready to streamline your bookings?",
    ctaDescription: "Be among the first beauty businesses to use Vayva for appointment management.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1560066984-138d2a4d25ef?w=800&h=600&fit=crop",
  },
  electronics: {
    label: "Industry Solution",
    title: "Electronics & Gadgets",
    highlight: "Commerce Platform",
    description:
      "From phones to laptops. Track inventory by IMEI, offer installment plans, and manage warranties.",
    stats: [
      { value: "45%", label: "More Sales", description: "with installment options" },
      { value: "90%", label: "Inventory Accuracy", description: "with IMEI tracking" },
      { value: "30%", label: "Higher Margins", description: "from reduced fraud" },
    ],
    featureTitle: "Built for electronics sellers",
    featureDescription: "Specialized tools for high-value device sales",
    features: [
      { icon: "📱", title: "Warranty Tracking", description: "Manage warranties and service periods" },
      { icon: "🔧", title: "Repair Services", description: "Book and track device repairs" },
      { icon: "📦", title: "IMEI Inventory", description: "Track devices by serial/IMEI numbers" },
      { icon: "💳", title: "Installment Plans", description: "Offer pay-small-small to customers" },
      { icon: "🚚", title: "Secure Delivery", description: "Insured shipping with tracking" },
      { icon: "🛡️", title: "Authentication", description: "Verify genuine products for customers" },
    ],
    tools: [
      { title: "Specs Library", description: "Publish device specs so buyers stop asking twice." },
      { title: "Warranty Vault", description: "Track warranty windows and service history." },
      { title: "Repair Queue", description: "Log repairs, costs, and customer updates." },
    ],
    aiAdvantages: [
      "Flags suspicious orders and payment patterns.",
      "Suggests bundles and accessories to increase AOV.",
      "Highlights models with rising demand.",
      "Drafts follow-up reminders for warranty renewals.",
    ],
    ctaTitle: "Ready to sell electronics smarter?",
    ctaDescription: "Be among the first electronics stores to track inventory and boost sales with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&h=600&fit=crop",
  },
  events: {
    label: "Industry Solution",
    title: "Events & Conferences",
    highlight: "Simplified",
    description:
      "For event organizers and conference hosts. Sell tickets, manage attendance, and engage attendees all via WhatsApp.",
    stats: [
      { value: "2.5x", label: "Ticket Sales", description: "via WhatsApp reach" },
      { value: "70%", label: "Faster Checkout", description: "one-tap payments" },
      { value: "90%", label: "Attendance Rate", description: "with reminders" },
    ],
    featureTitle: "Built for event organizers",
    featureDescription: "Everything you need to run successful events",
    features: [
      { icon: "🎟️", title: "Ticket Sales", description: "Digital tickets with QR codes" },
      { icon: "📅", title: "Event Scheduling", description: "Multi-day and recurring events" },
      { icon: "👥", title: "Capacity Management", description: "Track attendance and limits" },
      { icon: "💳", title: "Payment Plans", description: "Early bird and installment pricing" },
      { icon: "📊", title: "Analytics", description: "Real-time sales and attendance data" },
      { icon: "🤝", title: "Networking", description: "Attendee connection features" },
    ],
    tools: [
      { title: "Guest List Hub", description: "All ticket holders, check-ins, and VIP lists in one place." },
      { title: "Check-In Scanner", description: "Scan QR codes and monitor attendance live." },
      { title: "Promo Tracking", description: "Monitor campaign performance across channels." },
    ],
    aiAdvantages: [
      "Forecasts ticket demand based on past sales.",
      "Suggests optimal pricing for ticket tiers.",
      "Alerts you to drop-off points in the ticket funnel.",
      "Drafts post-event follow-ups to keep attendees engaged.",
    ],
    ctaTitle: "Ready to sell more tickets?",
    ctaDescription: "Be among the first event organizers to manage ticketing with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
  },
  fashion: {
    label: "Industry Solution",
    title: "The Fashion Retailer's",
    highlight: "Commerce OS",
    description:
      "From boutique to brand. Manage collections, track variants, and sell via WhatsApp, Instagram, and web all in one place.",
    stats: [
      { value: "40%", label: "More Orders", description: "via WhatsApp automation" },
      { value: "25%", label: "Higher Margins", description: "with AI pricing suggestions" },
      { value: "60%", label: "Less Admin Time", description: "automated order processing" },
    ],
    featureTitle: "Built for fashion businesses",
    featureDescription: "Every feature you need to run your fashion brand",
    features: [
      { icon: "📱", title: "WhatsApp Orders", description: "Customers browse catalog and place orders via chat" },
      { icon: "👗", title: "Variant Management", description: "Track sizes, colors, styles with inventory sync" },
      { icon: "🏷️", title: "Smart Pricing", description: "AI suggests optimal prices based on demand" },
      { icon: "📦", title: "Low Stock Alerts", description: "Never miss a sale due to stockouts" },
      { icon: "📸", title: "Lookbook Builder", description: "Create collections and seasonal catalogs" },
      { icon: "🚚", title: "Delivery Tracking", description: "Integrated logistics with customer notifications" },
    ],
    tools: [
      { title: "Variant Inventory", description: "Track sizes and colors without spreadsheets." },
      { title: "Lookbook Studio", description: "Publish collections and link directly to checkout." },
      { title: "Repeat Buyer Tracker", description: "Know who comes back and what they love." },
    ],
    aiAdvantages: [
      "Identifies best-selling SKUs by size and color.",
      "Suggests markdowns for slow-moving styles.",
      "Forecasts restock needs before drops sell out.",
      "Drafts campaign copy for new collections.",
    ],
    ctaTitle: "Ready to transform your fashion business?",
    ctaDescription: "Be among the first fashion brands to sell more and manage less with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  },
  food: {
    label: "Industry Solution",
    title: "Restaurant Operations",
    highlight: "Made Simple",
    description:
      "From order to kitchen to delivery. Manage dine-in, takeaway, and delivery all synced in real-time.",
    stats: [
      { value: "2.5x", label: "Faster Orders", description: "with WhatsApp automation" },
      { value: "30%", label: "Higher Tips", description: "with smoother experience" },
      { value: "50%", label: "Less Errors", description: "automated kitchen display" },
    ],
    featureTitle: "Built for restaurants",
    featureDescription: "Every feature you need to run a modern food business",
    features: [
      { icon: "📱", title: "WhatsApp Menu", description: "Digital menu browsed directly in chat" },
      { icon: "📟", title: "Kitchen Display", description: "Real-time order flow to kitchen screens" },
      { icon: "🪑", title: "Table Management", description: "Track tables, orders, and turnover" },
      { icon: "🚚", title: "Delivery Dispatch", description: "Integrate with Kwik, Gokada, or self-delivery" },
      { icon: "⭐", title: "Review Requests", description: "Auto-ask for reviews after delivery" },
      { icon: "📊", title: "Prep Time Analytics", description: "Monitor kitchen efficiency" },
    ],
    tools: [
      { title: "Kitchen Queue", description: "Prioritize orders with timers and prep notes." },
      { title: "Dispatch Tracker", description: "Monitor riders, ETAs, and delivery status." },
      { title: "Menu Intelligence", description: "See what meals drive revenue each day." },
    ],
    aiAdvantages: [
      "Predicts peak hours and staffing needs.",
      "Flags slow-moving dishes for menu optimization.",
      "Recommends reorder quantities for ingredients.",
      "Suggests customer re-engagement after long gaps.",
    ],
    ctaTitle: "Ready to modernize your restaurant?",
    ctaDescription: "Be among the first restaurants to serve more customers with less chaos using Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
  },
  grocery: {
    label: "Industry Solution",
    title: "Grocery & Fresh Goods",
    highlight: "Made Easy",
    description:
      "From farm to doorstep. Manage perishables, track stock, and deliver fresh every time.",
    stats: [
      { value: "35%", label: "Less Waste", description: "with better inventory tracking" },
      { value: "50%", label: "Faster Checkout", description: "via WhatsApp automation" },
      { value: "25%", label: "More Sales", description: "from reduced stockouts" },
    ],
    featureTitle: "Built for grocery businesses",
    featureDescription: "Fresh inventory management with delivery logistics",
    features: [
      { icon: "📱", title: "WhatsApp Orders", description: "Customers order via chat with catalog browsing" },
      { icon: "🍎", title: "Fresh Tracking", description: "Batch tracking for perishable inventory" },
      { icon: "📦", title: "Stock Alerts", description: "Low stock warnings before you sell out" },
      { icon: "💳", title: "Quick Checkout", description: "One-tap payments for repeat customers" },
      { icon: "🚚", title: "Delivery Scheduling", description: "Route optimization and timing" },
      { icon: "📊", title: "Waste Analytics", description: "Track spoilage and optimize purchasing" },
    ],
    tools: [
      { title: "Expiry Dashboard", description: "See which batches need to move first." },
      { title: "Pick & Pack Lists", description: "Turn chats into printable packing lists." },
      { title: "Route Planner", description: "Group deliveries by location and time." },
    ],
    aiAdvantages: [
      "Predicts spoilage risk by item and volume.",
      "Suggests bundles for slow-moving produce.",
      "Optimizes delivery windows for efficiency.",
      "Highlights high-LTV repeat customers.",
    ],
    ctaTitle: "Ready to scale your grocery business?",
    ctaDescription: "Be among the first grocery sellers to manage fresh inventory with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
  },
  hospitality: {
    label: "Industry Solution",
    title: "Hospitality & Rentals",
    highlight: "Simplified",
    description:
      "For hotels, Airbnb hosts, and vacation rentals. Take bookings, manage availability, and get paid all via WhatsApp.",
    stats: [
      { value: "3x", label: "More Bookings", description: "via WhatsApp convenience" },
      { value: "50%", label: "Faster Payment", description: "with instant checkout" },
      { value: "24/7", label: "Availability", description: "automated responses" },
    ],
    featureTitle: "Built for hospitality",
    featureDescription: "Everything you need to run your rental business",
    features: [
      { icon: "📅", title: "WhatsApp Bookings", description: "Customers book directly via chat" },
      { icon: "🏠", title: "Property Showcase", description: "Digital catalog with photos and details" },
      { icon: "💳", title: "Instant Payments", description: "Pay deposits or full amounts" },
      { icon: "📍", title: "Location Sharing", description: "Share property locations easily" },
      { icon: "📊", title: "Availability", description: "Real-time booking calendar" },
      { icon: "⭐", title: "Guest Reviews", description: "Collect and display testimonials" },
    ],
    tools: [
      { title: "Availability Grid", description: "See occupancy across rooms and dates." },
      { title: "Guest Messaging", description: "Automate confirmations and check-in details." },
      { title: "Upsell Manager", description: "Offer add-ons like late checkout or airport pickup." },
    ],
    aiAdvantages: [
      "Forecasts occupancy trends by season.",
      "Recommends dynamic pricing adjustments.",
      "Flags high-value guests for VIP treatment.",
      "Suggests re-engagement for past guests.",
    ],
    ctaTitle: "Ready to boost your bookings?",
    ctaDescription: "Be among the first hospitality businesses to manage reservations with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
  },
  services: {
    label: "Industry Solution",
    title: "Professional Services",
    highlight: "Made Simple",
    description:
      "For consultants, agencies, and service providers. Schedule clients, send proposals, and get paid without the chaos.",
    stats: [
      { value: "2x", label: "More Clients", description: "with easier booking" },
      { value: "40%", label: "Time Saved", description: "automated admin" },
      { value: "95%", label: "Payment Rate", description: "with upfront deposits" },
    ],
    featureTitle: "Built for service businesses",
    featureDescription: "Everything you need to run your consultancy or agency",
    features: [
      { icon: "📅", title: "Client Scheduling", description: "Self-service booking with availability" },
      { icon: "💼", title: "Service Packages", description: "Tiered offerings with different scopes" },
      { icon: "📄", title: "Proposals", description: "Digital quotes and contract acceptance" },
      { icon: "💳", title: "Retainers", description: "Recurring billing for ongoing work" },
      { icon: "📊", title: "Project Tracking", description: "Milestones and deliverable management" },
      { icon: "🤝", title: "Client Portal", description: "Dedicated space for each client" },
    ],
    tools: [
      { title: "Booking Pipeline", description: "Move clients from inquiry to paid sessions." },
      { title: "Quote Builder", description: "Send proposals with clear scope and pricing." },
      { title: "Invoice Automation", description: "Recurring invoices and payment reminders." },
    ],
    aiAdvantages: [
      "Predicts no-shows and suggests reminders.",
      "Highlights top revenue clients each month.",
      "Drafts follow-up messages for pending quotes.",
      "Suggests optimal scheduling based on demand.",
    ],
    ctaTitle: "Ready to streamline your services?",
    ctaDescription: "Be among the first service providers to manage clients and payments with Vayva.",
    ctaButton: "Get Started Free",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
  },
  digital: {
    label: "Industry Solution",
    title: "Digital Products",
    highlight: "Delivered Instantly",
    description:
      "Sell files, courses, or subscriptions with secure delivery, access control, and analytics.",
    stats: [
      { value: "90%", label: "Instant Delivery", description: "automated downloads" },
      { value: "3x", label: "Higher Upsells", description: "with bundles" },
      { value: "24/7", label: "Access Control", description: "for customers" },
    ],
    featureTitle: "Built for digital sellers",
    featureDescription: "Secure delivery, access control, and growth tools",
    features: [
      { icon: "📂", title: "File Delivery", description: "Auto-send files after payment" },
      { icon: "🔐", title: "Access Control", description: "Protect downloads with links and limits" },
      { icon: "🧾", title: "License Keys", description: "Deliver keys or codes instantly" },
      { icon: "💸", title: "Upsells", description: "Bundle add-ons at checkout" },
      { icon: "📈", title: "Sales Analytics", description: "Track conversion and revenue" },
      { icon: "🤝", title: "Affiliate Links", description: "Reward partners with tracking" },
    ],
    tools: [
      { title: "Asset Library", description: "Organize files, keys, and download limits." },
      { title: "Access Tracker", description: "See who downloaded and when." },
      { title: "Bundle Builder", description: "Create high-converting product bundles." },
    ],
    aiAdvantages: [
      "Suggests bundle combinations that increase AOV.",
      "Highlights churn risk based on usage.",
      "Drafts email copy for new drops.",
      "Recommends pricing tests for conversion uplift.",
    ],
    ctaTitle: "Ready to sell digital products?",
    ctaDescription: "Launch a storefront that delivers your files instantly.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
  },
  b2b: {
    label: "Industry Solution",
    title: "B2B Wholesale",
    highlight: "Organized & Scalable",
    description:
      "Manage quotes, bulk pricing, and repeat buyers with a dedicated wholesale workflow.",
    stats: [
      { value: "50%", label: "Faster Quotes", description: "with templates" },
      { value: "2x", label: "Repeat Orders", description: "from account tracking" },
      { value: "24/7", label: "Client Portal", description: "for wholesale buyers" },
    ],
    featureTitle: "Built for wholesale",
    featureDescription: "Pricing tiers, RFQs, and account-level visibility",
    features: [
      { icon: "🏷️", title: "Tiered Pricing", description: "Volume-based pricing tables" },
      { icon: "📄", title: "RFQ Workflow", description: "Manage quote requests in one place" },
      { icon: "📦", title: "Bulk Inventory", description: "Track stock for large orders" },
      { icon: "💳", title: "Credit Terms", description: "Support deposits and net terms" },
      { icon: "🧾", title: "PO Tracking", description: "Record purchase orders" },
      { icon: "👥", title: "Account Managers", description: "Assign reps to key buyers" },
    ],
    tools: [
      { title: "Quote Builder", description: "Generate quotes in minutes with pricing tiers." },
      { title: "Wholesale Catalog", description: "Share gated catalogs with approved buyers." },
      { title: "Account Dashboard", description: "Track buyer history, spend, and terms." },
    ],
    aiAdvantages: [
      "Scores leads based on order intent and history.",
      "Suggests optimal pricing per volume tier.",
      "Flags overdue accounts before they churn.",
      "Drafts quote follow-ups automatically.",
    ],
    ctaTitle: "Ready to scale wholesale sales?",
    ctaDescription: "Give your B2B buyers a professional ordering experience.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
  },
  real_estate: {
    label: "Industry Solution",
    title: "Real Estate",
    highlight: "Pipeline Ready",
    description:
      "Manage listings, viewings, and lead follow-ups with a pipeline built for property sales.",
    stats: [
      { value: "3x", label: "Faster Follow-ups", description: "with lead automation" },
      { value: "40%", label: "More Viewings", description: "from better scheduling" },
      { value: "24/7", label: "Lead Tracking", description: "in one CRM" },
    ],
    featureTitle: "Built for agents & brokers",
    featureDescription: "Listings, viewings, and lead management in one stack",
    features: [
      { icon: "🏠", title: "Property Listings", description: "Publish listings with rich details" },
      { icon: "📅", title: "Viewing Calendar", description: "Schedule tours and showings" },
      { icon: "👥", title: "Lead CRM", description: "Track prospects and deal stage" },
      { icon: "🧾", title: "Document Vault", description: "Store agreements securely" },
      { icon: "💳", title: "Payments", description: "Collect deposits or application fees" },
      { icon: "📈", title: "Pipeline Insights", description: "See conversion at each stage" },
    ],
    tools: [
      { title: "Listings Gallery", description: "Showcase properties with images and specs." },
      { title: "Viewing Scheduler", description: "Coordinate tours without WhatsApp chaos." },
      { title: "Lead Timeline", description: "Keep notes and follow-ups organized." },
    ],
    aiAdvantages: [
      "Ranks leads by likelihood to convert.",
      "Suggests follow-up cadence for dormant prospects.",
      "Highlights properties with rising demand.",
      "Drafts client updates after viewings.",
    ],
    ctaTitle: "Ready to close more properties?",
    ctaDescription: "Run your listings and viewings with a unified pipeline.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
  },
  automotive: {
    label: "Industry Solution",
    title: "Automotive",
    highlight: "Sales & Service",
    description:
      "Track vehicles, schedule test drives, and manage leads with a dealership-ready workflow.",
    stats: [
      { value: "2x", label: "Lead Response", description: "with automation" },
      { value: "30%", label: "More Test Drives", description: "from easy booking" },
      { value: "24/7", label: "Inventory Visibility", description: "across listings" },
    ],
    featureTitle: "Built for auto dealers",
    featureDescription: "Vehicle inventory, leads, and test drives in one place",
    features: [
      { icon: "🚗", title: "Vehicle Listings", description: "Publish cars with specs and pricing" },
      { icon: "📅", title: "Test Drive Booking", description: "Schedule appointments fast" },
      { icon: "👥", title: "Lead Tracking", description: "Manage prospects and follow-ups" },
      { icon: "🧾", title: "Financing", description: "Record payment and financing details" },
      { icon: "📦", title: "Parts Catalog", description: "Manage inventory for spare parts" },
      { icon: "📊", title: "Performance Insights", description: "Know which models move" },
    ],
    tools: [
      { title: "Lead Inbox", description: "Capture inquiries across WhatsApp and web." },
      { title: "Inventory Aging", description: "Track how long each vehicle sits." },
      { title: "Test Drive Calendar", description: "Coordinate schedules and reminders." },
    ],
    aiAdvantages: [
      "Scores leads by purchase intent.",
      "Suggests price adjustments for slow listings.",
      "Recommends follow-ups after test drives.",
      "Flags high-demand models for restock.",
    ],
    ctaTitle: "Ready to sell more vehicles?",
    ctaDescription: "Move leads from inquiry to sale without losing track.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
  },
  travel_hospitality: {
    label: "Industry Solution",
    title: "Travel & Hospitality",
    highlight: "Guest-First",
    description:
      "Manage stays, reservations, and guest experiences with an all-in-one hospitality dashboard.",
    stats: [
      { value: "35%", label: "Higher Occupancy", description: "with better pricing" },
      { value: "2x", label: "Faster Booking", description: "via instant confirmations" },
      { value: "24/7", label: "Guest Support", description: "with automated messaging" },
    ],
    featureTitle: "Built for hotels & rentals",
    featureDescription: "Inventory, bookings, and guest communications in one stack",
    features: [
      { icon: "🛏️", title: "Room Inventory", description: "Manage rooms, rates, and availability" },
      { icon: "📅", title: "Reservation Calendar", description: "See bookings by date and room" },
      { icon: "💳", title: "Deposit Payments", description: "Collect upfront payments securely" },
      { icon: "📩", title: "Guest Messaging", description: "Automate check-in and updates" },
      { icon: "⭐", title: "Review Requests", description: "Collect reviews after stays" },
      { icon: "📈", title: "Revenue Insights", description: "Track occupancy and revenue" },
    ],
    tools: [
      { title: "Availability Grid", description: "Block rooms and manage seasonal demand." },
      { title: "Guest CRM", description: "Track stay history and preferences." },
      { title: "Add-on Manager", description: "Sell airport pickup, breakfast, and tours." },
    ],
    aiAdvantages: [
      "Forecasts occupancy to optimize pricing.",
      "Recommends upsells based on guest behavior.",
      "Flags reviews that need quick responses.",
      "Drafts personalized guest messages.",
    ],
    ctaTitle: "Ready to upgrade guest experiences?",
    ctaDescription: "Deliver five-star operations with less manual work.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
  },
  blog_media: {
    label: "Industry Solution",
    title: "Blog & Media",
    highlight: "Content Engine",
    description:
      "Plan, publish, and monetize content with tools built for media teams.",
    stats: [
      { value: "3x", label: "Publishing Speed", description: "with content workflows" },
      { value: "2x", label: "Subscriber Growth", description: "with capture tools" },
      { value: "24/7", label: "SEO Coverage", description: "with optimized posts" },
    ],
    featureTitle: "Built for publishers",
    featureDescription: "Editorial workflows, analytics, and monetization",
    features: [
      { icon: "📰", title: "Editorial Calendar", description: "Plan content in advance" },
      { icon: "🔍", title: "SEO Tools", description: "Optimize for search visibility" },
      { icon: "📬", title: "Subscriber Capture", description: "Grow your email list" },
      { icon: "📊", title: "Analytics", description: "Track reads and engagement" },
      { icon: "💼", title: "Sponsorship Slots", description: "Manage brand partnerships" },
      { icon: "🔗", title: "Multi-channel Publish", description: "Share to social platforms" },
    ],
    tools: [
      { title: "Content Planner", description: "Move ideas from draft to publish." },
      { title: "SEO Scorecard", description: "Improve rankings before you post." },
      { title: "Newsletter Builder", description: "Send digests to your audience." },
    ],
    aiAdvantages: [
      "Generates headline and intro suggestions.",
      "Recommends topics based on trending interest.",
      "Drafts summaries for social distribution.",
      "Suggests optimal publishing times.",
    ],
    ctaTitle: "Ready to publish faster?",
    ctaDescription: "Build a content engine that grows your audience.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
  },
  creative_portfolio: {
    label: "Industry Solution",
    title: "Creative Portfolio",
    highlight: "Client Ready",
    description:
      "Showcase work, manage inquiries, and close projects with a portfolio built for creatives.",
    stats: [
      { value: "2x", label: "More Inquiries", description: "with polished showcases" },
      { value: "40%", label: "Faster Quotes", description: "with templates" },
      { value: "24/7", label: "Client Access", description: "for proposals and proofs" },
    ],
    featureTitle: "Built for creatives",
    featureDescription: "Portfolio, inquiry management, and project tracking",
    features: [
      { icon: "🎨", title: "Project Galleries", description: "Showcase your best work" },
      { icon: "📄", title: "Proposal Templates", description: "Send branded proposals" },
      { icon: "📩", title: "Inquiry Inbox", description: "Capture and respond to leads" },
      { icon: "💳", title: "Project Payments", description: "Collect deposits and milestones" },
      { icon: "📦", title: "File Delivery", description: "Deliver assets securely" },
      { icon: "⭐", title: "Testimonials", description: "Collect social proof" },
    ],
    tools: [
      { title: "Project Showcase", description: "Organize your portfolio by category." },
      { title: "Client CRM", description: "Track briefs, notes, and approvals." },
      { title: "Contract Vault", description: "Store agreements and deliverables." },
    ],
    aiAdvantages: [
      "Suggests which projects to highlight for new leads.",
      "Drafts proposal copy from client briefs.",
      "Recommends pricing based on similar projects.",
      "Automates follow-up reminders for approvals.",
    ],
    ctaTitle: "Ready to win more creative projects?",
    ctaDescription: "Present your portfolio and close clients with confidence.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop",
  },
  nonprofit: {
    label: "Industry Solution",
    title: "Nonprofit",
    highlight: "Impact Ready",
    description:
      "Run fundraising campaigns, track donors, and report impact in one place.",
    stats: [
      { value: "2x", label: "Donor Retention", description: "with better follow-ups" },
      { value: "40%", label: "Faster Campaigns", description: "with templates" },
      { value: "24/7", label: "Donation Tracking", description: "and receipts" },
    ],
    featureTitle: "Built for nonprofits",
    featureDescription: "Fundraising, donor CRM, and impact reporting",
    features: [
      { icon: "❤️", title: "Donation Campaigns", description: "Launch campaigns in minutes" },
      { icon: "👥", title: "Donor CRM", description: "Track donors and contributions" },
      { icon: "🧾", title: "Receipts", description: "Automatic donor receipts" },
      { icon: "📣", title: "Impact Updates", description: "Share progress with supporters" },
      { icon: "📊", title: "Campaign Analytics", description: "See what drives donations" },
      { icon: "🤝", title: "Volunteer Signup", description: "Organize volunteer activity" },
    ],
    tools: [
      { title: "Campaign Dashboard", description: "Track progress toward goals." },
      { title: "Donor Segments", description: "Group donors by behavior and giving." },
      { title: "Impact Reports", description: "Generate reports for stakeholders." },
    ],
    aiAdvantages: [
      "Identifies donors likely to give again.",
      "Suggests messaging for re-engagement campaigns.",
      "Highlights campaigns with the best ROI.",
      "Drafts impact stories from campaign data.",
    ],
    ctaTitle: "Ready to grow your impact?",
    ctaDescription: "Raise funds and report outcomes with clarity.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop",
  },
  education: {
    label: "Industry Solution",
    title: "Education & Courses",
    highlight: "Structured & Scalable",
    description:
      "Sell courses, manage cohorts, and track learner progress with ease.",
    stats: [
      { value: "3x", label: "Course Completion", description: "with engagement nudges" },
      { value: "2x", label: "Enrollment Growth", description: "with better checkout" },
      { value: "24/7", label: "Student Access", description: "to course content" },
    ],
    featureTitle: "Built for educators",
    featureDescription: "Course delivery, enrollment, and engagement tools",
    features: [
      { icon: "🎓", title: "Course Builder", description: "Create lessons and modules" },
      { icon: "📋", title: "Enrollments", description: "Track learners and cohorts" },
      { icon: "🧾", title: "Certificates", description: "Issue completion certificates" },
      { icon: "💬", title: "Community", description: "Engage students in groups" },
      { icon: "📊", title: "Progress Analytics", description: "Monitor completion rates" },
      { icon: "💳", title: "Flexible Payments", description: "Installments and one-time fees" },
    ],
    tools: [
      { title: "Cohort Calendar", description: "Schedule sessions and reminders." },
      { title: "Student CRM", description: "Keep track of learner progress." },
      { title: "Quiz Builder", description: "Assess learners without extra tools." },
    ],
    aiAdvantages: [
      "Flags students at risk of dropping off.",
      "Suggests lesson improvements from feedback.",
      "Drafts quiz questions from course content.",
      "Recommends re-engagement messages for cohorts.",
    ],
    ctaTitle: "Ready to teach at scale?",
    ctaDescription: "Deliver courses and keep students engaged.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
  },
  marketplace: {
    label: "Industry Solution",
    title: "Marketplace",
    highlight: "Multi-vendor Ready",
    description:
      "Operate a multi-vendor marketplace with vendor onboarding, dispute management, and payouts in one control center.",
    stats: [
      { value: "3x", label: "Vendor Onboarding", description: "with guided setup" },
      { value: "2x", label: "Dispute Resolution", description: "with centralized tools" },
      { value: "24/7", label: "Operations Visibility", description: "across vendors" },
    ],
    featureTitle: "Built for marketplace operators",
    featureDescription: "Vendor management, payouts, and compliance workflows",
    features: [
      { icon: "🧑‍🤝‍🧑", title: "Vendor CRM", description: "Onboard, verify, and track vendors" },
      { icon: "⚖️", title: "Dispute Center", description: "Resolve issues with clear workflows" },
      { icon: "💸", title: "Payout Oversight", description: "Manage commissions and payouts" },
      { icon: "🛡️", title: "Compliance", description: "Monitor risky orders and vendors" },
      { icon: "📊", title: "Marketplace Analytics", description: "See GMV and vendor performance" },
      { icon: "📣", title: "Vendor Enablement", description: "Share playbooks and updates" },
    ],
    tools: [
      { title: "Vendor Command Center", description: "A single view for vendor health and performance." },
      { title: "Dispute Workflow", description: "Track disputes, evidence, and outcomes." },
      { title: "Commission Engine", description: "Automate commission calculations and payouts." },
    ],
    aiAdvantages: [
      "Flags vendors with rising dispute rates.",
      "Predicts payout risks before settlement.",
      "Suggests vendor coaching actions based on KPIs.",
      "Drafts marketplace-wide announcements in minutes.",
    ],
    ctaTitle: "Want early access to the marketplace stack?",
    ctaDescription: "We're onboarding a limited number of marketplace operators.",
    ctaButton: "Talk to the Team",
    ctaHref: "/contact",
    ctaSubtext: "Join the waitlist for marketplace ops.",
    availability: "coming_soon",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop",
  },
  one_product: {
    label: "Industry Solution",
    title: "One Product Store",
    highlight: "Conversion Focused",
    description:
      "Run a high-converting store built around one hero product with a focused funnel.",
    stats: [
      { value: "2x", label: "Conversion Rate", description: "with focused checkout" },
      { value: "30%", label: "Higher AOV", description: "with upsells" },
      { value: "24/7", label: "Lead Capture", description: "with simple funnels" },
    ],
    featureTitle: "Built for hero products",
    featureDescription: "Focused funnels, upsells, and fast checkout",
    features: [
      { icon: "🛒", title: "One-Page Checkout", description: "Remove friction at purchase" },
      { icon: "⚡", title: "Upsell Funnels", description: "Increase average order value" },
      { icon: "⏳", title: "Scarcity Timers", description: "Drive faster decisions" },
      { icon: "⭐", title: "Testimonials", description: "Showcase social proof" },
      { icon: "📊", title: "Funnel Analytics", description: "Track conversion drop-offs" },
      { icon: "💬", title: "Follow-up Automation", description: "Recover abandoned carts" },
    ],
    tools: [
      { title: "Landing Builder", description: "Publish a high-converting landing page." },
      { title: "Conversion Dashboard", description: "Monitor every step of the funnel." },
      { title: "A/B Pricing", description: "Test pricing for better results." },
    ],
    aiAdvantages: [
      "Suggests messaging that converts better.",
      "Highlights where buyers drop off.",
      "Drafts WhatsApp follow-ups for cart recovery.",
      "Recommends upsell combinations based on order data.",
    ],
    ctaTitle: "Ready to sell your hero product?",
    ctaDescription: "Launch a focused funnel that converts.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
  },
  nightlife: {
    label: "Industry Solution",
    title: "Nightlife & Entertainment",
    highlight: "Always Booked",
    description:
      "Sell tickets, manage table reservations, and run events without chaos.",
    stats: [
      { value: "2x", label: "Ticket Sales", description: "with fast checkout" },
      { value: "40%", label: "Higher Table Spend", description: "with organized booking" },
      { value: "24/7", label: "Guest Updates", description: "via WhatsApp" },
    ],
    featureTitle: "Built for nightlife",
    featureDescription: "Ticketing, reservations, and guest management",
    features: [
      { icon: "🎟️", title: "Ticketing", description: "Digital tickets with QR check-in" },
      { icon: "🍾", title: "Bottle Menu", description: "Showcase table packages" },
      { icon: "📅", title: "Table Reservations", description: "Manage capacity and deposits" },
      { icon: "👥", title: "Guest List", description: "Track VIPs and attendance" },
      { icon: "📣", title: "Promotions", description: "Push events to WhatsApp" },
      { icon: "📊", title: "Event Analytics", description: "Track sales per night" },
    ],
    tools: [
      { title: "Reservation Book", description: "Coordinate tables and minimum spends." },
      { title: "Ticket Scanner", description: "Fast entry with QR check-in." },
      { title: "Guest CRM", description: "Keep VIPs and promoters organized." },
    ],
    aiAdvantages: [
      "Predicts high-demand nights for better pricing.",
      "Suggests promos to fill slow nights.",
      "Identifies top spenders for VIP outreach.",
      "Drafts post-event follow-ups automatically.",
    ],
    ctaTitle: "Ready to pack the house?",
    ctaDescription: "Sell tickets and reservations without losing track.",
    ctaButton: "Start Free Trial",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop",
  },
};

export const legalContent = {
  title: "Legal & Compliance",
  description:
    "This Legal Hub provides access to Vayva's policies, terms, and compliance documents. These documents govern how the Vayva platform operates and how users are expected to use it.",
  nav: [
    { title: "Legal Hub", href: "/legal" },
    { title: "Terms of Service", href: "/legal/terms" },
    { title: "Privacy Policy", href: "/legal/privacy" },
    { title: "Data Processing Agreement", href: "/legal/dpa" },
    { title: "Copyright & DMCA Policy", href: "/legal/copyright" },
    { title: "Security Policy", href: "/legal/security" },
    { title: "Accessibility", href: "/legal/accessibility" },
    { title: "Acceptable Use Policy", href: "/legal/acceptable-use" },
    { title: "Prohibited Items", href: "/legal/prohibited-items" },
    { title: "Refund Policy", href: "/legal/refund-policy" },
    { title: "KYC & Compliance", href: "/legal/kyc-safety" },
    { title: "Manage Cookies", href: "/legal/cookies" },
    { title: "EULA", href: "/legal/eula" },
  ],
  sections: [
    {
      title: "Core Legal Documents",
      items: [
        {
          title: "Terms of Service",
          href: "/legal/terms",
          description:
            "Governs platform use and defines the legal contract between Vayva and merchants. Comprehensive provisions for eligibility, fees, prohibited uses, IP rights, liability limitations, and dispute resolution.",
        },
        {
          title: "Privacy Policy",
          href: "/legal/privacy",
          description:
            "Explains data handling practices and compliance with GDPR, NDPR, and other data protection laws. Details data collection, processing purposes, user rights, and international transfer safeguards.",
        },
        {
          title: "Data Processing Agreement (DPA)",
          href: "/legal/dpa",
          description:
            "GDPR and NDPR compliant agreement governing personal data processing. Includes controller/processor obligations, breach notification, data subject rights, and audit provisions.",
        },
        {
          title: "Acceptable Use Policy",
          href: "/legal/acceptable-use",
          description:
            "Defines permitted behavior and prohibited activities on the Vayva platform including messaging automation and community standards.",
        },
        {
          title: "Prohibited Items",
          href: "/legal/prohibited-items",
          description:
            "Comprehensive list of restricted goods and services that cannot be sold using Vayva. Includes illegal items, regulated products, and offensive materials.",
        },
        {
          title: "Refund Policy",
          href: "/legal/refund-policy",
          description:
            "Explains billing practices and refund eligibility for Vayva subscription fees including free trials and chargeback procedures.",
        },
      ],
    },
    {
      title: "Intellectual Property & Security",
      items: [
        {
          title: "Copyright & DMCA Policy",
          href: "/legal/copyright",
          description:
            "Policy for responding to copyright infringement claims under DMCA and Nigeria Copyright Act. Includes takedown procedures, counter-notice process, and repeat infringer policy.",
        },
        {
          title: "Security Policy",
          href: "/legal/security",
          description:
            "Comprehensive security measures including encryption standards (TLS 1.3, AES-256), access controls, network security, incident response, and SOC 2 Type II compliance.",
        },
        {
          title: "End User License Agreement (EULA)",
          href: "/legal/eula",
          description:
            "License terms for the Vayva application including content standards, warranty disclaimers, and usage restrictions.",
        },
      ],
    },
    {
      title: "Safety & Compliance",
      items: [
        {
          title: "KYC & Compliance",
          href: "/legal/kyc-safety",
          description:
            "Identity verification requirements including NIN, BVN, and CAC checks. Explains risk mitigation and enforcement procedures.",
        },
        {
          title: "Cookie Policy",
          href: "/legal/cookies",
          description:
            "Information about cookie usage, types of cookies (essential, functional, analytics), and browser control options.",
        },
        {
          title: "Accessibility Statement",
          href: "/legal/accessibility",
          description:
            "Commitment to WCAG 2.1 Level AA compliance. Details accessibility features, assistive technology compatibility, and feedback mechanisms.",
        },
      ],
    },
  ],
  disclaimer:
    "These documents are intended to provide transparency. If you have legal questions, consult a qualified legal professional.",
  meta: [
    { label: "Jurisdiction", value: "Federal Republic of Nigeria" },
    { label: "Governing Entity", value: "Vayva Tech (operating in Nigeria)" },
  ],
};

export const pricingFaqs = [
  {
    question: "How does the free trial work?",
    answer:
      "You get 7 days of full access to Starter features. No credit card required. If you don't subscribe after the trial, your account continues on the Free plan with limited features.",
  },
  {
    question: "Do I need design or coding skills?",
    answer:
      "Not at all. Vayva includes professional templates you can choose from. Our visual editor lets you customize colors, fonts, and layouts with simple drag-and-drop—no code needed. Setup takes under 5 minutes.",
  },
  {
    question: "What payment methods can my customers use?",
    answer:
      "Your customers can pay with Visa, Mastercard, Verve cards, bank transfers, USSD codes, and mobile money. International customers can pay with dollar cards. All powered by Paystack with bank-grade security.",
  },
  {
    question: "Are there any transaction fees?",
    answer:
      "Vayva doesn't charge per-transaction fees on orders. You pay your monthly subscription and that's it. Standard Paystack processing fees apply to card payments (typically 1.5% + ₦100 for local cards). Withdrawals from your Vayva wallet incur a 3% fee.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Vayva is month-to-month with no long-term contracts. You can cancel, upgrade, or downgrade your plan instantly from your dashboard. No penalties or hidden fees.",
  },
  {
    question: "What features are included?",
    answer:
      "All plans include AI order capture, Paystack payments, inventory tracking, and delivery management. Free plan includes 4 templates. Starter and Pro plans unlock additional features like conversation customization, multi-location support, and API access.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-grade encryption, are PCI DSS compliant, and never store your customers' card details. Your business data is encrypted at rest and in transit.",
  },
];

export const featureShowcase = [
  {
    title: "AI-Powered Order Capture",
    description:
      "Your customers message you on WhatsApp or Instagram. Our AI reads, understands, and creates complete orders automatically. No manual data entry. No missed sales.",
    demo: "orders",
    capabilities: [
      "Understands natural language from customer messages",
      "Matches products to your catalog automatically",
      "Calculates totals with delivery fees",
      "Sends payment links instantly",
    ],
  },
  {
    title: "Every Payment Method",
    description:
      "Accept payments however your customers prefer. International cards, local bank transfers, USSD, and mobile money—all in one place. Funds settle directly to your bank.",
    demo: "payments",
    capabilities: [
      "Visa, Mastercard, Amex, Apple Pay (60+ countries)",
      "All Nigerian bank transfers and USSD codes",
      "Real-time payment confirmations",
      "Automatic receipt generation",
    ],
  },
  {
    title: "Smart Inventory",
    description:
      "Never run out of stock again. Get alerts when items are running low, track what's selling fast, and see exactly what you need to reorder.",
    demo: "inventory",
    capabilities: [
      "Low stock alerts before you run out",
      "Sales velocity tracking by product",
      "Automatic reorder suggestions",
      "Multi-location stock management",
    ],
  },
  {
    title: "Live Delivery Tracking",
    description:
      "Know where every order is, from dispatch to doorstep. Your customers get real-time updates, and you get peace of mind.",
    demo: "delivery",
    capabilities: [
      "Real-time rider location tracking",
      "Automatic customer notifications",
      "Proof of delivery with photos",
      "Integration with Kwik Delivery",
    ],
  },
  {
    title: "Complete Dashboard",
    description:
      "See your entire business in one view. Revenue, orders, inventory, and customer insights—all updating in real-time. Make decisions with data that matters.",
    demo: "dashboard",
    capabilities: [
      "Real-time revenue and order tracking",
      "Inventory alerts and stock management",
      "Customer analytics and purchase history",
      "Performance trends and insights",
    ],
  },
];

export const featureInfrastructure = [
  {
    title: "Built for Nigeria",
    description:
      "Works seamlessly on 2G networks. Designed for unreliable power and intermittent connectivity. Your business keeps running regardless of conditions.",
  },
  {
    title: "Bank-Grade Security",
    description:
      "End-to-end encryption for all transactions. PCI DSS compliant payment processing. Your money and customer data are always protected.",
  },
  {
    title: "Scale Without Limits",
    description:
      "From your first order to your millionth. Our infrastructure auto-scales with your business. No performance degradation as you grow.",
  },
  {
    title: "Human Support",
    description:
      "Real people, real help. Our support team understands Nigerian business challenges. Available when you need us, not just during business hours.",
  },
];

export const featureWorkflowSteps = [
  { step: "01", title: "Connect", desc: "Link WhatsApp, Instagram, storefront, and payments." },
  { step: "02", title: "Capture", desc: "AI understands requests and builds structured orders." },
  { step: "03", title: "Collect", desc: "Instant payment links + automated receipts." },
  { step: "04", title: "Fulfill", desc: "Track inventory, delivery, and customer updates." },
];

// Templates page content
export const templatesContent = {
  heroTitle: "Professional Website Templates",
  heroHighlight: "Ready to Launch",
  heroDescription:
    "Choose from professionally designed templates for your business. Customize colors, fonts, and layouts with our visual editor—no code required. Free plan includes 4 templates; upgrade to unlock more.",
  heroStats: [
    { value: "4+", label: "Templates (Free)", subtext: "Upgrade for full library" },
    { value: "0", label: "Code Required", subtext: "Visual editing only" },
    { value: "<5min", label: "Setup Time", subtext: "From template to live store" },
  ],
  setupTitle: "Easy Design Setup in 4 Steps",
  setupSteps: [
    {
      step: "1",
      title: "Choose Your Template",
      description: "Browse available designs. Free plan includes 4 templates; upgrade for more options.",
    },
    {
      step: "2",
      title: "Customize Visually",
      description: "Use the visual editor to change colors, fonts, images, and layouts with drag-and-drop simplicity.",
    },
    {
      step: "3",
      title: "Add Your Products",
      description: "Import your catalog or add products manually. Inventory syncs automatically.",
    },
    {
      step: "4",
      title: "Go Live",
      description: "Connect your domain and publish. Your store is ready to accept orders in minutes.",
    },
  ],
  ctaTitle: "Ready to launch your store?",
  ctaDescription: "Browse templates and find the perfect design for your business. Start free, upgrade when ready.",
  ctaButton: "Start Free",
};

// All features page content
export const allFeaturesContent = {
  heroTitle: "Platform Features",
  heroHighlight: "One Dashboard",
  heroDescription:
    "Everything you need to run your business—from order capture to delivery tracking, payments to analytics. All unified in one dashboard.",
  heroStats: [
    { value: "Unified", label: "Dashboard", subtext: "All in one place" },
    { value: "AI", label: "Automation", subtext: "WhatsApp & Instagram" },
    { value: "24/7", label: "Availability", subtext: "Always-on platform" },
    { value: "Integrated", label: "Tools", subtext: "No plugins needed" },
  ],
  highlights: [
    { title: "AI Order Capture", description: "Automatically convert WhatsApp conversations into structured orders" },
    { title: "Unified Inbox", description: "All orders from WhatsApp, Instagram, web, and in-person in one place" },
    { title: "Paystack Integration", description: "Cards, transfers, USSD, and mobile money—all automated" },
    { title: "Kwik Delivery", description: "Track dispatch, ETAs, and proof of delivery in real-time" },
    { title: "Flash Sales", description: "Run time-limited promotions with countdown timers" },
    { title: "Customer CRM", description: "Track purchase history, preferences, and segments" },
  ],
  ctaTitle: "See all features in action",
  ctaDescription: "Start your 7-day free trial and explore the complete platform.",
  ctaButton: "Start Free Trial",
};
