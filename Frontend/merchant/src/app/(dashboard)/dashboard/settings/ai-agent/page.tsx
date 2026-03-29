"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import {
  Robot as Bot,
  FloppyDisk as Save,
  Spinner as Loader2,
  Sparkle as Sparkles,
  Image,
  Microphone,
  ChatCircle,
  PaperPlaneRight,
  User,
  Storefront,
  Info,
} from "@phosphor-icons/react/ssr";
import { Button, Card, Input, Label, Select, Switch, Textarea } from "@vayva/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

interface AiAgentSettings {
  enabled: boolean;
  tone: string;
  agentName: string;
  openingMessage: string;
  knowledgeBase: string;
  automationScope: string;
  brevityMode: string;
  persuasionLevel: number;
  allowImageUnderstanding: boolean;
  allowVoiceNotes: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  oneQuestionRule?: boolean;
  lastUpdated?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MerchantContext {
  publicInfo: string;
  privateInfo: string;
  targetAudience: string;
  competitiveAdvantages: string;
  pricingStrategy: string;
}

import { apiJson } from "@/lib/api-client-shared";

export default function AiAgentSettingsPage() {
  const [settings, setSettings] = useState<AiAgentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Merchant Context state
  const [merchantContext, setMerchantContext] = useState<MerchantContext>({
    publicInfo: "",
    privateInfo: "",
    targetAudience: "",
    competitiveAdvantages: "",
    pricingStrategy: "",
  });
  const [showContextForm, setShowContextForm] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiJson<AiAgentSettings>(
        "/merchant/settings/ai-agent",
      );
      setSettings(data);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_AI_SETTINGS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load AI agent settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await apiJson<AiAgentSettings>(
        "/merchant/settings/ai-agent",
        {
          method: "PATCH",
          body: JSON.stringify(settings),
        },
      );

      setSettings(updated);
      toast.success("AI Agent settings updated and synced");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_AI_SETTINGS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Send chat message to AI
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await apiJson<{
        message: string;
        conversationId: string;
        metadata: { productsCount: number; recentOrders: number };
      }>("/merchant/ai-chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          conversationId,
        }),
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CHAT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to get AI response");
    } finally {
      setChatLoading(false);
    }
  };

  // Quick prompt suggestions
  const quickPrompts = [
    "What products should I add to my catalog?",
    "Analyze my sales - any trends?",
    "Should I increase my prices?",
    "What do customers usually ask about?",
    "Help me write better product descriptions",
  ];

  const applyQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      <PageWithInsights
        insights={
          <>
            <Card className="p-6 bg-white rounded-2xl border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Agent Stats
              </h4>
              <div className="space-y-4">
                <div className="bg-white  p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Synced</span>
                  <span className="text-sm font-medium text-gray-900">
                    {settings?.lastUpdated
                      ? new Date(settings.lastUpdated).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                <div className="bg-white  p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Automation</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${settings?.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                  >
                    {settings?.enabled ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-2xl border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">Pro Tip</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Be specific in your instructions. Mention your return policy,
                shipping times, and top-selling products for the best results.
              </p>
            </Card>
          </>
        }
      >
        <PageHeader
          title="AI Agent Settings"
          subtitle="Customize your AI's personality, tone, and behavior across all social channels."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Agent Status</h3>
                  <p className="text-sm text-gray-500">
                    Enable or disable automated responses.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="agent-status" className="sr-only">
                  Enable AI Agent
                </Label>
                <Switch
                  id="agent-status"
                  checked={settings?.enabled || false}
                  onCheckedChange={(checked) =>
                    setSettings((s) => (s ? { ...s, enabled: checked } : null))
                  }
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="space-y-2">
                <Label htmlFor="agentName">AI Agent Name</Label>
                <Input
                  id="agentName"
                  placeholder="e.g. Vayva Assistant, Store Helper, etc."
                  value={settings?.agentName || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((s) =>
                      s ? { ...s, agentName: e.target?.value } : null,
                    )
                  }
                />
                <p className="text-xs text-gray-400">
                  What should the AI call itself when introducing to customers?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingMessage">Opening Message</Label>
                <Textarea
                  id="openingMessage"
                  placeholder="e.g. Hi! I'm here to help you with any questions about our products. How can I assist you today?"
                  className="h-24"
                  value={settings?.openingMessage || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSettings((s) =>
                      s ? { ...s, openingMessage: e.target?.value } : null,
                    )
                  }
                />
                <p className="text-xs text-gray-400">
                  First message sent when a customer starts a conversation.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone of Voice</Label>
                <Select
                  id="tone"
                  title="Select Agent Tone"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white "
                  value={settings?.tone}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSettings((s) =>
                      s ? { ...s, tone: e.target?.value } : null,
                    )
                  }
                >
                  <option value="PROFESSIONAL">Professional / Corporate</option>
                  <option value="FRIENDLY">Friendly / Warm</option>
                  <option value="WITTY">Witty / Energetic</option>
                  <option value="MINIMALIST">Minimalist / Direct</option>
                </Select>
                <p className="text-xs text-gray-400">
                  Determines how the AI greets and responds to customers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kb">Knowledge Base & Instructions</Label>
                <Textarea
                  id="kb"
                  placeholder="e.g. You are an assistant for Vayva Boutique. We specialize in luxury silk dresses. Deliveries take 3-5 days..."
                  className="h-40"
                  value={settings?.knowledgeBase}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSettings((s) =>
                      s ? { ...s, knowledgeBase: e.target?.value } : null,
                    )
                  }
                />
                <p className="text-xs text-gray-400">
                  Give your agent specific knowledge about your products,
                  policies, and brand.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Automation Scope</Label>
                <Select
                  id="scope"
                  title="Select Automation Scope"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white "
                  value={settings?.automationScope}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSettings((s) =>
                      s ? { ...s, automationScope: e.target?.value } : null,
                    )
                  }
                >
                  <option value="NONE">Manual Only (AI Disabled)</option>
                  <option value="SUPPORT">General Support Only</option>
                  <option value="SALES">Sales & Product Inquiries</option>
                  <option value="ALL">Full Automation (Support & Sales)</option>
                </Select>
              </div>

              {/* Multimodal Settings */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-purple-50 rounded-md text-purple-600">
                    <Image className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Multimodal Features</h4>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Enable AI to understand images and voice notes sent by customers.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowImageUnderstanding" className="text-sm font-medium text-gray-700">
                        Image Understanding
                      </Label>
                      <p className="text-xs text-gray-400">
                        Let AI analyze product images shared by customers
                      </p>
                    </div>
                    <Switch
                      id="allowImageUnderstanding"
                      checked={settings?.allowImageUnderstanding || false}
                      onCheckedChange={(checked) =>
                        setSettings((s) => (s ? { ...s, allowImageUnderstanding: checked } : null))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowVoiceNotes" className="text-sm font-medium text-gray-700">
                        Voice Note Processing
                      </Label>
                      <p className="text-xs text-gray-400">
                        Transcribe and respond to voice messages from customers
                      </p>
                    </div>
                    <Switch
                      id="allowVoiceNotes"
                      checked={settings?.allowVoiceNotes ?? true}
                      onCheckedChange={(checked) =>
                        setSettings((s) => (s ? { ...s, allowVoiceNotes: checked } : null))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-orange-50 rounded-md text-orange-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Behavior & Style</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="oneQuestionRule"
                        className="text-sm font-medium text-gray-700"
                      >
                        One-question follow-ups
                      </Label>
                      <p className="text-xs text-gray-400">
                        Keep the conversation flowing by asking only one question
                        at a time.
                      </p>
                    </div>
                    <Switch
                      id="oneQuestionRule"
                      checked={settings?.oneQuestionRule ?? true}
                      onCheckedChange={(checked) =>
                        setSettings((s) =>
                          s ? { ...s, oneQuestionRule: checked } : null,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brevityMode">Response Brevity</Label>
                    <Select
                      id="brevityMode"
                      title="Select Response Brevity"
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white "
                      value={settings?.brevityMode || "Short"}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSettings((s) =>
                          s ? { ...s, brevityMode: e.target?.value } : null,
                        )
                      }
                    >
                      <option value="Short">Short & Concise (1-2 sentences)</option>
                      <option value="Medium">Balanced (2-4 sentences)</option>
                      <option value="Detailed">Detailed (with examples)</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="persuasionLevel">Persuasion Level</Label>
                    <Select
                      id="persuasionLevel"
                      title="Select Persuasion Level"
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white "
                      value={settings?.persuasionLevel ?? 1}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSettings((s) =>
                          s ? { ...s, persuasionLevel: parseInt(e.target?.value) } : null,
                        )
                      }
                    >
                      <option value={0}>Helpful Only (neutral)</option>
                      <option value={1}>Gently Suggestive (default)</option>
                      <option value={2}>Sales-Focused</option>
                      <option value={3}>Highly Persuasive</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Model Settings */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gray-50 rounded-md text-gray-700">
                    <Bot className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Advanced</h4>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Optional. Tune model behavior for your store.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select
                      id="model"
                      title="Select AI Model"
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white "
                      value={settings?.model || ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSettings((s) =>
                          s ? { ...s, model: e.target?.value || undefined } : null,
                        )
                      }
                    >
                      <option value="">Auto (recommended)</option>
                      <option value="google/gemini-2.5-flash">
                        Gemini 2.5 Flash (fast)
                      </option>
                      <option value="openai/gpt-4o-mini">
                        GPT-4o mini (balanced)
                      </option>
                    </Select>
                    <p className="text-xs text-gray-400">
                      If unsure, keep Auto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={settings?.temperature ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings((s) =>
                            s
                              ? {
                                  ...s,
                                  temperature:
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                }
                              : null,
                          )
                        }
                        placeholder="e.g. 0.1"
                      />
                      <p className="text-xs text-gray-400">
                        Lower = more consistent. Higher = more creative.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min={100}
                        max={4096}
                        step={50}
                        value={settings?.maxTokens ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings((s) =>
                            s
                              ? {
                                  ...s,
                                  maxTokens:
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                }
                              : null,
                          )
                        }
                        placeholder="e.g. 1024"
                      />
                      <p className="text-xs text-gray-400">
                        Hard cap for response length (cost control).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleSave} isLoading={saving} className="gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </Card>

          {/* Merchant Chat Interface */}
          <Card className="p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <ChatCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chat with Your AI</h3>
                <p className="text-sm text-gray-500">
                  Ask questions about your business, get insights, and strategize.
                </p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  onClick={() => applyQuickPrompt(prompt)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-80 overflow-y-auto mb-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Bot className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Start a conversation with your AI assistant</p>
                  <p className="text-xs mt-1">Ask about sales trends, product gaps, or pricing strategy</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-green-100 text-green-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask your AI anything about your business..."
                value={chatInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target?.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendChatMessage();
                  }
                }}
                disabled={chatLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void sendChatMessage()}
                isLoading={chatLoading}
                disabled={!chatInput.trim() || chatLoading}
                className="gap-2"
              >
                <PaperPlaneRight className="h-4 w-4" />
                Send
              </Button>
            </div>
          </Card>

          {/* Merchant Context Form */}
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Storefront className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">About Your Business</h3>
                  <p className="text-sm text-gray-500">
                    Help your AI understand who you are (private to you).
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextForm(!showContextForm)}
              >
                {showContextForm ? "Hide" : "Edit"}
              </Button>
            </div>

            {!showContextForm && merchantContext.publicInfo ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 line-clamp-3">{merchantContext.publicInfo}</p>
              </div>
            ) : (
              showContextForm && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-amber-100 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-orange-600 mt-0.5" />
                      <p className="text-xs text-orange-700">
                        <strong>Why this matters:</strong> The AI uses this information to give you better business advice. 
                        <strong> Public info</strong> can be shared with customers. <strong>Private info</strong> is only for your internal AI conversations.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publicInfo">Public Business Info (shared with customers)</Label>
                    <Textarea
                      id="publicInfo"
                      placeholder="What makes your business unique? Your mission, values, story... (e.g., 'We are a family-owned boutique specializing in handmade leather goods since 2015...')"
                      className="h-24"
                      value={merchantContext.publicInfo}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setMerchantContext((c) => ({ ...c, publicInfo: e.target?.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="privateInfo">Private Context (AI eyes only)</Label>
                    <Textarea
                      id="privateInfo"
                      placeholder="Internal details the AI should know but NOT share: supplier relationships, cost margins, personal preferences, challenges you're facing..."
                      className="h-24"
                      value={merchantContext.privateInfo}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setMerchantContext((c) => ({ ...c, privateInfo: e.target?.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="Who are your ideal customers? (e.g., 'Young professionals aged 25-40 who value sustainability')"
                      value={merchantContext.targetAudience}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMerchantContext((c) => ({ ...c, targetAudience: e.target?.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitiveAdvantages">What Makes You Different?</Label>
                    <Textarea
                      id="competitiveAdvantages"
                      placeholder="Your unique selling points, competitive advantages, or special skills..."
                      className="h-20"
                      value={merchantContext.competitiveAdvantages}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setMerchantContext((c) => ({ ...c, competitiveAdvantages: e.target?.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricingStrategy">Pricing Philosophy</Label>
                    <Input
                      id="pricingStrategy"
                      placeholder="How do you approach pricing? (e.g., 'Premium quality at mid-market prices', 'Always competitive', 'Value-based pricing')"
                      value={merchantContext.pricingStrategy}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMerchantContext((c) => ({ ...c, pricingStrategy: e.target?.value }))
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowContextForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // Merge into knowledge base for now
                        const contextText = `
ABOUT THE MERCHANT:
Public Info: ${merchantContext.publicInfo}
Private Context: ${merchantContext.privateInfo}
Target Audience: ${merchantContext.targetAudience}
Competitive Advantages: ${merchantContext.competitiveAdvantages}
Pricing Strategy: ${merchantContext.pricingStrategy}
`.trim();
                        setSettings((s) =>
                          s ? { ...s, knowledgeBase: `${s.knowledgeBase}\n\n${contextText}`.trim() } : null
                        );
                        setShowContextForm(false);
                        toast.success("Business context saved to knowledge base");
                      }}
                    >
                      Save Context
                    </Button>
                  </div>
                </div>
              )
            )}
          </Card>
        </div>
      </div>
      </PageWithInsights>
    </div>
  );
}
