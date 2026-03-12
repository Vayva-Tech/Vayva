"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  FloppyDisk as Save,
  PaperPlaneRight as Send,
} from "@phosphor-icons/react/ssr";
import { AgentPreview } from "@/components/ai-agent/AgentPreview";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TestMessageDialog } from "@/components/ai-agent/TestMessageDialog";
import { FileUpload } from "@/components/ui/FileUpload";

interface AgentConfig {
  name: string;
  avatarUrl: string;
  tone: string;
  signature: string;
  [key: string]: any;
}

interface AgentProfile {
  id: string;
  name: string;
  tone: string;
  signature: string;
  avatarUrl: string;
  config?: AgentConfig;
}

import { apiJson } from "@/lib/api-client-shared";

export default function AgentProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [draft, setDraft] = useState<AgentConfig>({
    name: "",
    avatarUrl: "",
    tone: "professional",
    signature: "",
  });
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testChannel, setTestChannel] = useState("whatsapp");

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiJson<AgentProfile>("/api/ai-agent/profile");
      if (!data) return;

      setAgent(data);
      const initialDraft: AgentConfig =
        data.config && Object.keys(data.config).length > 0
          ? data.config
          : {
              name: data.name || "",
              tone: data.tone || "professional",
              signature: data.signature || "",
              avatarUrl: data.avatarUrl || "",
            };
      setDraft(initialDraft);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_PROFILE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to load agent profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/ai-agent/profile", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      toast.success("Changes saved (not yet live)");
      if (agent) {
        setAgent({ ...agent, config: draft });
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_PROFILE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const [publishConfirm, setPublishConfirm] = useState<boolean>(false);

  const handlePublishClick = () => {
    setPublishConfirm(true);
  };

  const confirmPublish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/ai-agent/publish", {
        method: "POST",
      });
      toast.success("Agent profile published!");
      void loadProfile();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[PUBLISH_PROFILE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to publish");
    } finally {
      setIsSaving(false);
      setPublishConfirm(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agent Identity</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsTestOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-4 bg-background/70 backdrop-blur-xl p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={draft.name || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraft({ ...draft, name: e.target?.value })
              }
              placeholder="e.g. Vayva Assistant"
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <p className="text-xs text-text-tertiary mb-2">
              The avatar image shown for your AI agent across all channels.
            </p>
            <FileUpload
              value={draft.avatarUrl || ""}
              onChange={(url: string) => setDraft({ ...draft, avatarUrl: url })}
              purpose="AGENT_AVATAR"
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={2}
              label="Upload Agent Avatar"
            />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select
              value={draft.tone || "professional"}
              onValueChange={(val: string) => setDraft({ ...draft, tone: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Signature</Label>
            <Textarea
              value={draft.signature || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDraft({ ...draft, signature: e.target?.value })
              }
              placeholder="e.g. - Sent by Vayva Agent"
            />
          </div>
        </div>

        <div className="bg-background/30 p-4 rounded-lg flex items-center justify-between border">
          <div>
            <p className="font-medium text-sm">Publish Changes</p>
            <p className="text-xs text-muted-foreground">
              Make these changes live across all channels.
            </p>
          </div>
          <Button
            onClick={handlePublishClick}
            disabled={isSaving}
            variant="primary"
          >
            Publish Live
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Live Preview</h2>
        <div className="bg-background/30 p-8 rounded-xl min-h-[500px] flex items-center justify-center border">
          <AgentPreview config={draft} />
        </div>
      </div>

      <TestMessageDialog
        open={isTestOpen}
        onOpenChange={setIsTestOpen}
        draftConfig={draft}
        channel={testChannel}
        onChannelChange={setTestChannel}
      />
      <ConfirmDialog
        isOpen={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        onConfirm={confirmPublish}
        title="Publish Changes"
        message="Are you sure you want to publish these changes live?"
      />
    </div>
  );
}
