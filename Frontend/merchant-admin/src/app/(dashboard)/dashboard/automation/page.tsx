"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  Bell,
  Clock,
  Package,
  CheckCircle,
  Plus,
  ToggleRight,
} from "@phosphor-icons/react/ssr";
import { AlertTriangle, Mail, MessageSquare, Smartphone } from "lucide-react";

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
    triggeredToday: 0, // Would come from analytics
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
      color: "red",
    },
    {
      type: "fulfillment_delay",
      name: "Fulfillment Delay Alert",
      description: "Alert team when orders are delayed",
      icon: AlertTriangle,
      color: "orange",
    },
    {
      type: "abandoned_cart",
      name: "Abandoned Cart Recovery",
      description: "Follow up on incomplete checkouts",
      icon: MessageSquare,
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Automation</h1>
            <p className="text-text-tertiary">Operational alerts and reminders</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-success text-text-inverse hover:bg-success/90 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <p className="text-sm text-text-tertiary font-medium">Active Rules</p>
          <p className="text-3xl font-black text-success mt-2">{stats.active}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <p className="text-sm text-text-tertiary font-medium">Paused Rules</p>
          <p className="text-3xl font-black text-text-tertiary mt-2">{stats.paused}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <p className="text-sm text-text-tertiary font-medium">Triggered Today</p>
          <p className="text-3xl font-black text-primary mt-2">{stats.triggeredToday}</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4">Rule Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ruleTemplates.map((template) => {
            const existingRule = rules.find((r) => r.type === template.type);
            const Icon = template.icon;
            const colorClasses = {
              amber: "bg-warning/20 text-warning",
              red: "bg-destructive/20 text-destructive",
              orange: "bg-warning/20 text-warning",
              blue: "bg-primary/20 text-primary",
              green: "bg-success/20 text-success",
            };

            return (
              <div
                key={template.type}
                className={`p-6 rounded-xl border shadow-sm transition ${
                  existingRule
                    ? "border-success bg-success/5"
                    : "border-border bg-background/70 backdrop-blur-xl hover:border-success/50"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      colorClasses[template.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {existingRule && (
                    <button
                      onClick={() => toggleRule(existingRule.id, existingRule.isActive)}
                      className={`w-10 h-6 rounded-full transition relative ${
                        existingRule.isActive ? "bg-success" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                          existingRule.isActive ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-text-secondary mb-4">
                  {template.description}
                </p>
                {existingRule ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        existingRule.isActive ? "bg-success" : "bg-text-tertiary"
                      }`}
                    />
                    <span className={existingRule.isActive ? "text-success" : "text-text-tertiary"}>
                      {existingRule.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enable
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Rules List */}
      {rules.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Your Automation Rules</h2>
          <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm divide-y divide-border">
            {rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} onToggle={() => toggleRule(rule.id, rule.isActive)} />
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRuleModal
          templates={ruleTemplates}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRules}
        />
      )}
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
    <div className="p-4 flex items-center justify-between hover:bg-background/30 transition">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            rule.isActive ? "bg-success/20 text-success" : "bg-background/30 text-text-tertiary"
          }`}
        >
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-text-primary">{rule.name || typeLabels[rule.type]}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
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
            rule.isActive ? "bg-success" : "bg-border"
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
      <div className="bg-background rounded-xl border border-border shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Create Automation Rule</h2>
          <p className="text-sm text-text-secondary">
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
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <p className="text-sm text-text-secondary">
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
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-background/30">
              <input
                type="checkbox"
                checked={form.sendEmail}
                onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                className="rounded"
              />
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-background/30">
              <input
                type="checkbox"
                checked={form.sendWhatsApp}
                onChange={(e) => setForm({ ...form, sendWhatsApp: e.target.checked })}
                className="rounded"
              />
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-background/30">
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-success text-text-inverse hover:bg-success/90 font-bold"
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
