"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SquaresFour, Plus, PencilSimple as Edit, Trash, Power, PuzzlePiece } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "core" | "commerce" | "content" | "marketing" | "analytics";
  isEnabled: boolean;
  isRequired: boolean;
  version: string;
  dependencies: string[];
  settingsUrl?: string;
  installedAt: string;
}

export default function ModulesPage() {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<FeatureModule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingModule, setEditingModule] = useState<FeatureModule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "core" as "core" | "commerce" | "content" | "marketing" | "analytics",
    isEnabled: true,
    isRequired: false,
    version: "1.0.0",
    dependencies: "",
    settingsUrl: "",
  });

  useEffect(() => { void fetchModules(); }, []);

  const fetchModules = async () => { try { setLoading(true); const data = await apiJson<FeatureModule[]>("/api/modules"); setModules(data || []); } catch (error) { logger.error("[FETCH_MODULES_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load modules"); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, dependencies: formData.dependencies.split(",").map(d => d.trim()).filter(Boolean) };
      if (editingModule) { await apiJson(`/api/modules/${editingModule.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Module updated"); }
      else { await apiJson("/api/modules", { method: "POST", body: JSON.stringify(payload) }); toast.success("Module created"); }
      setIsOpen(false); setEditingModule(null); resetForm(); void fetchModules();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/modules/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchModules(); } catch { toast.error("Failed to delete"); } };
  const handleToggle = async (id: string, isEnabled: boolean) => { try { await apiJson(`/api/modules/${id}/toggle`, { method: "POST", body: JSON.stringify({ isEnabled: !isEnabled }) }); toast.success(isEnabled ? "Disabled" : "Enabled"); void fetchModules(); } catch { toast.error("Failed to toggle"); } };

  const openEdit = (m: FeatureModule) => { setEditingModule(m); setFormData({ name: m.name, description: m.description || "", icon: m.icon || "", category: m.category, isEnabled: m.isEnabled, isRequired: m.isRequired, version: m.version, dependencies: m.dependencies?.join(", ") || "", settingsUrl: m.settingsUrl || "" }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", icon: "", category: "core", isEnabled: true, isRequired: false, version: "1.0.0", dependencies: "", settingsUrl: "" });

  const filteredModules = modules.filter((m) => { const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesCategory = categoryFilter === "all" || m.category === categoryFilter; return matchesSearch && matchesCategory; });

  // Calculate metrics
  const totalModules = modules.length;
  const enabled = modules.filter(m => m.isEnabled).length;
  const disabled = modules.filter(m => !m.isEnabled).length;
  const required = modules.filter(m => m.isRequired).length;
  const core = modules.filter(m => m.category === 'core').length;
  const commerce = modules.filter(m => m.category === 'commerce').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Feature Modules</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform modules and extensions</p>
        </div>
        <Button onClick={() => { setEditingModule(null); resetForm(); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Module
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SummaryWidget
          icon={<PuzzlePiece size={18} />}
          label="Total Modules"
          value={String(totalModules)}
          trend={`${disabled} disabled`}
          positive
        />
        <SummaryWidget
          icon={<Power size={18} />}
          label="Enabled"
          value={String(enabled)}
          trend="active"
          positive
        />
        <SummaryWidget
          icon={<Power size={18} />}
          label="Disabled"
          value={String(disabled)}
          trend="inactive"
          positive={disabled === 0}
        />
        <SummaryWidget
          icon={<SquaresFour size={18} />}
          label="Required"
          value={String(required)}
          trend="system"
          positive
        />
        <SummaryWidget
          icon={<SquaresFour size={18} />}
          label="Core"
          value={String(core)}
          trend="essential"
          positive
        />
        <SummaryWidget
          icon={<SquaresFour size={18} />}
          label="Commerce"
          value={String(commerce)}
          trend="business"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white border-gray-200"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="core">Core</option>
            <option value="commerce">Commerce</option>
            <option value="content">Content</option>
            <option value="marketing">Marketing</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <PuzzlePiece size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No modules yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first feature module to extend platform capabilities.
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Module
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredModules.map((m) => (
              <div key={m.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <SquaresFour size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{m.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        m.category === 'core' ? "bg-blue-50 text-blue-600" :
                        m.category === 'commerce' ? "bg-green-50 text-green-600" :
                        m.category === 'content' ? "bg-purple-50 text-purple-600" :
                        m.category === 'marketing' ? "bg-orange-50 text-orange-600" :
                        "bg-teal-50 text-teal-600"
                      }`}>
                        {m.category}
                      </span>
                      {!m.isEnabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600">
                          Disabled
                        </span>
                      )}
                      {m.isRequired && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{m.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>v{m.version}</span>
                      <span>•</span>
                      <span>{new Date(m.installedAt).toLocaleDateString()}</span>
                      {m.dependencies.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Deps: {m.dependencies.join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.isRequired && (
                      <Button
                        onClick={() => handleToggle(m.id, m.isEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          m.isEnabled 
                            ? "text-orange-600 hover:bg-orange-50" 
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={m.isEnabled ? "Disable" : "Enable"}
                      >
                        <Power size={16} />
                      </Button>
                    )}
                    <Button
                      onClick={() => openEdit(m)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Button>
                    {!m.isRequired && (
                      <Button
                        onClick={() => setDeleteConfirm({ id: m.id, name: m.name })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Module Form Dialog */}
      <dialog open={isOpen} className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingModule ? "Edit" : "New"} Module
          </h2>
          <Button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Inventory Manager"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="core">Core</option>
                <option value="commerce">Commerce</option>
                <option value="content">Content</option>
                <option value="marketing">Marketing</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Version</label>
              <input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Icon</label>
            <input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Icon name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Dependencies (comma-separated)</label>
            <input
              value={formData.dependencies}
              onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
              placeholder="module1, module2"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Settings URL</label>
            <input
              value={formData.settingsUrl}
              onChange={(e) => setFormData({ ...formData, settingsUrl: e.target.value })}
              placeholder="/dashboard/settings/..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              Enabled
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              Required
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end mt-4">
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? "Saving..." : editingModule ? "Update" : "Create"}
          </Button>
        </div>
      </dialog>

      {/* Delete Confirmation Dialog */}
      <dialog open={!!deleteConfirm} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Delete Module</h2>
          <Button
            onClick={() => setDeleteConfirm(null)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{deleteConfirm?.name}"?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setDeleteConfirm(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Delete
            </Button>
          </div>
        </div>
      </dialog>
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
