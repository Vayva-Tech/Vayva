"use client";

import { useState } from "react";
import {
  Lightning as Zap,
  Play,
  Pause,
  Clock,
  WebhooksLogo as Webhook,
  CalendarBlank as CalendarClock,
  BellRinging as BellRing,
  Plus,
  CheckCircle as CheckCircle2,
  ChartBar as BarChart3,
  ChatCircle as MessageCircle,
  ShoppingCart,
  Package,
  FileText,
  TrendUp as TrendingUp,
  ArrowRight,
  X,
  FlowArrow as Workflow,
  Timer,
  ArrowCounterClockwise as RotateCcw,
  PaperPlaneTilt as Send,
} from "@phosphor-icons/react";

// ── Mock Data ────────────────────────────────────────────────────────────────

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  triggerType: 'event' | 'webhook' | 'schedule';
  lastRun: string;
  executionsCount: number;
  successRate: number;
}

const SUMMARY_CARDS = [
  { label: "Active Workflows", value: "5", icon: Zap, color: "bg-green-100 text-green-600" },
  { label: "Executions Today", value: "127", icon: Play, color: "bg-blue-100 text-blue-600" },
  { label: "Time Saved", value: "4.2hrs", icon: Timer, color: "bg-purple-100 text-purple-600" },
];

const WORKFLOWS: Workflow[] = [
  {
    id: "1",
    name: "Auto-reply WhatsApp inquiries",
    description: "Respond to customer messages on WhatsApp automatically",
    status: "active" as const,
    triggerType: "event" as const,
    lastRun: "5 mins ago",
    executionsCount: 48,
    successRate: 98,
  },
  {
    id: "2",
    name: "Restock alert for low inventory",
    description: "Notify when product stock drops below threshold",
    status: "active" as const,
    triggerType: "event" as const,
    lastRun: "12 mins ago",
    executionsCount: 15,
    successRate: 100,
  },
  {
    id: "3",
    name: "Order confirmation flow",
    description: "Send confirmation SMS and email after each purchase",
    status: "active" as const,
    triggerType: "webhook" as const,
    lastRun: "2 mins ago",
    executionsCount: 34,
    successRate: 97,
  },
  {
    id: "4",
    name: "Abandoned cart recovery",
    description: "Send WhatsApp reminder 2 hours after cart abandonment",
    status: "paused" as const,
    triggerType: "schedule" as const,
    lastRun: "3 hours ago",
    executionsCount: 22,
    successRate: 85,
  },
  {
    id: "5",
    name: "Daily sales report",
    description: "Generate and send daily sales summary every evening at 8PM WAT",
    status: "active" as const,
    triggerType: "schedule" as const,
    lastRun: "Yesterday 8:00 PM",
    executionsCount: 8,
    successRate: 100,
  },
];

const WORKFLOW_TEMPLATES = [
  {
    id: "t1",
    name: "Customer Onboarding",
    description: "Welcome new customers with a series of personalized messages",
    icon: Send,
    category: "Engagement",
  },
  {
    id: "t2",
    name: "Flash Sale Notification",
    description: "Automatically notify customers when a flash sale goes live",
    icon: BellRing,
    category: "Marketing",
  },
  {
    id: "t3",
    name: "Inventory Sync",
    description: "Sync inventory levels across all your sales channels",
    icon: RotateCcw,
    category: "Operations",
  },
  {
    id: "t4",
    name: "Review Request",
    description: "Ask customers for reviews 3 days after delivery",
    icon: MessageCircle,
    category: "Engagement",
  },
];

// ── Trigger Icons ────────────────────────────────────────────────────────────

const TRIGGER_ICONS = {
  schedule: CalendarClock,
  webhook: Webhook,
  event: BellRing,
};

const TRIGGER_LABELS = {
  schedule: "Schedule",
  webhook: "Webhook",
  event: "Event",
};

// ── Page Component ───────────────────────────────────────────────────────────

export default function AutopilotPage() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);
  const [showModal, setShowModal] = useState(false);

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? ("paused" as const) : ("active" as const) }
          : w
      )
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Autopilot</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
              PRO
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Automate your business operations
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow List */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Your Workflows
        </h2>
        <div className="space-y-3">
          {workflows.map((workflow) => {
            const TriggerIcon = TRIGGER_ICONS[workflow.triggerType];
            return (
              <div
                key={workflow.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {workflow.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          workflow.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {workflow.status === "active" ? (
                          <Play className="w-2.5 h-2.5" />
                        ) : (
                          <Pause className="w-2.5 h-2.5" />
                        )}
                        {workflow.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{workflow.description}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <TriggerIcon className="w-3.5 h-3.5" />
                        {TRIGGER_LABELS[workflow.triggerType]}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {workflow.lastRun}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {workflow.executionsCount} runs
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-600 font-medium">
                          {workflow.successRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
                      workflow.status === "active" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        workflow.status === "active"
                          ? "translate-x-[22px]"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Workflow Builder - PRO_PLUS */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Advanced Tools
        </h2>
        <a
          href="/dashboard/workflow-automation"
          className="group block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm">
              <Workflow className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Visual Workflow Builder
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  PRO+
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Drag-and-drop automation canvas with AI decision nodes, conditional branching,
                delays, and pre-built templates. Build complex workflows visually.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 group-hover:text-green-700 transition-colors">
                Open Builder
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Workflow Templates */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Pre-built Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WORKFLOW_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {template.description}
                    </p>
                    <button className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                      Use Template
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 text-green-600">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Create Workflow</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              The workflow builder is coming soon. In the meantime, you can use
              one of our pre-built templates below to get started.
            </p>

            <div className="space-y-3 mb-6">
              {WORKFLOW_TEMPLATES.slice(0, 3).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all text-left"
                  >
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
