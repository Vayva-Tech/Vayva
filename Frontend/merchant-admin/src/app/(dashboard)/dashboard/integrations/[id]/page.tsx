"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Star,
  Users,
  CheckCircle,
  ExternalLink,
  Plug,
  Key,
  Globe,
  AlertCircle,
  Shield,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

// ============================================================
// Types
// ============================================================
interface IntegrationDetail {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  logo: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  pricing: "free" | "paid" | "usage_based";
  setupType: "oauth" | "api_key" | "webhook" | "one_click";
  features: string[];
  requirements: string[];
  permissions: string[];
  developer: { name: string; website?: string; supportEmail?: string };
  documentationUrl?: string;
  connected?: boolean;
  lastSyncAt?: string;
}

interface ApiKeySetupField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  secret?: boolean;
}

// ============================================================
// Integration Details Catalog (static data - would come from API)
// ============================================================
const INTEGRATION_DETAILS: Record<string, IntegrationDetail> = {
  paystack: {
    id: "paystack",
    name: "Paystack",
    logo: "PS",
    category: "Payments",
    description: "Accept payments from customers across Africa.",
    longDescription:
      "Paystack helps businesses in Africa get paid by anyone, anywhere in the world. Accept debit/credit cards, bank transfers, USSD payments, mobile money, and QR payments. With Paystack, you can create payment pages, accept recurring payments, split payments among multiple recipients, and more.",
    rating: 4.9,
    reviewCount: 567,
    installCount: 3456,
    pricing: "usage_based",
    setupType: "api_key",
    features: [
      "Card payments (Visa, Mastercard, Verve)",
      "Bank transfers",
      "USSD payments",
      "Mobile money (MTN, Airtel, Glo)",
      "QR code payments",
      "Split payments",
      "Recurring subscriptions",
      "Refunds management",
      "Real-time webhooks",
      "Analytics dashboard",
    ],
    requirements: ["Paystack business account", "BVN verification completed"],
    permissions: ["Read orders", "Write payment data", "Receive webhooks"],
    developer: {
      name: "Paystack",
      website: "https://paystack.com",
      supportEmail: "support@paystack.com",
    },
    documentationUrl: "https://paystack.com/docs",
    connected: false,
  },
  quickbooks: {
    id: "quickbooks",
    name: "QuickBooks",
    logo: "QB",
    category: "Accounting",
    description: "Sync orders, products, and financial data with QuickBooks Online.",
    longDescription:
      "QuickBooks Online is the world's #1 accounting software for small businesses. Connect your Vayva store to automatically sync sales, customers, products, and expenses. Eliminate manual data entry and keep your books always up-to-date.",
    rating: 4.8,
    reviewCount: 234,
    installCount: 1523,
    pricing: "paid",
    setupType: "oauth",
    features: [
      "Automatic order sync to invoices",
      "Customer import and sync",
      "Product catalog sync",
      "Expense tracking",
      "Financial reporting (P&L, Balance Sheet)",
      "Tax calculation and filing",
      "Multi-currency support",
      "Bank reconciliation",
    ],
    requirements: ["QuickBooks Online subscription (Plus or higher)"],
    permissions: ["Read/write invoices", "Read/write customers", "Read/write products"],
    developer: {
      name: "Intuit",
      website: "https://quickbooks.intuit.com",
      supportEmail: "support@intuit.com",
    },
    documentationUrl: "https://developer.intuit.com/docs",
    connected: false,
  },
};

const API_KEY_FIELDS: Record<string, ApiKeySetupField[]> = {
  paystack: [
    {
      key: "secretKey",
      label: "Secret Key",
      placeholder: "sk_live_...",
      required: true,
      secret: true,
    },
    {
      key: "publicKey",
      label: "Public Key",
      placeholder: "pk_live_...",
      required: true,
    },
  ],
  mailchimp: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1",
      required: true,
      secret: true,
    },
    {
      key: "audienceId",
      label: "Default Audience ID",
      placeholder: "abc12345",
      required: false,
    },
  ],
  sendgrid: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      required: true,
      secret: true,
    },
    { key: "fromEmail", label: "From Email", placeholder: "noreply@yourstore.com", required: true },
    { key: "fromName", label: "From Name", placeholder: "Your Store", required: true },
  ],
  kwik: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "kwik_api_...",
      required: true,
      secret: true,
    },
    {
      key: "vendorId",
      label: "Vendor ID",
      placeholder: "VENDOR123",
      required: false,
    },
  ],
  flutterwave: [
    {
      key: "secretKey",
      label: "Secret Key",
      placeholder: "FLWSECK_TEST-xxxxxxxx",
      required: true,
      secret: true,
    },
    { key: "publicKey", label: "Public Key", placeholder: "FLWPUBK_TEST-xxxxxxxx", required: true },
  ],
};

