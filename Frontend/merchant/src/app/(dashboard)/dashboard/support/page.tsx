"use client";
import { Button } from "@vayva/ui";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Headphones,
  BookOpen,
  Users,
  Bug,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
  ExternalLink,
} from "lucide-react";

const quickActions = [
  {
    id: "contact",
    title: "Contact Support",
    description: "Chat with our team for real-time help",
    icon: Headphones,
    href: "/dashboard/support/new",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    cta: "Start conversation",
  },
  {
    id: "docs",
    title: "View Documentation",
    description: "Guides, tutorials, and API references",
    icon: BookOpen,
    href: "https://docs.vayva.co",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    cta: "Browse docs",
    external: true,
  },
  {
    id: "community",
    title: "Community Forum",
    description: "Ask questions and share knowledge",
    icon: Users,
    href: "https://community.vayva.co",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    cta: "Join community",
    external: true,
  },
  {
    id: "bug",
    title: "Report a Bug",
    description: "Found an issue? Let us know",
    icon: Bug,
    href: "/dashboard/support/new?type=bug",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    cta: "Report issue",
  },
];

const recentTickets = [
  {
    id: "TKT-1042",
    subject: "Payment gateway integration issue",
    status: "open",
    createdAt: "2 hours ago",
    priority: "high",
  },
  {
    id: "TKT-1039",
    subject: "Shipping label not generating",
    status: "in-progress",
    createdAt: "1 day ago",
    priority: "medium",
  },
  {
    id: "TKT-1035",
    subject: "How to set up WhatsApp notifications",
    status: "resolved",
    createdAt: "3 days ago",
    priority: "low",
  },
];

const faqItems = [
  {
    id: "faq-1",
    question: "How do I connect my payment provider?",
    answer:
      "Go to Settings > Payments and click 'Add payment method'. You can connect Stripe, PayPal, Flutterwave, or Paystack. Follow the on-screen instructions to authorize the connection.",
  },
  {
    id: "faq-2",
    question: "How do I set up shipping zones?",
    answer:
      "Navigate to Settings > Shipping and click 'Add shipping zone'. Define your zones by country or region, then set flat or weight-based rates for each zone.",
  },
  {
    id: "faq-3",
    question: "Can I invite team members to my store?",
    answer:
      "Yes! Go to Settings > Team and click 'Invite member'. Enter their email address and assign a role (Admin, Manager, or Staff). They will receive an email invitation to join.",
  },
  {
    id: "faq-4",
    question: "How do I export my order data?",
    answer:
      "Go to Orders, then click the 'Export' button in the top right. Choose your date range and format (CSV or Excel), then click 'Download'. You can also schedule automated exports.",
  },
  {
    id: "faq-5",
    question: "What happens if I downgrade my plan?",
    answer:
      "When you downgrade, you retain access to your current plan until the end of your billing cycle. After that, features exclusive to the higher tier will be disabled, but your data is always preserved.",
  },
];

const statusConfig = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
};

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
          <LifeBuoy className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            How can we help?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search our knowledge base or reach out to our support team
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const Component = action.external ? "a" : Link;
          const extraProps = action.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Component
              key={action.id}
              href={action.href}
              {...extraProps}
              className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 flex flex-col"
            >
              <div
                className={`w-11 h-11 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1">
                {action.description}
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-green-600">
                <span>{action.cta}</span>
                {action.external ? (
                  <ExternalLink className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </Component>
          );
        })}
      </div>

      {/* Recent Support Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Tickets
          </h2>
          <Link
            href="/dashboard/support/messages"
            className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {recentTickets.map((ticket) => {
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/support/messages/${ticket.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg ${status.bg} flex items-center justify-center shrink-0`}
                  >
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">
                        {ticket.id}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-0.5 truncate">
                      {ticket.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">
                    {ticket.createdAt}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {filteredFaq.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div key={item.id}>
                <Button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <span className="text-sm font-medium text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isOpen && (
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {filteredFaq.length === 0 && (
            <div className="text-center py-10">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No FAQs match your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-green-50 rounded-2xl p-6 text-center space-y-3">
        <MessageCircle className="w-8 h-8 text-green-600 mx-auto" />
        <h3 className="text-sm font-semibold text-gray-900">
          Still need help?
        </h3>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Our support team is available 24/7 to assist you with any questions or
          issues.
        </p>
        <Link
          href="/dashboard/support/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors shadow-sm"
        >
          <Headphones className="w-4 h-4" />
          Get in touch
        </Link>
      </div>
    </div>
  );
}

