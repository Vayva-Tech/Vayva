"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, IconName, cn } from "@vayva/ui";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface Extension {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isEnabled: boolean;
}

interface ExtensionsResponse {
  extensions: Extension[];
}

export const ExtensionsGallery = () => {
  const router = useRouter();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    void fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      setLoading(true);
      const data = await apiJson<ExtensionsResponse>(
        "/control-center/extensions",
      );
      setExtensions(data.extensions || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_EXTENSIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load extensions");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ext: Extension) => {
    setToggling(ext.id);
    try {
      await apiJson<{ success: boolean }>("/control-center/extensions", {
        method: "PATCH",
        body: JSON.stringify({ extensionId: ext.id, enabled: !ext.isEnabled }),
      });

      toast.success(`${ext.name} ${!ext.isEnabled ? "enabled" : "disabled"}`);
      void fetchExtensions();

      // Refresh server components to reflect sidebar changes
      setTimeout(() => router.refresh(), 1000);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TOGGLE_EXTENSION_ERROR]", {
        error: _errMsg,
        app: "merchant",
        extensionId: ext.id,
      });
      toast.error("Failed to update extension status");
    } finally {
      setToggling(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extensions.map((ext) => (
          <div
            key={ext.id}
            className={cn(
              "bg-white border rounded-2xl p-6 transition-all relative overflow-hidden group hover:shadow-md",
              ext.isEnabled
                ? "border-black/5 ring-1 ring-black/5"
                : "border-gray-100",
            )}
          >
            {/* Status Label */}
            <div className="flex justify-between items-start mb-4">
              <div
                className={cn(
                  "p-3 rounded-xl",
                  ext.isEnabled
                    ? "bg-black text-white"
                    : "bg-white/40 text-gray-400",
                )}
              >
                <Icon name={ext.icon as IconName} size={20} />
              </div>
              <div
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                  ext.isEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-white/40 text-gray-400",
                )}
              >
                {ext.isEnabled ? "Enabled" : "Available"}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{ext.name}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              {ext.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {ext.category}
              </span>
              <Button
                variant={ext.isEnabled ? "outline" : "primary"}
                size="sm"
                onClick={() => handleToggle(ext)}
                disabled={toggling === ext.id}
                className="h-8 py-0"
              >
                {toggling === ext.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : ext.isEnabled ? (
                  "Manage"
                ) : (
                  "Install"
                )}
              </Button>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Icon name={ext.icon as IconName} size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {extensions.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-gray-400">No extensions found.</p>
        </div>
      )}
    </div>
  );
};
