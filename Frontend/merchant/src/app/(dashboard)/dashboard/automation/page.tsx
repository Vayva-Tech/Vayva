// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { Bell, Clock, Package, CheckCircle, Plus, ToggleRight, Zap, Envelope, ChatCircleText, Warning } from "@phosphor-icons/react";

interface AutomationRule {
  id: string;
  name: string;
  type: "low_stock" | "unpaid_order" | "fulfillment_delay" | "abandoned_cart" | "review_request";
  isActive: boolean;
  conditions: {
    threshold?: number;
    delayHours?: number;
    orderStatus?: string;
  };
  actions: {
    sendEmail: boolean;
    sendWhatsApp: boolean;
    sendPush: boolean;
    assignToTeam?: string;
  };
  createdAt: string;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await apiJson<{ rules: AutomationRule[] }>("/api/automation/rules");
      setRules(data.rules || []);
    } catch (error) {
      logger.error("[AUTOMATION_FETCH_ERROR]", { error });
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      await apiJson(`/api/automation/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
      });
      toast.success(isActive ? "Rule paused" : "Rule activated");
      fetchRules();
    } catch {
      toast.error("Failed to update rule");
    }
  };

  const stats = {
    active: rules.filter((r) => r.isActive).length,
    paused: rules.filter((r) => !r.isActive).length,
    total: rules.length,
    triggeredToday: 0,
  };

  const ruleTemplates = [
    {
      type: "low_stock",
      name: "Low Stock Alert",
      description: "Notify when inventory drops below threshold",
      icon: Package,
      color: "amber",
    },
    {
      type: "unpaid_order",
      name: "Unpaid Order Reminder",
      description: "Remind customers to complete payment",
      icon: Clock,
      color: "orange",
    },
    {
      type: "fulfillment_delay",
      name: "Fulfillment Delay Alert",
      description: "Alert team when orders are delayed",
      icon: Warning,
      color: "red",
    },
    {
      type: "abandoned_cart",
      name: "Abandoned Cart Recovery",
      description: "Follow up on incomplete checkouts",
      icon: ChatCircleText,
      color: "blue",
    },
    {
      type: "review_request",
      name: "Review Request",
      description: "Ask customers for feedback after delivery",
      icon: CheckCircle,
      color: "green",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Automation</h1>
          <p className="text-sm text-gray-500 mt-1">Automate repetitive tasks and workflows</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Zap size={18} />}
          label="Total Rules"
          value={String(stats.total)}
          trend={`${stats.paused} paused`}
          positive
        />
        <SummaryWidget
          icon={<ToggleRight size={18} />}
          label="Active"
          value={String(stats.active)}
          trend="running now"
          positive
        />
        <SummaryWidget
          icon={<Bell size={18} />}
          label="Paused"
          value={String(stats.paused)}
          trend="disabled"
          positive={stats.paused === 0}
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Triggered Today"
          value={String(stats.triggeredToday)}
          trend="actions"
          positive
        />
      </div>

      {/* Automation Rules Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Zap size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No automation rules</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first automation rule to streamline your workflow.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Create Rule
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      {(() => {
                        const Icon = ruleTemplates.find(t => t.type === rule.type)?.icon || Bell;
                        return <Icon size={24} className="text-gray-600" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{ruleTemplates.find(t => t.type === rule.type)?.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        {rule.actions.sendEmail && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                            <Envelope size={12} />
                            Email
                          </span>
                        )}
                        {rule.actions.sendWhatsApp && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                            <ChatCircleText size={12} />
                            WhatsApp
                          </span>
                        )}
                        {rule.actions.sendPush && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                            <Bell size={12} />
                            Push
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, rule.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      rule.isActive ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RuleRow({ rule, onToggle }: { rule: AutomationRule; onToggle: () => void }) {
  const typeLabels: Record<string, string> = {
    low_stock: "Low Stock Alert",
    unpaid_order: "Unpaid Order Reminder",
    fulfillment_delay: "Fulfillment Delay Alert",
    abandoned_cart: "Abandoned Cart Recovery",
    review_request: "Review Request",
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-white transition">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            rule.isActive ? "bg-green-50 text-green-600" : "bg-white text-gray-500"
          }`}
        >
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{rule.name || typeLabels[rule.type]}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-700">
            {rule.conditions.threshold && (
              <span>Threshold: {rule.conditions.threshold}</span>
            )}
            {rule.conditions.delayHours && (
              <span>Delay: {rule.conditions.delayHours}h</span>
            )}
            <span className="flex items-center gap-1">
              {rule.actions.sendEmail && <Mail className="w-3 h-3" />}
              {rule.actions.sendWhatsApp && <MessageSquare className="w-3 h-3" />}
              {rule.actions.sendPush && <Smartphone className="w-3 h-3" />}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
          className={`w-12 h-7 rounded-full transition relative ${
            rule.isActive ? "bg-green-500" : "bg-border"
          }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
            rule.isActive ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function CreateRuleModal({
  templates,
  onClose,
  onCreated,
}: {
  templates: any[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    threshold: "",
    delayHours: "24",
    sendEmail: true,
    sendWhatsApp: false,
    sendPush: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplate = templates.find((t) => t.type === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setSubmitting(true);
    try {
      await apiJson("/api/automation/rules", {
        method: "POST",
        body: JSON.stringify({
          type: selectedType,
          name: form.name || selectedTemplate?.name,
          conditions: {
            threshold: form.threshold ? Number(form.threshold) : undefined,
            delayHours: Number(form.delayHours),
          },
          actions: {
            sendEmail: form.sendEmail,
            sendWhatsApp: form.sendWhatsApp,
            sendPush: form.sendPush,
          },
        }),
      });
      toast.success("Automation rule created");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create Automation Rule</h2>
          <p className="text-sm text-gray-700">
            Set up automated alerts and reminders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Rule Type *</Label>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                {selectedTemplate.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={selectedTemplate?.name || "e.g., Low Stock Alert"}
            />
          </div>

          {(selectedType === "low_stock" || selectedType === "fulfillment_delay") && (
            <div className="space-y-2">
              <Label>
                {selectedType === "low_stock" ? "Stock Threshold" : "Delay Threshold (hours)"}
              </Label>
              <Input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                placeholder={selectedType === "low_stock" ? "10" : "24"}
              />
            </div>
          )}

          {(selectedType === "unpaid_order" ||
            selectedType === "abandoned_cart" ||
            selectedType === "review_request") && (
            <div className="space-y-2">
              <Label>Delay (hours)</Label>
              <Input
                type="number"
                value={form.delayHours}
                onChange={(e) => setForm({ ...form, delayHours: e.target.value })}
                placeholder="24"
              />
            </div>
          )}

          <div className="space-y-3">
            <Label>Notification Channels</Label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
              <input
                type="checkbox"
                checked={form.sendEmail}
                onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                className="rounded"
              />
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
              <input
                type="checkbox"
                checked={form.sendWhatsApp}
                onChange={(e) => setForm({ ...form, sendWhatsApp: e.target.checked })}
                className="rounded"
              />
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
              <input
                type="checkbox"
                checked={form.sendPush}
                onChange={(e) => setForm({ ...form, sendPush: e.target.checked })}
                className="rounded"
              />
              <Smartphone className="w-4 h-4" />
              <span>Push Notification</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-50 font-bold"
              disabled={submitting || !selectedType}
            >
              {submitting ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
