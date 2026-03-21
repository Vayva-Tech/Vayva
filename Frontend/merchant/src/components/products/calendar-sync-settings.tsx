"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { Button, Input, Icon, Badge } from "@vayva/ui";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface CalendarSync {
  id: string;
  name: string;
  url: string;
  lastSyncedAt: string | null;
  syncStatus: string;
  error: string | null;
}

interface CalendarSyncSettingsProps {
  productId: string;
  initialSyncs?: CalendarSync[];
}

import { apiJson } from "@/lib/api-client-shared";

export const CalendarSyncSettings = ({
  productId,
  initialSyncs = [],
}: CalendarSyncSettingsProps) => {
  const router = useRouter();
  const [syncs, setSyncs] = useState<CalendarSync[]>(initialSyncs);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const handleAdd = async () => {
    if (!newName || !newUrl) return;
    setLoading(true);

    try {
      const newSync = await apiJson<CalendarSync>(
        `/api/products/${productId}/calendar-sync`,
        {
          method: "POST",
          body: JSON.stringify({ name: newName, url: newUrl }),
        },
      );

      setSyncs([...syncs, newSync]);
      setIsAdding(false);
      setNewName("");
      setNewUrl("");
      router.refresh();
      toast.success("Calendar sync added");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[ADD_CALENDAR_SYNC_ERROR]", {
        error: _errMsg,
        productId,
        app: "merchant",
      });
      toast.error(_errMsg || "Error adding sync");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setSyncs(syncs.filter((s) => s.id !== id));

    try {
      await apiJson<{ success: boolean }>(`/api/calendar-sync/${id}`, {
        method: "DELETE",
      });
      toast.success("Calendar sync removed");
      router.refresh();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[DELETE_CALENDAR_SYNC_ERROR]", {
        error: _errMsg,
        syncId: id,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to delete sync");
      // Revert if needed, or just refresh
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => {
          if (!confirmDelete.id) return;
          const id = confirmDelete.id;
          setConfirmDelete({ open: false, id: null });
          void handleDelete(id);
        }}
        title="Remove calendar sync?"
        message="This will stop blocking dates from this calendar."
        confirmText="Remove"
        cancelText="Cancel"
        variant="warning"
      />
      {syncs.length > 0 && (
        <div className="flex flex-col gap-2">
          {syncs.map((sync) => (
            <div
              key={sync.id}
              className="bg-white border border-white/10 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">
                    {sync.name}
                  </span>
                  <Badge
                    variant={
                      sync.syncStatus === "SUCCESS"
                        ? "success"
                        : sync.syncStatus === "FAILED"
                          ? "error"
                          : "default"
                    }
                  >
                    {sync.syncStatus}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 truncate text-ellipsis max-w-[200px]">
                  {sync.url}
                </span>
                {sync.lastSyncedAt && (
                  <span className="text-[10px] text-gray-500">
                    Last synced:{" "}
                    {format(new Date(sync.lastSyncedAt), "MMM d, h:mm a")}
                  </span>
                )}
                {sync.error && (
                  <span className="text-[10px] text-red-400">
                    Error: {sync.error}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDelete({ open: true, id: sync.id })}
                className="text-gray-500 hover:text-red-400"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="bg-white border border-white/10 rounded-lg p-4 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white">
            Add External Calendar
          </h4>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Label (e.g. Airbnb)"
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
              className="bg-black/20"
            />
            <Input
              placeholder="iCal URL (https://...)"
              value={newUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewUrl(e.target.value)
              }
              className="bg-black/20"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={loading || !newName || !newUrl}
              >
                {loading ? "Adding..." : "Add Calendar"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed border-white/20 hover:border-white/40 text-gray-500"
          onClick={() => setIsAdding(true)}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Connect Calendar
        </Button>
      )}
    </div>
  );
};
