"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plug,
  Search,
  Star,
  Users,
  CheckCircle,
  ExternalLink,
  Filter,
  Zap,
  Globe,
  CreditCard,
  Truck,
  Calendar,
  MessageSquare,
  Mail,
  BarChart2,
  Shield,
  ShoppingBag,
  PenTool,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

// ============================================================
// Types
// ============================================================
type IntegrationCategory =
  | "all"
  | "accounting"
  | "payments"
  | "delivery"
  | "scheduling"
  | "communication"
  | "email"
  | "social"
  | "esignature"
  | "analytics"
  | "crm";

type IntegrationPricing = "free" | "paid" | "usage_based";
type SetupType = "oauth" | "api_key" | "webhook" | "one_click";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: Exclude<IntegrationCategory, "all">;
  logo: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  pricing: IntegrationPricing;
  setupType: SetupType;
  features: string[];
  developer: { name: string; website?: string };
  connected?: boolean;
  popular?: boolean;
}

// ============================================================
// Catalog Data
// ============================================================
const INTEGRATIONS: Integration[] = [
  // Accounting
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync orders, products, and financial data with QuickBooks Online.",
    category: "accounting",
    logo: "QB",
    rating: 4.8,
    reviewCount: 234,
    installCount: 1523,
    pricing: "paid",
    setupType: "oauth",
    features: ["Automatic order sync", "Financial reporting", "Tax calculation", "Multi-currency"],
    developer: { name: "Intuit", website: "https://quickbooks.intuit.com" },
    popular: true,
  },
  {
    id: "xero",
    name: "Xero",
    description: "Connect your store with Xero accounting. Streamline invoicing and financial management.",
    category: "accounting",
    logo: "XR",
    rating: 4.7,
    reviewCount: 189,
    installCount: 987,
    pricing: "paid",
    setupType: "oauth",
    features: ["Invoice generation", "Bank reconciliation", "Payroll integration", "Multi-currency"],
    developer: { name: "Xero", website: "https://www.xero.com" },
  },
  // Payments
  {
    id: "paystack",
    name: "Paystack",
    description: "Accept payments from customers across Africa. Cards, bank transfers, USSD, and mobile money.",
    category: "payments",
    logo: "PS",
    rating: 4.9,
    reviewCount: 567,
    installCount: 3456,
    pricing: "usage_based",
    setupType: "api_key",
    features: ["Card payments", "Bank transfers", "USSD", "Mobile money", "Subscriptions"],
    developer: { name: "Paystack", website: "https://paystack.com" },
    popular: true,
    connected: false,
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Process payments from customers worldwide. 150+ currencies supported.",
    category: "payments",
    logo: "FW",
    rating: 4.7,
    reviewCount: 423,
    installCount: 2890,
    pricing: "usage_based",
    setupType: "api_key",
    features: ["150+ currencies", "Local payment methods", "Fraud protection", "Payment links"],
    developer: { name: "Flutterwave", website: "https://flutterwave.com" },
    popular: true,
  },
  // Delivery
  {
    id: "kwik",
    name: "Kwik Delivery",
    description: "Same-day delivery across Lagos and Abuja. Real-time tracking.",
    category: "delivery",
    logo: "KW",
    rating: 4.6,
    reviewCount: 312,
    installCount: 1234,
    pricing: "usage_based",
    setupType: "api_key",
    features: ["Same-day delivery", "Real-time tracking", "Cash on delivery", "Proof of delivery"],
    developer: { name: "Kwik", website: "https://kwik.delivery" },
    popular: true,
  },
  {
    id: "gokada",
    name: "Gokada",
    description: "Fast delivery with Nigeria's leading last-mile service.",
    category: "delivery",
    logo: "GK",
    rating: 4.5,
    reviewCount: 278,
    installCount: 987,
    pricing: "usage_based",
    setupType: "api_key",
    features: ["Bike delivery", "Car delivery", "Live tracking", "Return management"],
    developer: { name: "Gokada", website: "https://gokada.ng" },
  },
  // Scheduling
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync appointments and events with Google Calendar. Automated scheduling.",
    category: "scheduling",
    logo: "GC",
    rating: 4.8,
    reviewCount: 445,
    installCount: 2134,
    pricing: "free",
    setupType: "oauth",
    features: ["Two-way sync", "Availability checking", "Reminder notifications", "Team scheduling"],
    developer: { name: "Google", website: "https://calendar.google.com" },
    popular: true,
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Let customers book appointments directly. Eliminate scheduling back-and-forth.",
    category: "scheduling",
    logo: "CL",
    rating: 4.9,
    reviewCount: 389,
    installCount: 1567,
    pricing: "free",
    setupType: "oauth",
    features: ["Booking page", "Time zone detection", "Automated reminders", "Group events"],
    developer: { name: "Calendly", website: "https://calendly.com" },
    popular: true,
  },
  // Communication
  {
    id: "zoom",
    name: "Zoom",
    description: "Add video conferencing to appointments and consultations.",
    category: "communication",
    logo: "ZM",
    rating: 4.8,
    reviewCount: 523,
    installCount: 1876,
    pricing: "free",
    setupType: "oauth",
    features: ["Video meetings", "Automatic links", "Meeting recordings", "Screen sharing"],
    developer: { name: "Zoom", website: "https://zoom.us" },
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Integrate with Microsoft Teams for business communications.",
    category: "communication",
    logo: "MT",
    rating: 4.6,
    reviewCount: 234,
    installCount: 876,
    pricing: "free",
    setupType: "oauth",
    features: ["Teams meetings", "Channel notifications", "Calendar sync", "File sharing"],
    developer: { name: "Microsoft", website: "https://teams.microsoft.com" },
  },
  // Email
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing automation. Sync customers and send targeted campaigns.",
    category: "email",
    logo: "MC",
    rating: 4.7,
    reviewCount: 678,
    installCount: 2345,
    pricing: "free",
    setupType: "api_key",
    features: ["Customer sync", "Email campaigns", "A/B testing", "Analytics"],
    developer: { name: "Mailchimp", website: "https://mailchimp.com" },
    popular: true,
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Transactional email delivery. Reliable infrastructure for order notifications.",
    category: "email",
    logo: "SG",
    rating: 4.8,
    reviewCount: 445,
    installCount: 1567,
    pricing: "usage_based",
    setupType: "api_key",
    features: ["Transactional email", "Email templates", "Delivery tracking", "Analytics"],
    developer: { name: "Twilio SendGrid", website: "https://sendgrid.com" },
  },
  // E-Signature
  {
    id: "docusign",
    name: "DocuSign",
    description: "Send, sign, and manage agreements electronically.",
    category: "esignature",
    logo: "DS",
    rating: 4.9,
    reviewCount: 312,
    installCount: 876,
    pricing: "paid",
    setupType: "oauth",
    features: ["Electronic signatures", "Document templates", "Audit trail", "Bulk send"],
    developer: { name: "DocuSign", website: "https://docusign.com" },
    popular: true,
  },
  // Social Commerce
  {
    id: "instagram-shop",
    name: "Instagram Shopping",
    description: "Sell directly on Instagram. Tag products in posts and stories.",
    category: "social",
    logo: "IG",
    rating: 4.8,
    reviewCount: 567,
    installCount: 2345,
    pricing: "free",
    setupType: "oauth",
    features: ["Product tagging", "Instagram Shop", "Story shopping", "Live shopping"],
    developer: { name: "Meta", website: "https://instagram.com" },
    popular: true,
  },
  {
    id: "facebook-shop",
    name: "Facebook Shop",
    description: "Create a Facebook Shop and sell products to your Facebook audience.",
    category: "social",
    logo: "FB",
    rating: 4.7,
    reviewCount: 423,
    installCount: 1987,
    pricing: "free",
    setupType: "oauth",
    features: ["Facebook Shop", "Product catalog", "Order management", "Ads integration"],
    developer: { name: "Meta", website: "https://facebook.com" },
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop",
    description: "Sell through TikTok videos and live streams. Reach Gen Z shoppers.",
    category: "social",
    logo: "TT",
    rating: 4.6,
    reviewCount: 234,
    installCount: 1234,
    pricing: "usage_based",
    setupType: "oauth",
    features: ["Video commerce", "Live shopping", "Creator affiliate program", "Catalog sync"],
    developer: { name: "TikTok", website: "https://tiktok.com" },
    popular: true,
  },
];

