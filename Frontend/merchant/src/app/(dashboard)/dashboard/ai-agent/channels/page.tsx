"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Switch } from "@vayva/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

interface ChannelConfig {
  enabled: boolean;
  greeting?: string;
}

interface AgentChannels {
  whatsapp: ChannelConfig;
  email: ChannelConfig;
  web: ChannelConfig;
}

import { apiJson } from "@/lib/api-client-shared";

interface AgentConfig {
  name: string;
  avatarUrl: string;
  tone: string;
  signature: string;
  channels?: AgentChannels;
}

interface AgentProfileResponse {
  id: string;
  config?: AgentConfig;
  channels?: AgentChannels;
}

export default function AgentChannelsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [channels, setChannels] = useState<AgentChannels>({
    whatsapp: { enabled: false, greeting: "" },
    email: { enabled: false, greeting: "" },
    web: { enabled: false, greeting: "" },
  });

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiJson<AgentProfileResponse>("/api/ai-agent/profile");
      if (!data) return;

      // Load from draft config if exists, else live
      const source = data.config?.channels ? data.config : data;

      // Merge with defaults to ensure structure
      setChannels({
        whatsapp: {
          enabled: false,
          greeting: "",
          ...source.channels?.whatsapp,
        },
        email: { enabled: false, greeting: "", ...source.channels?.email },
        web: { enabled: false, greeting: "", ...source.channels?.web },
      });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_CHANNELS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load channel settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // First fetch current draft to blend
      const draftData = await apiJson<AgentProfileResponse>(
        "/api/ai-agent/profile",
      );
      const currentConfig = draftData?.config || {};

      const newConfig = {
        ...currentConfig,
        channels: channels,
      };

      await apiJson<{ success: boolean }>("/api/ai-agent/profile", {
        method: "PUT",
        body: JSON.stringify(newConfig),
      });

      toast.success("Channel settings saved (not yet live)");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_CHANNELS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateChannel = (
    channel: keyof AgentChannels,
    key: keyof ChannelConfig,
    value: boolean | string,
  ) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: value,
      },
    }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication Channels</h1>
          <p className="text-gray-500">
            Configure where and how your agent responds.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* WhatsApp */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>
                Respond to customers on WhatsApp.
              </CardDescription>
            </div>
            <Switch
              checked={channels?.whatsapp?.enabled}
              onCheckedChange={(checked) =>
                updateChannel("whatsapp", "enabled", checked)
              }
            />
          </CardHeader>
          {channels?.whatsapp?.enabled && (
            <CardContent className="pt-4 border-t mt-4">
              <div className="space-y-2">
                <Label>Initial Greeting</Label>
                <Textarea
                  value={channels?.whatsapp?.greeting || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateChannel("whatsapp", "greeting", e.target?.value)
                  }
                  placeholder="Hi there! How can I help you regarding your order?"
                />
                <p className="text-xs text-gray-500">
                  Sent as the first response to a new conversation session.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Email */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Auto-draft responses to support emails.
              </CardDescription>
            </div>
            <Switch
              checked={channels?.email?.enabled}
              onCheckedChange={(checked) =>
                updateChannel("email", "enabled", checked)
              }
            />
          </CardHeader>
          {channels?.email?.enabled && (
            <CardContent className="pt-4 border-t mt-4">
              <div className="space-y-2">
                <Label>Signature / Footer</Label>
                <Textarea
                  value={channels?.email?.greeting || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateChannel("email", "greeting", e.target?.value)
                  }
                  placeholder="Best regards,\nThe Vayva Team"
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
