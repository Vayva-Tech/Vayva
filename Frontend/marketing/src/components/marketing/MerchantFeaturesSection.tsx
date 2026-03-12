"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import {
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Users,
  BarChart3,
  Megaphone,
  Sparkles,
  Calendar,
  FileText,
  Settings,
  Shield,
  Zap,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  MessageSquare,
  Star,
  Gift,
  Tag,
  Percent,
  TrendingUp,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Receipt,
  Wallet,
  Banknote,
  QrCode,
  Smartphone,
  Globe,
  Layers,
  Puzzle,
  Palette,
  Type,
  Image,
  Video,
  Headphones,
  LifeBuoy,
  BookOpen,
  GraduationCap,
  Heart,
  Target,
  Mail,
  Send,
  Inbox,
  CheckSquare,
  List,
  Grid,
  Table,
  LayoutGrid,
} from "lucide-react";

// Mini-features organized by category - extracted from merchant admin dashboard
const MERCHANT_FEATURE_CATEGORIES = [
  {
    id: "orders",
    name: "Order Management",
    description: "From WhatsApp chat to fulfilled order, all in one place",
    icon: ShoppingCart,
    color: "from-emerald-500 to-teal-600",
    features: [
      {
        title: "AI Order Capture",
        description: "Automatically convert WhatsApp conversations into structured orders. No manual data entry needed.",
        icon: Sparkles,
        highlight: true,
      },
      {
        title: "Unified Order Inbox",
        description: "All orders from WhatsApp, Instagram, web, and in-person sales in one organized queue.",
        icon: Inbox,
      },
      {
        title: "Kanban Order Board",
        description: "Visual pipeline view. Drag orders from 'New' to 'Preparing' to 'Shipped'.",
        icon: LayoutGrid,
      },
      {
        title: "Smart Order Search",
        description: "Find any order instantly by customer name, product, or order number.",
        icon: Search,
      },
      {
        title: "Bulk Order Actions",
        description: "Update status, print labels, or send notifications for multiple orders at once.",
        icon: CheckSquare,
      },
      {
        title: "Order Status Timeline",
        description: "Complete history of every order from creation to delivery with timestamps.",
        icon: Clock,
      },
      {
        title: "Customer Order History",
        description: "See every purchase a customer has made with one click.",
        icon: List,
      },
      {
        title: "Order Notes & Tags",
        description: "Add internal notes, color-coded tags, and special instructions to any order.",
        icon: FileText,
      },
    ],
  },
  {
    id: "inventory",
    name: "Inventory & Products",
    description: "Never oversell or run out of stock unexpectedly",
    icon: Package,
    color: "from-blue-500 to-indigo-600",
    features: [
      {
        title: "Real-Time Stock Sync",
        description: "Inventory updates instantly when orders come in. No manual stock adjustments.",
        icon: Zap,
        highlight: true,
      },
      {
        title: "Low Stock Alerts",
        description: "Get notified when products hit your minimum threshold before you sell out.",
        icon: AlertTriangle,
      },
      {
        title: "Out-of-Stock Auto-Hide",
        description: "Sold out items automatically hide from your storefront until restocked.",
        icon: Eye,
      },
      {
        title: "Variant Management",
        description: "Track sizes, colors, styles separately. See which variants sell best.",
        icon: Grid,
      },
      {
        title: "Bulk Product Import",
        description: "Upload hundreds of products at once with our CSV template.",
        icon: Upload,
      },
      {
        title: "Product Categories",
        description: "Organize products into collections and subcategories for easy browsing.",
        icon: Layers,
      },
      {
        title: "Digital Product Support",
        description: "Sell files, courses, and downloads with automatic delivery after payment.",
        icon: Download,
      },
      {
        title: "Product Analytics",
        description: "See which products are trending, slow-moving, or frequently bought together.",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "payments",
    name: "Payments & Finance",
    description: "Accept every payment method your customers prefer",
    icon: CreditCard,
    color: "from-violet-500 to-purple-600",
    features: [
      {
        title: "Paystack Integration",
        description: "Accept cards, bank transfers, USSD, and mobile money instantly.",
        icon: CreditCard,
        highlight: true,
      },
      {
        title: "Payment Links",
        description: "Create and share payment links for custom amounts or invoices.",
        icon: LinkIcon,
      },
      {
        title: "Auto Payment Confirmation",
        description: "No more checking bank apps. Payments verify automatically.",
        icon: CheckCircle,
      },
      {
        title: "Multi-Currency Support",
        description: "Sell in NGN, USD, EUR, GBP with automatic conversion.",
        icon: Globe,
      },
      {
        title: "Payment Plans",
        description: "Offer installment payments and 'pay small small' options.",
        icon: Banknote,
      },
      {
        title: "Sales Reports",
        description: "Daily, weekly, monthly revenue breakdowns. Export to Excel anytime.",
        icon: BarChart3,
      },
      {
        title: "Payout Management",
        description: "Track settlements, pending payouts, and transfer history.",
        icon: Wallet,
      },
      {
        title: "Tax & Invoice Settings",
        description: "Automatic tax calculations and branded invoice generation.",
        icon: Receipt,
      },
    ],
  },
  {
    id: "fulfillment",
    name: "Fulfillment & Delivery",
    description: "Get orders to customers fast and reliably",
    icon: Truck,
    color: "from-amber-500 to-orange-600",
    features: [
      {
        title: "Kwik Delivery Integration",
        description: "One-click dispatch with Nigeria's trusted delivery partner.",
        icon: MapPin,
        highlight: true,
      },
      {
        title: "Multi-Provider Logistics",
        description: "Choose from multiple delivery partners based on price and speed.",
        icon: Truck,
      },
      {
        title: "Real-Time Tracking",
        description: "Customers get live delivery updates via WhatsApp automatically.",
        icon: Smartphone,
      },
      {
        title: "Delivery Zones",
        description: "Set different delivery rates for different areas.",
        icon: MapPin,
      },
      {
        title: "Pickup Options",
        description: "Offer store pickup, curbside, or scheduled delivery windows.",
        icon: Clock,
      },
      {
        title: "Packaging Slips",
        description: "Auto-generated packing lists and shipping labels.",
        icon: FileText,
      },
      {
        title: "Returns Management",
        description: "Handle returns and exchanges with dedicated workflows.",
        icon: RotateCcw,
      },
      {
        title: "Delivery Analytics",
        description: "Track average delivery times, success rates, and costs.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "customers",
    name: "Customer Management",
    description: "Know your customers and keep them coming back",
    icon: Users,
    color: "from-rose-500 to-pink-600",
    features: [
      {
        title: "Customer CRM",
        description: "Complete profiles with order history, preferences, and contact info.",
        icon: Users,
        highlight: true,
      },
      {
        title: "VIP Segmentation",
        description: "Automatically identify your best customers for special treatment.",
        icon: Star,
      },
      {
        title: "Purchase History",
        description: "See every interaction and order from first purchase to latest.",
        icon: List,
      },
      {
        title: "Customer Notes",
        description: "Remember preferences, birthdays, and special requests.",
        icon: FileText,
      },
      {
        title: "WhatsApp Broadcasting",
        description: "Send promotions and updates to customer segments.",
        icon: Send,
      },
      {
        title: "Review Collection",
        description: "Auto-request reviews after delivery with one-click responses.",
        icon: Star,
      },
      {
        title: "Customer Analytics",
        description: "Lifetime value, repeat purchase rate, and churn insights.",
        icon: TrendingUp,
      },
      {
        title: "Contact Import",
        description: "Import existing customers from CSV or WhatsApp contacts.",
        icon: Upload,
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing & Growth",
    description: "Tools to attract customers and increase sales",
    icon: Megaphone,
    color: "from-cyan-500 to-blue-600",
    features: [
      {
        title: "Flash Sales",
        description: "Create urgency with time-limited offers that auto-expire.",
        icon: Zap,
        highlight: true,
      },
      {
        title: "Discount Codes",
        description: "Percentage, fixed amount, or free shipping coupons.",
        icon: Percent,
      },
      {
        title: "Product Bundles",
        description: "Increase average order value with smart bundling.",
        icon: Package,
      },
      {
        title: "Abandoned Cart Recovery",
        description: "Auto-remind customers about items left in their cart.",
        icon: ShoppingCart,
      },
      {
        title: "Affiliate Program",
        description: "Let customers earn rewards for referring new buyers.",
        icon: Gift,
      },
      {
        title: "Campaign Tracking",
        description: "See which ads and promotions drive actual sales.",
        icon: Target,
      },
      {
        title: "Social Share Tools",
        description: "One-click sharing to Instagram, WhatsApp, Facebook.",
        icon: Share2,
      },
      {
        title: "Email Marketing Ready",
        description: "Export customer lists for Mailchimp, SendGrid, etc.",
        icon: Mail,
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Insights",
    description: "Data-driven decisions to grow your business",
    icon: BarChart3,
    color: "from-fuchsia-500 to-pink-600",
    features: [
      {
        title: "AI-Powered Insights",
        description: "Smart suggestions for pricing, restocking, and promotions.",
        icon: Sparkles,
        highlight: true,
      },
      {
        title: "Sales Dashboard",
        description: "Real-time revenue, orders, and customer metrics at a glance.",
        icon: BarChart3,
      },
      {
        title: "Product Performance",
        description: "Best sellers, slow movers, and profit margins per item.",
        icon: TrendingUp,
      },
      {
        title: "Customer Analytics",
        description: "New vs. returning customers, geographic distribution.",
        icon: Users,
      },
      {
        title: "Custom Date Ranges",
        description: "Compare periods, spot trends, and seasonal patterns.",
        icon: Calendar,
      },
      {
        title: "Export Reports",
        description: "Download data as CSV or PDF for accounting.",
        icon: Download,
      },
      {
        title: "Conversion Tracking",
        description: "See where customers drop off and optimize.",
        icon: Target,
      },
      {
        title: "Automated Reports",
        description: "Daily/weekly summary emails sent automatically.",
        icon: Mail,
      },
    ],
  },
  {
    id: "storefront",
    name: "Storefront & Design",
    description: "Your brand, beautifully presented",
    icon: Palette,
    color: "from-teal-500 to-emerald-600",
    features: [
      {
        title: "72+ Templates",
        description: "Professionally designed for every industry. Mobile-optimized.",
        icon: LayoutGrid,
        highlight: true,
      },
      {
        title: "Visual Editor",
        description: "Drag-and-drop customization. No coding required.",
        icon: Palette,
      },
      {
        title: "Custom Domain",
        description: "Use your own domain or our free vayva.ng subdomain.",
        icon: Globe,
      },
      {
        title: "Mobile-First Design",
        description: "Every template looks perfect on phones—where your customers shop.",
        icon: Smartphone,
      },
      {
        title: "Brand Customization",
        description: "Upload logos, set colors, choose fonts that match your brand.",
        icon: Type,
      },
      {
        title: "SEO Optimized",
        description: "Meta tags, sitemaps, and structured data built-in.",
        icon: Search,
      },
      {
        title: "Social Media Integration",
        description: "Connect Instagram feed, share buttons, and WhatsApp chat.",
        icon: Share2,
      },
      {
        title: "Page Builder",
        description: "Create custom pages for About, Contact, FAQ, and more.",
        icon: FileText,
      },
    ],
  },
];

// Helper icon component
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

export function MerchantFeaturesSection(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = React.useState("orders");

  const activeData = MERCHANT_FEATURE_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="relative max-w-[1600px] mx-auto px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white mb-6"
          >
            <Zap className="w-4 h-4" />
            60+ Powerful Features
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto"
          >
            Everything you need to
            <br />
            <span className="text-emerald-600">run and grow</span> your business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            From order capture to delivery tracking, payments to marketing—every tool 
            you need is built-in and works seamlessly together.
          </motion.p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MERCHANT_FEATURE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Category Features */}
      <section className="py-16 bg-slate-50 min-h-[600px]">
        <div className="max-w-[1600px] mx-auto px-6">
          {activeData && (
            <motion.div
              key={activeData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Header */}
              <div className="mb-10">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${activeData.color} text-white mb-4`}>
                  <activeData.icon className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{activeData.name}</h2>
                <p className="text-slate-600 mt-2 text-lg">{activeData.description}</p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeData.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-lg ${
                      feature.highlight 
                        ? "border-emerald-200 shadow-md ring-1 ring-emerald-100" 
                        : "border-slate-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      feature.highlight 
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      {feature.title}
                      {feature.highlight && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Feature Count Summary */}
      <section className="py-16 bg-white border-t border-slate-200/70">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900">
              One platform. Every feature connected.
            </h3>
            <p className="text-slate-600 mt-2">
              No plugins to install. No integrations to configure. Everything works together seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {MERCHANT_FEATURE_CATEGORIES.map((category, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-3xl font-bold text-slate-900">{category.features.length}+</div>
                <div className="text-sm font-medium text-slate-700 mt-1">{category.name}</div>
                <div className="text-xs text-slate-500">features</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              See all these features in action
            </h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
              Start your free 7-day trial and explore the full merchant dashboard. 
              No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 rounded-xl text-base font-semibold h-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 rounded-xl text-base font-semibold h-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
