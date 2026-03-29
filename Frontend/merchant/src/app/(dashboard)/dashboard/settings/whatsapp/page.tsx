"use client";

import { logger } from "@vayva/shared";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionCard } from "@/components/whatsapp/settings/ConnectionCard";
import { TemplateManager } from "@/components/whatsapp/settings/TemplateManager";
import { WebhookHealth } from "@/components/whatsapp/settings/WebhookHealth";
import { SafetyFilters } from "@/components/whatsapp/settings/SafetyFilters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarningOctagon as ShieldAlert } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";

interface WhatsAppSettingsResponse {
  channel?: Record<string, unknown>;
  templates?: Record<string, unknown>[];
  settings?: {
    safetyFilters?: Record<string, unknown>;
  };
}

export default function WhatsAppSettingsPage() {
  const { data, error, isLoading } = useSWR<WhatsAppSettingsResponse>(
    "/settings/whatsapp",
    (url: string) => apiJson<WhatsAppSettingsResponse>(url),
  );

  const handleChannelUpdate = async (updateData: unknown) => {
    try {
      await apiJson<{ success: boolean }>("/settings/whatsapp", {
        method: "PATCH",
        body: JSON.stringify({
          type: "CHANNEL",
          data: updateData,
        }),
      });
      void mutate("/settings/whatsapp");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CHANNEL_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Update failed");
      throw error;
    }
  };

  const handleSafetyUpdate = async (updateData: unknown) => {
    try {
      await apiJson<{ success: boolean }>("/settings/whatsapp", {
        method: "PATCH",
        body: JSON.stringify({
          type: "SETTINGS",
          data: { safetyFilters: updateData },
        }),
      });
      void mutate("/settings/whatsapp");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAFETY_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Update failed");
      throw error;
    }
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;
  if (error)
    return <div className="p-8 text-red-500">Failed to load settings.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Agent"
        subtitle="Configure your AI agent, message templates, and connection settings."
      />

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="advanced">Safety & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 space-y-4">
              <ConnectionCard
                channel={data?.channel}
                onUpdate={handleChannelUpdate}
              />
            </div>
            <div className="col-span-3">
              <WebhookHealth />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager
            templates={data?.templates || []}
            onRefresh={() => mutate("/settings/whatsapp")}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-4">
            <Alert>
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle>RBAC Enforced</AlertTitle>
              <AlertDescription>
                Only Users with <strong>Owner</strong> or{" "}
                <strong>Manager</strong> (Support Lead) roles can modify these
                settings. Audit logs are generated for every change.
              </AlertDescription>
            </Alert>

            <SafetyFilters
              settings={data?.settings?.safetyFilters}
              onUpdate={handleSafetyUpdate}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
