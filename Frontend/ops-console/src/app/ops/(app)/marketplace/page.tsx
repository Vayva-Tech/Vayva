"use client";

import React, { useState } from "react";
import { Star, ArrowCounterClockwise as RefreshCw, Eye, EyeSlash as EyeOff, Layout, Package as Box } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Template {
  id: string;
  name: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
}

interface App {
  id: string;
  extensionId: string;
  developerId: string;
  status: string;
  manifestUrl: string;
  updatedAt: string;
}

export default function MarketplacePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "APPS">("TEMPLATES");

  // Templates Query
  const {
    data: templates,
    isLoading: loadingTemplates,
    refetch: refetchTemplates,
  } = useOpsQuery<Template[]>(["templates-list"], () =>
    fetch("/api/ops/marketplace/templates").then((res: Response) =>
      res.json().then((j: { data: Template[] }) => j.data),
    ),
  );

  // Apps Query
  const {
    data: apps,
    isLoading: loadingApps,
    refetch: refetchApps,
  } = useOpsQuery<App[]>(["apps-list"], () =>
    fetch("/api/ops/marketplace/apps").then((res: Response) =>
      res.json().then((j: { data: App[] }) => j.data),
    ),
  );

  // Template Actions
  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/ops/marketplace/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isFeatured: !current }),
      });
      toast.success("Updated template");
      refetchTemplates();
    } catch {
      toast.error("Update failed");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/ops/marketplace/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !current }),
      });
      toast.success("Updated status");
      refetchTemplates();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <OpsPageShell
      title="App & Template Marketplace"
      description="Manage store templates and installed apps"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            refetchTemplates();
            refetchApps();
          }}
          className="rounded-full h-8 w-8"
          aria-label="Refresh marketplace"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${loadingTemplates || loadingApps ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 rounded-none h-auto ${
            activeTab === "TEMPLATES"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Layout size={16} /> Templates
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("APPS")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 rounded-none h-auto ${
            activeTab === "APPS"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Box size={16} /> Apps (Registry)
        </Button>
      </div>

      {/* TEMPLATES TAB */}
      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingTemplates && (
            <p className="text-gray-400 p-8">Loading templates...</p>
          )}
          {!loadingTemplates && templates?.length === 0 && (
            <p className="text-gray-400 p-8">No templates found.</p>
          )}
          {templates?.map((t: Template) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900">
                  {t.name}
                </h3>
                {t.isFeatured && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Star size={10} /> Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {t?.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${t.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {t.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleActive(t.id, t.isActive)
                    }
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded h-8 w-8"
                  >
                    {t.isActive ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleFeatured(t.id, t.isFeatured)
                    }
                    className={`p-1.5 rounded h-8 w-8 ${t.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Star size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPS TAB */}
      {activeTab === "APPS" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Extension ID</th>
                <th className="px-6 py-3 font-medium">Developer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Manifest URL</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingApps ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    Loading apps...
                  </td>
                </tr>
              ) : !apps?.length ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    No apps registered in AppRegistry.
                  </td>
                </tr>
              ) : (
                apps?.map((app: App) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                      {app.extensionId}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {app.developerId}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${app.status === "ACTIVE" ||
                            app.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : app.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate"
                      title={app.manifestUrl}
                    >
                      {app.manifestUrl}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </OpsPageShell>
  );
}
