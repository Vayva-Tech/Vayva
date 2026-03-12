"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Icon, Input, Switch } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

const TONES = [
  { value: "friendly", label: "Friendly & Casual" },
  { value: "professional", label: "Professional" },
  { value: "urgent", label: "Direct & Concise" },
  { value: "luxurious", label: "Luxurious & Elegant" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "pidgin", label: "Pidgin English" },
];

interface WaAgentProfileResponse {
  data: {
    agentName?: string;
    tonePreset?: string;
  } | null;
}

interface WaAgentPlanResponse {
  plan?: string;
}

interface TestMessageResponse {
  reply: string;
}

export default function WhatsappSettingsPage() {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Persona State
  const [persona, setPersona] = useState({
    name: "Vayva Assistant",
    tone: "friendly",
    language: "en",
  });

  const [testInput, setTestInput] = useState("");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleConnect = async () => {
    setStatus("connecting");
    try {
      await apiJson<{ success: boolean }>("/api/whatsapp/instance", {
        method: "POST",
      });
      const data = await apiJson<{ base64?: string; qrcode?: string }>(
        "/api/whatsapp/instance",
      );
      if (data?.base64 || data?.qrcode) {
        setQrCode(data.base64 || data.qrcode || null);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CONNECT_WA_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to initialize connection");
    } finally {
      setStatus("disconnected");
    }
  };

  // Load existing persona settings on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiJson<WaAgentProfileResponse>(
          "/api/seller/ai/profile",
        );
        if (data?.data) {
          const profile = data.data;
          setPersona({
            name: profile.agentName || "Vayva Assistant",
            tone:
              profile.tonePreset === "Professional"
                ? "professional"
                : profile.tonePreset === "Luxury"
                  ? "luxurious"
                  : profile.tonePreset === "Minimal"
                    ? "urgent"
                    : "friendly",
            language: "en",
          });
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.warn("[LOAD_AI_PROFILE_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };
    void loadProfile();
  }, []);

  // Poll connection status after QR is shown
  useEffect(() => {
    if (!qrCode) return;
    let cancelled = false;
    const poll = setInterval(async () => {
      try {
        const res = await apiJson<{ connected?: boolean }>(
          "/api/whatsapp/instance/status",
        );
        if (res?.connected && !cancelled) {
          setStatus("connected");
          setQrCode(null);
          setAiEnabled(true);
          clearInterval(poll);
        }
      } catch {
        // Silently retry on next interval
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [qrCode]);

  const handleSavePersona = async () => {
    try {
      // Update MerchantAiProfile (used by SalesAgent for WhatsApp responses)
      await apiJson<{ success: boolean }>("/api/seller/ai/profile", {
        method: "PUT",
        body: JSON.stringify({
          agentName: persona.name,
          tonePreset:
            persona.tone === "friendly"
              ? "Friendly"
              : persona.tone === "professional"
                ? "Professional"
                : persona.tone === "urgent"
                  ? "Minimal"
                  : persona.tone === "luxurious"
                    ? "Luxury"
                    : "Friendly",
          brevityMode: "Short",
          persuasionLevel: 1,
          oneQuestionRule: true,
        }),
      });
      toast.success("Persona settings saved!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_PERSONA_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to save persona");
    }
  };

  const handleTestSend = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestResponse(null);

    try {
      const data = await apiJson<TestMessageResponse>(
        "/api/ai-agent/test-message",
        {
          method: "POST",
          body: JSON.stringify({ text: testInput }),
        },
      );
      setTestResponse(data?.reply || "No response");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TEST_SEND_ERROR]", { error: _errMsg, app: "merchant" });
      setTestResponse(`Error: ${_errMsg || "Test failed"}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <DashboardPageShell
      title="WhatsApp AI Agent"
      description="Configure your 24/7 automated sales assistant."
      category="Platform"
      actions={
        status === "connected" ? (
          <Badge variant="default">Active</Badge>
        ) : undefined
      }
    >
      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Col: Status & Persona (4 Cols) */}
        <div className="md:col-span-4 space-y-6">
          {/* Connection Card */}
          <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Connection</h3>

            {status === "disconnected" && (
              <div className="text-center">
                <Button onClick={handleConnect} className="w-full">
                  Link WhatsApp
                </Button>
              </div>
            )}
            {status === "connecting" && (
              <div className="text-center">
                {qrCode ? (
                  <div className="space-y-2">
                    <p className="text-xs">Scan QR</p>
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-32 h-32 mx-auto border-4 border-black rounded-lg"
                    />
                  </div>
                ) : (
                  <Icon name="Loader" className="animate-spin" />
                )}
              </div>
            )}
            {status === "connected" && (
              <div className="flex items-center gap-2 text-status-success bg-status-success/10 p-3 rounded-xl">
                <Icon name="Check" className="w-4 h-4" />
                <span className="text-sm font-medium">Linked & Ready</span>
              </div>
            )}
          </div>

          {/* Persona Settings */}
          <div
            className={`bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-sm space-y-4 ${status !== "connected" ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icon name="User" className="w-4 h-4" /> Persona
            </h3>

            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                value={persona.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersona({ ...persona, name: e.target?.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={persona.tone}
                onValueChange={(v: string) =>
                  setPersona({ ...persona, tone: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={persona.language}
                onValueChange={(v: string) =>
                  setPersona({ ...persona, language: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleSavePersona}
            >
              Save Settings
            </Button>
          </div>
        </div>

        {/* Right Col: AI Config & Playground (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Feature Toggle */}
          <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-primary/20 shadow-card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Icon name="Bot" size={16} />
                </div>
                AI Auto-Reply
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Automatically respond to customer inquiries 24/7.
              </p>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>

          {/* Playground */}
          <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b bg-background/30 flex justify-between items-center">
              <h3 className="font-medium text-sm text-text-secondary">
                Test Playground
              </h3>
              <Badge variant="outline">Preview Mode</Badge>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-background/40 backdrop-blur-sm">
              {/* User Msg (Simulated) */}
              {testInput && isTesting && (
                <div className="flex justify-end">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                    {testInput}
                  </div>
                </div>
              )}

              {/* AI Response */}
              {isTesting && !testResponse && (
                <div className="flex justify-start">
                  <div className="bg-background/70 backdrop-blur-xl p-3 rounded-2xl rounded-tl-none border shadow-sm flex gap-2 items-center">
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              {testResponse && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    AI
                  </div>
                  <div className="bg-background/70 backdrop-blur-xl p-3 rounded-2xl rounded-tl-none border shadow-sm max-w-[80%] text-text-primary">
                    {testResponse}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/70 backdrop-blur-xl border-t flex gap-2">
              <Input
                placeholder="Type a message to test..."
                value={testInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTestInput(e.target?.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && handleTestSend()
                }
              />
              <Button
                onClick={handleTestSend}
                disabled={isTesting || !testInput}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