// ============================================================
// Setup Dialogs
// ============================================================
function ApiKeySetupForm({
  integrationId,
  onSuccess,
}: {
  integrationId: string;
  onSuccess: () => void;
}) {
  const fields = API_KEY_FIELDS[integrationId] ?? [
    { key: "apiKey", label: "API Key", placeholder: "Enter your API key", required: true, secret: true },
  ];

  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In production: POST to /api/integrations/connect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSuccess();
    } catch {
      setError("Failed to connect. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-text-primary mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            type={field.secret ? "password" : "text"}
            placeholder={field.placeholder}
            value={values[field.key] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
            required={field.required}
          />
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Plug className="h-4 w-4 mr-2" />
            Connect Integration
          </>
        )}
      </Button>
    </form>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function IntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const integrationId = params.id as string;

  const [connected, setConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const integration =
    INTEGRATION_DETAILS[integrationId] ??
    ({
      id: integrationId,
      name: integrationId,
      logo: integrationId.slice(0, 2).toUpperCase(),
      category: "Integration",
      description: "Third-party integration",
      longDescription: "Connect this integration to your Vayva store.",
      rating: 4.5,
      reviewCount: 100,
      installCount: 500,
      pricing: "free" as const,
      setupType: "api_key" as const,
      features: [],
      requirements: [],
      permissions: [],
      developer: { name: "Third-party" },
    } satisfies IntegrationDetail);

  const handleConnect = () => {
    if (integration.setupType === "oauth") {
      // In production: redirect to OAuth flow
      window.open(
        `/api/integrations/oauth/start?integration=${integrationId}`,
        "oauth",
        "width=600,height=700"
      );
    } else {
      setShowSetup(true);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;
    setConnected(false);
    setShowSetup(false);
  };

  const pricingLabels = { free: "Free", paid: "Paid", usage_based: "Pay-as-you-go" };
  const pricingColors = {
    free: "bg-green-100 text-green-700",
    paid: "bg-blue-100 text-blue-700",
    usage_based: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs />

      {/* Back */}
      <Link
        href="/dashboard/integrations"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
              {integration.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-text-primary">
                  {integration.name}
                </h1>
                {connected && (
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-text-secondary text-sm mb-2">
                by {integration.developer.name} · {integration.category}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {integration.rating} ({integration.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {integration.installCount.toLocaleString()} installed
                </span>
                <Badge className={pricingColors[integration.pricing]}>
                  {pricingLabels[integration.pricing]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary leading-relaxed">
                {integration.longDescription}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {integration.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          {integration.permissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Key className="h-3 w-3 text-text-tertiary" />
                      {perm}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Connect Card */}
          <Card>
            <CardContent className="p-5">
              {!connected ? (
                <>
                  {!showSetup ? (
                    <>
                      <Button className="w-full mb-3" onClick={handleConnect}>
                        <Plug className="h-4 w-4 mr-2" />
                        {integration.setupType === "oauth"
                          ? "Connect with OAuth"
                          : "Connect Integration"}
                      </Button>
                      {integration.setupType === "oauth" && (
                        <p className="text-xs text-text-tertiary text-center">
                          You'll be redirected to {integration.developer.name} to authorize
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-text-primary mb-3 text-sm">
                        Enter your credentials
                      </h3>
                      <ApiKeySetupForm
                        integrationId={integration.id}
                        onSuccess={() => {
                          setConnected(true);
                          setShowSetup(false);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowSetup(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Connected</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={handleDisconnect}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div>
                <p className="text-xs text-text-tertiary mb-1">Developer</p>
                <p className="text-sm text-text-primary font-medium">
                  {integration.developer.name}
                </p>
              </div>
              {integration.developer.website && (
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Website</p>
                  <a
                    href={integration.developer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-primary hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {integration.developer.website.replace("https://", "")}
                  </a>
                </div>
              )}
              {integration.documentationUrl && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={integration.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          {integration.requirements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {integration.requirements.map((req) => (
                    <div
                      key={req}
                      className="flex items-start gap-2 text-xs text-text-secondary"
                    >
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
