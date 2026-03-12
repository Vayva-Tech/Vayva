"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Badge, Switch } from "@vayva/ui";
import {
  Calendar,
  Plus,
  Trash,
  GoogleLogo,
  MicrosoftOutlookLogo,
  AppleLogo,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface CalendarSync {
  id: string;
  provider: "google" | "outlook" | "apple" | string;
  name: string;
  email: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  syncDirection: "import" | "export" | "both";
}

const PROVIDER_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  google: { label: "Google Calendar", icon: GoogleLogo, color: "bg-destructive" },
  outlook: { label: "Outlook", icon: MicrosoftOutlookLogo, color: "bg-info" },
  apple: { label: "Apple Calendar", icon: AppleLogo, color: "bg-text-primary" },
};

export default function CalendarSyncPage() {
  const [syncs, setSyncs] = useState<CalendarSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncs();
  }, []);

  const fetchSyncs = async () => {
    try {
      setLoading(true);
      const data = await apiJson<CalendarSync[]>("/api/calendar/syncs");
      setSyncs(data);
    } catch (error) {
      toast.error("Failed to load calendar connections");
    } finally {
      setLoading(false);
    }
  };

  const connectCalendar = async (provider: string) => {
    setConnectingProvider(provider);
    try {
      const response = await apiJson<{ authUrl: string }>(`/api/calendar/connect/${provider}`, {
        method: "POST",
      });
      window.location.href = response.authUrl;
    } catch (error) {
      toast.error(`Failed to connect ${PROVIDER_CONFIG[provider]?.label || provider}`);
      setConnectingProvider(null);
    }
  };

  const toggleSync = async (id: string, isActive: boolean) => {
    try {
      await apiJson(`/api/calendar/syncs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
      });

      setSyncs(syncs.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)));
      toast.success(isActive ? "Sync paused" : "Sync resumed");
    } catch {
      toast.error("Failed to update sync status");
    }
  };

  const deleteSync = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    try {
      await apiJson(`/api/calendar/syncs/${id}`, { method: "DELETE" });
      setSyncs(syncs.filter((s) => s.id !== id));
      toast.success("Calendar connection removed");
    } catch {
      toast.error("Failed to remove connection");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <DashboardPageShell title="Calendar Sync" description="Connect and sync your external calendars">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-background/50 rounded w-1/4" />
          <Card className="h-32 bg-background/50"><div /></Card>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Calendar Sync"
      description="Connect and sync your external calendars"
      actions={
        <Button onClick={() => setShowConnectModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Calendar
        </Button>
      }
    >

      {/* Connected Calendars */}
      {syncs.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-text-tertiary mb-4" />
          <h3 className="font-medium text-lg">No calendars connected</h3>
          <p className="text-text-secondary mt-2 mb-4">
            Connect your Google, Outlook, or Apple calendar to sync events
          </p>
          <Button onClick={() => setShowConnectModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Calendar
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {syncs.map((sync) => {
            const config = PROVIDER_CONFIG[sync.provider as keyof typeof PROVIDER_CONFIG] || {
              icon: Calendar,
              color: "bg-primary",
              label: sync.provider,
            };
            const Icon = config.icon;

            return (
              <Card key={sync.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${config.color} text-text-inverse`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{sync.name}</h3>
                      <p className="text-text-secondary text-sm">{sync.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={sync.isActive ? "success" : "default"}>
                          {sync.isActive ? "Active" : "Paused"}
                        </Badge>
                        {sync.lastSyncedAt && (
                          <span className="text-xs text-text-tertiary">
                            Last synced{" "}
                            {formatDistanceToNow(new Date(sync.lastSyncedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={sync.isActive}
                      onCheckedChange={() => toggleSync(sync.id, sync.isActive)}
                    />
                    <Button
                      onClick={() => deleteSync(sync.id, sync.name)}
                      className="h-9 w-9 rounded-xl bg-destructive text-text-inverse hover:bg-destructive/90 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Connect Calendar</h2>

            <div className="space-y-3">
              {Object.entries(PROVIDER_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isConnecting = connectingProvider === key;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-full flex items-center gap-3"
                    onClick={() => connectCalendar(key)}
                    disabled={isConnecting}
                  >
                    <div className={`p-2 rounded-lg ${config.color} text-text-inverse`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-text-secondary">
                        {isConnecting ? "Connecting..." : `Sync events with ${config.label}`}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowConnectModal(false)}
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Remove Calendar"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"? This will disconnect it from your store.` : ""}
      />
    </DashboardPageShell>
  );
}