// ============================================================
// Category Config
// ============================================================
const CATEGORIES: Array<{ id: IntegrationCategory; label: string; icon: React.ReactNode }> = [
  { id: "all", label: "All", icon: <Globe className="h-4 w-4" /> },
  { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { id: "accounting", label: "Accounting", icon: <BarChart2 className="h-4 w-4" /> },
  { id: "delivery", label: "Delivery", icon: <Truck className="h-4 w-4" /> },
  { id: "scheduling", label: "Scheduling", icon: <Calendar className="h-4 w-4" /> },
  { id: "communication", label: "Communication", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "email", label: "Email Marketing", icon: <Mail className="h-4 w-4" /> },
  { id: "social", label: "Social Commerce", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "esignature", label: "E-Signatures", icon: <PenTool className="h-4 w-4" /> },
];

const PRICING_COLORS: Record<IntegrationPricing, string> = {
  free: "bg-green-100 text-green-700",
  paid: "bg-blue-100 text-blue-700",
  usage_based: "bg-purple-100 text-purple-700",
};

const PRICING_LABELS: Record<IntegrationPricing, string> = {
  free: "Free",
  paid: "Paid",
  usage_based: "Pay-as-you-go",
};

// ============================================================
// Components
// ============================================================
function IntegrationCard({
  integration,
  onConnect,
  onViewDetails,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const isConnected = integration.connected === true;

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {integration.popular && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-100 text-amber-700 text-xs">Popular</Badge>
        </div>
      )}
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
            {integration.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary text-sm truncate">
              {integration.name}
            </h3>
            <p className="text-xs text-text-tertiary">{integration.developer.name}</p>
          </div>
          {isConnected && (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {integration.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {integration.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {integration.installCount.toLocaleString()}
          </span>
          <Badge
            className={`text-xs px-1.5 py-0 h-5 ${PRICING_COLORS[integration.pricing]}`}
          >
            {PRICING_LABELS[integration.pricing]}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewDetails(integration.id)}
            >
              Manage
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onConnect(integration.id)}
            >
              <Plug className="h-3 w-3 mr-1" />
              Connect
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={() => onViewDetails(integration.id)}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function IntegrationMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(
    new Set(["paystack"])
  );

  const filtered = useMemo(() => {
    let result = INTEGRATIONS;

    if (activeCategory !== "all") {
      result = result.filter((i) => i.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.developer.name.toLowerCase().includes(q) ||
          i.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    return result.map((i) => ({
      ...i,
      connected: connectedIntegrations.has(i.id),
    }));
  }, [activeCategory, searchQuery, connectedIntegrations]);

  const popularIntegrations = useMemo(
    () => INTEGRATIONS.filter((i) => i.popular).slice(0, 4),
    []
  );

  const handleConnect = (id: string) => {
    // In production: open OAuth flow or credential dialog
    setConnectedIntegrations((prev) => new Set([...prev, id]));
  };

  const handleViewDetails = (id: string) => {
    // Navigate to integration detail page
    window.location.href = `/dashboard/integrations/${id}`;
  };

  const connectedCount = connectedIntegrations.size;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Integration Marketplace
          </h1>
          <p className="text-text-secondary text-sm">
            Connect your store with {INTEGRATIONS.length}+ apps and services.{" "}
            <span className="font-medium text-text-primary">{connectedCount} connected</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-brand-primary/10 text-brand-primary">
            <Zap className="h-3 w-3 mr-1" />
            {connectedCount} Active
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Integrations", value: INTEGRATIONS.length, icon: <Globe className="h-5 w-5 text-blue-500" /> },
          { label: "Connected", value: connectedCount, icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { label: "Free Available", value: INTEGRATIONS.filter((i) => i.pricing === "free").length, icon: <Star className="h-5 w-5 text-amber-500" /> },
          { label: "Categories", value: CATEGORIES.length - 1, icon: <Filter className="h-5 w-5 text-purple-500" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/60">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search integrations..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-brand-primary text-white"
                : "bg-background/60 text-text-secondary hover:bg-background border border-border"
            }`}
          >
            {cat.icon}
            {cat.label}
            {cat.id !== "all" && (
              <span className="ml-0.5 opacity-60">
                ({INTEGRATIONS.filter((i) => i.category === cat.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Popular Section */}
      {activeCategory === "all" && !searchQuery && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Popular Integrations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={{
                  ...integration,
                  connected: connectedIntegrations.has(integration.id),
                }}
                onConnect={handleConnect}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Integrations Grid */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          {activeCategory === "all" ? "All Integrations" : CATEGORIES.find((c) => c.id === activeCategory)?.label}
          <span className="ml-2 text-text-tertiary font-normal">({filtered.length})</span>
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <Globe className="h-10 w-10 mx-auto mb-3 text-text-tertiary" />
            <p className="font-medium">No integrations found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Integration CTA */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 border border-brand-primary/20 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary mb-1">
            Don't see what you need?
          </h3>
          <p className="text-sm text-text-secondary">
            Request a new integration or use our Zapier connection to connect with 5,000+ apps.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm">
            Request Integration
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-1" />
            Connect via Zapier
          </Button>
        </div>
      </div>
    </div>
  );
}
