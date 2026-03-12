"use client";

import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import {
  Clock,
  PencilSimple as Edit2,
  FloppyDisk as Save,
  X,
} from "@phosphor-icons/react/ssr";

interface PrepTimeCardProps {
  orderId: string;
  currentPrepTime?: number;
  onUpdate: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

interface PrepTimeResponse {
  success: boolean;
}

export function PrepTimeCard({
  orderId,
  currentPrepTime,
  onUpdate,
}: PrepTimeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prepTime, setPrepTime] = useState(currentPrepTime?.toString() || "30");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const minutes = parseInt(prepTime);
    if (isNaN(minutes) || minutes < 5 || minutes > 480) {
      toast.error("Prep time must be between 5 and 480 minutes");
      return;
    }

    setSaving(true);
    try {
      await apiJson<PrepTimeResponse>(
        `/api/market/orders/${orderId}/prep-time`,
        {
          method: "POST",
          body: JSON.stringify({ prepTimeMinutes: minutes }),
        },
      );

      toast.success("Preparation time updated");
      setIsEditing(false);
      onUpdate();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[PREP_TIME_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to update prep time");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPrepTime(currentPrepTime?.toString() || "30");
    setIsEditing(false);
  };

  return (
    <div className="bg-background p-6 rounded-xl border border-border/40 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Preparation Time
        </h2>
        {!isEditing && currentPrepTime && (
          <Button
            variant="link"
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 p-0 h-auto"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={prepTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPrepTime(e.target.value)
              }
              min={5}
              max={480}
              className="w-24 text-center"
              disabled={saving}
            />
            <span className="text-sm text-text-tertiary">minutes</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-3 w-3 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              size="sm"
              variant="outline"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
          <p className="text-xs text-text-tertiary">
            Estimated time to prepare this order (5-480 min)
          </p>
        </div>
      ) : currentPrepTime ? (
        <div>
          <p className="text-3xl font-bold text-text-primary">
            {currentPrepTime}
          </p>
          <p className="text-sm text-text-tertiary mt-1">minutes</p>
        </div>
      ) : (
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Clock className="h-4 w-4 mr-2" />
          Set Prep Time
        </Button>
      )}
    </div>
  );
}
