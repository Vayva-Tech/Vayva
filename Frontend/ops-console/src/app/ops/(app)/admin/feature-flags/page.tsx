"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { Button } from "@vayva/ui";
import {
  ToggleLeft,
  ToggleRight,
  Plus,
  Globe,
  Building,
  User,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { Search, AlertCircle } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  updatedAt: string;
}

export default function FeatureFlagsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", name: "", description: "" });

  const queryClient = useQueryClient();

  const { data, isLoading } = useOpsQuery(
    ["feature-flags", search],
    async () => {
      const params = new URLSearchParams();
      if (search) params.append("q", search);

      const res = await fetch(`/api/ops/admin/feature-flags?${params}`);
      return res.json();
    }
  );

  const flags: FeatureFlag[] = data?.flags || [];

  const handleToggle = async (flag: FeatureFlag) => {
    const res = await fetch(`/api/ops/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !flag.enabled }),
    });

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    }
  };

  const handleCreate = async () => {
    const res = await fetch("/api/ops/admin/feature-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFlag),
    });

    if (res.ok) {
      setShowCreate(false);
      setNewFlag({ key: "", name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "GLOBAL": return <Globe className="h-4 w-4" />;
      case "STORE": return <Building className="h-4 w-4" />;
      case "USER": return <User className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <OpsPageShell
      title="Feature Flags"
      description="Manage feature flags across the platform"
      headerActions={
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Flag
        </Button>
      }
    >
      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Feature Flag</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key</label>
                <input
                  type="text"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                  placeholder="e.g., new_checkout_flow"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  placeholder="e.g., New Checkout Flow"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="What does this flag control?"
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newFlag.key || !newFlag.name}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Flags</p>
          <p className="text-2xl font-bold">{flags.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Enabled</p>
          <p className="text-2xl font-bold text-green-600">
            {flags.filter((f) => f.enabled).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Disabled</p>
          <p className="text-2xl font-bold text-gray-600">
            {flags.filter((f) => !f.enabled).length}
          </p>
        </div>
      </div>

      {/* Flags List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : flags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            No feature flags found
          </div>
        ) : (
          <div className="divide-y">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {flag.key}
                    </code>
                  </div>
                  {flag.description && (
                    <p className="text-sm text-gray-500 mt-1">{flag.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(flag)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {flag.enabled ? (
                      <ToggleRight className="h-8 w-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/ops/admin/feature-flags/${flag.id}`}>Edit</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OpsPageShell>
  );
}
