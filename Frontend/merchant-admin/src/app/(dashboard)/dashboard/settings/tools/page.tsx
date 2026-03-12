"use client";

import { useEffect, useState, type ComponentType } from "react";
import { logger } from "@vayva/shared";
import { Button, Switch } from "@vayva/ui";
import {
  Spinner,
  Package,
  ShoppingCart,
  Calendar,
  Truck,
  Wallet,
  Megaphone,
  BookOpen,
  Users,
  Repeat,
  Key,
  GridFour,
} from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isEnabled: boolean;
  isRequired: boolean;
  canToggle: boolean;
  routes: string[];
  preferences: Record<string, unknown>;
}

interface ToolsResponse {
  tools: Tool[];
  industry: string;
  total: number;
  enabled: number;
}

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Package,
  ShoppingCart,
  Calendar,
  Truck,
  Wallet,
  Megaphone,
  BookOpen,
  Users,
  Repeat,
  Key,
  GridFour,
};

const categoryLabels: Record<string, string> = {
  commerce: "Commerce",
  operations: "Operations",
  finance: "Finance",
  growth: "Growth",
  content: "Content",
  crm: "CRM",
  developer: "Developer",
  general: "General",
};

export default function ToolsManagementPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiJson<ToolsResponse>("/api/merchant/tools");
      setTools(data?.tools || []);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[ToolsPage] Failed to load tools", { error: errMsg });
      setError("Failed to load tools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = async (toolId: string, enabled: boolean) => {
    try {
      setSaving(toolId);
      setError(null);

      await apiJson("/api/merchant/tools", {
        method: "POST",
        body: JSON.stringify({ toolId, enabled }),
      });

      // Update local state
      setTools((prev) =>
        prev.map((tool) =>
          tool.id === toolId ? { ...tool, isEnabled: enabled } : tool
        )
      );

      logger.info("[ToolsPage] Tool toggled", { toolId, enabled });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[ToolsPage] Failed to toggle tool", { error: errMsg, toolId });
      setError(`Failed to ${enabled ? "enable" : "disable"} tool. Please try again.`);
    } finally {
      setSaving(null);
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <DashboardPageShell title="Tools & Modules">
      <div className="space-y-8 max-w-5xl">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <div className="text-sm text-text-secondary">Total Tools</div>
            <div className="text-2xl font-bold text-text-primary">{tools.length}</div>
          </div>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <div className="text-sm text-text-secondary">Enabled</div>
            <div className="text-2xl font-bold text-green-600">
              {tools.filter((t) => t.isEnabled).length}
            </div>
          </div>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <div className="text-sm text-text-secondary">Disabled</div>
            <div className="text-2xl font-bold text-text-tertiary">
              {tools.filter((t) => !t.isEnabled).length}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="animate-spin w-8 h-8 text-text-tertiary" />
          </div>
        ) : (
          /* Tools by Category */
          <div className="space-y-6">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryTools.map((tool) => {
                    const IconComponent = iconMap[tool.icon] || GridFour;
                    const isSaving = saving === tool.id;

                    return (
                      <div
                        key={tool.id}
                        className={`bg-surface rounded-xl p-4 border transition-all ${
                          tool.isEnabled
                            ? "border-green-200 bg-green-50/30"
                            : "border-border bg-surface-secondary/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              tool.isEnabled ? "bg-green-100 text-green-700" : "bg-surface-tertiary text-text-tertiary"
                            }`}
                          >
                            <IconComponent size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-text-primary">
                                {tool.name}
                              </h4>
                              {tool.isRequired && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary mt-1">
                              {tool.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-xs text-text-tertiary">
                                {tool.routes.length} page{tool.routes.length !== 1 ? "s" : ""}
                              </div>
                              <div className="flex items-center gap-2">
                                {isSaving && (
                                  <Spinner className="animate-spin w-4 h-4 text-text-tertiary" />
                                )}
                                <Switch
                                  checked={tool.isEnabled}
                                  disabled={!tool.canToggle || isSaving}
                                  onCheckedChange={(checked) =>
                                    toggleTool(tool.id, checked)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Note:</strong> Core modules (Catalog and Sales) cannot be disabled as they are
          essential for platform operation. Changes take effect immediately and will update your
          dashboard navigation.
        </div>
      </div>
    </DashboardPageShell>
  );
}
