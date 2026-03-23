"use client";
// @ts-nocheck

import {
  Plug,
  CheckCircle,
  Gear as Settings,
  BookOpen,
  EnvelopeSimple as Mail,
  ChartBar as BarChart3,
  ChartPie as PieChart,
  ShoppingBag,
} from "@phosphor-icons/react";

const connectedIntegrations = [
  {
    id: "paystack",
    name: "Paystack",
    logo: "PS",
    description: "Payment processing for African businesses",
    lastSync: "2 minutes ago",
    color: "bg-green-500",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    logo: "WA",
    description: "Customer messaging and order notifications",
    lastSync: "5 minutes ago",
    color: "bg-emerald-500",
  },
  {
    id: "instagram",
    name: "Instagram Shopping",
    logo: "IG",
    description: "Sell products directly on Instagram",
    lastSync: "12 minutes ago",
    color: "bg-pink-500",
  },
];

const availableIntegrations = [
  {
    id: "quickbooks",
    name: "QuickBooks",
    logo: "QB",
    description: "Sync orders and financial data with QuickBooks Online for seamless accounting.",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    id: "xero",
    name: "Xero",
    logo: "XR",
    description: "Connect your store with Xero for invoicing and financial management.",
    icon: BookOpen,
    color: "bg-sky-500",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    logo: "MC",
    description: "Email marketing automation. Sync customers and send targeted campaigns.",
    icon: Mail,
    color: "bg-amber-500",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    logo: "GA",
    description: "Track store visitors, conversions, and marketing attribution.",
    icon: BarChart3,
    color: "bg-orange-500",
  },
  {
    id: "facebook-pixel",
    name: "Facebook Pixel",
    logo: "FB",
    description: "Track conversions and build audiences for Facebook and Instagram ads.",
    icon: PieChart,
    color: "bg-blue-600",
  },
  {
    id: "shopify-import",
    name: "Shopify Import",
    logo: "SI",
    description: "Migrate your products, customers, and orders from Shopify to Vayva.",
    icon: ShoppingBag,
    color: "bg-green-600",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Connect your store with apps and services</p>
      </div>

      {/* Connected Integrations */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Connected</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {connectedIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-xl ${integration.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
                >
                  {integration.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{integration.name}</h3>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-md">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Connected
                  </span>
                  <span className="text-xs text-gray-400">Synced {integration.lastSync}</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Available
          <span className="ml-2 text-gray-400 font-normal normal-case">({availableIntegrations.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl ${integration.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
                >
                  {integration.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{integration.name}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{integration.description}</p>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
                <Plug className="w-4 h-4" />
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
