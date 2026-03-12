"use client";

import { logger } from "@vayva/shared";
import { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  Prohibit as Ban,
  Clock,
  Warning as AlertTriangle,
} from "@phosphor-icons/react/ssr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button, Input, Switch } from "@vayva/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SafetyFiltersProps {
  settings?: {
    rateLimitEnabled?: boolean;
    rateLimitPerHour?: number;
    spamDetectionEnabled?: boolean;
    blockedNumbers?: string[];
    blockedKeywords?: string[];
    aiSensitivity?: number;
    autoEscalationThreshold?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (data: Record<string, any>) => Promise<void>;
}

export function SafetyFilters(props: SafetyFiltersProps) {
  const { settings, onUpdate } = props;
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    rateLimitEnabled: settings?.rateLimitEnabled ?? false,
    rateLimitPerHour: settings?.rateLimitPerHour ?? 100,
    spamDetectionEnabled: settings?.spamDetectionEnabled ?? true,
    blockedNumbers: (settings?.blockedNumbers || []).join("\n"),
    blockedKeywords: (settings?.blockedKeywords || []).join(", "),
    aiSensitivity: settings?.aiSensitivity ?? 70,
    autoEscalationThreshold: settings?.autoEscalationThreshold ?? 3,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        rateLimitEnabled: formData.rateLimitEnabled,
        rateLimitPerHour:
          parseInt(formData.rateLimitPerHour?.toString()) || 100,
        spamDetectionEnabled: formData.spamDetectionEnabled,
        blockedNumbers: formData.blockedNumbers
          ? formData.blockedNumbers
              .split("\n")
              .map((n: string) => n.trim())
              .filter(Boolean)
          : [],
        blockedKeywords: formData.blockedKeywords
          ? formData.blockedKeywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [],
        aiSensitivity: parseInt(formData.aiSensitivity?.toString()) || 70,
        autoEscalationThreshold:
          parseInt(formData.autoEscalationThreshold?.toString()) || 3,
      });
      toast.success("Safety filters updated successfully");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAFETY_FILTERS_SAVE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save filters");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle>Rate Limiting</CardTitle>
          </div>
          <CardDescription>
            Prevent abuse by limiting the number of messages per hour
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">
                Block customers who exceed the hourly limit
              </p>
            </div>
            <Switch
              checked={formData.rateLimitEnabled}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, rateLimitEnabled: checked })
              }
              disabled={saving}
            />
          </div>
          {formData.rateLimitEnabled && (
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Messages per hour</Label>
              <Input
                id="rateLimit"
                type="number"
                min="1"
                max="1000"
                value={formData.rateLimitPerHour}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    rateLimitPerHour: Number(e.target.value),
                  })
                }
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 50-100 messages per hour
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle>Spam Detection</CardTitle>
          </div>
          <CardDescription>
            Automatically detect and filter spam messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Spam Detection</Label>
              <p className="text-sm text-muted-foreground">
                Uses AI to identify and block spam patterns
              </p>
            </div>
            <Switch
              checked={formData.spamDetectionEnabled}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, spamDetectionEnabled: checked })
              }
              disabled={saving}
            />
          </div>

          {formData.spamDetectionEnabled && (
            <div className="pt-4 space-y-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>AI Sensitivity</Label>
                  <span className="text-sm font-medium">
                    {formData.aiSensitivity}%
                  </span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.aiSensitivity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      aiSensitivity: parseInt(e.target.value),
                    })
                  }
                  className="h-1.5"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Higher sensitivity means stricter filtering.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Self-Escalation Threshold</Label>
                <Select
                  value={formData.autoEscalationThreshold.toString()}
                  onValueChange={(v: string) =>
                    setFormData({
                      ...formData,
                      autoEscalationThreshold: parseInt(v),
                    })
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Negative interaction</SelectItem>
                    <SelectItem value="3">3 Negative interactions</SelectItem>
                    <SelectItem value="5">5 Negative interactions</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Automatic handoff to human after repeated customer
                  frustration.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            <CardTitle>Blocklist</CardTitle>
          </div>
          <CardDescription>
            Block specific phone numbers or keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockedNumbers">Blocked Phone Numbers</Label>
            <Textarea
              id="blockedNumbers"
              placeholder="+2348012345678&#10;+2347012345678"
              value={formData.blockedNumbers}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, blockedNumbers: e.target.value })
              }
              rows={4}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Enter one phone number per line (with country code)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blockedKeywords">Blocked Keywords</Label>
            <Textarea
              id="blockedKeywords"
              placeholder="spam, scam, fraud"
              value={formData.blockedKeywords}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, blockedKeywords: e.target.value })
              }
              rows={3}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of keywords to block
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> Changes to safety filters take effect
          immediately and apply to all incoming messages.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
