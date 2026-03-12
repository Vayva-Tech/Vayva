"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Icon } from "@vayva/ui";
import { ConversationList } from "@/components/whatsapp/conversation-list";
import { ChatWindowContainer } from "@/components/whatsapp/ChatWindowContainer";
import { WaAgentService } from "@/services/wa-agent";
import { logger } from "@vayva/shared";

type Tab = "whatsapp" | "instagram" | "connections";

type IgStatus = {
  connected: boolean;
  account: string | null;
  pageId: string | null;
  igBusinessId: string | null;
};

interface AIReport {
  totalConversations: number;
  responseRate: number;
  avgResponseTime: string;
  satisfactionScore: number;
  pendingDMs: number;
}

interface Conversation {
  id: string;
  unreadCount: number;
  needsAttention?: boolean;
  customerId: string;
  status: "open" | "resolved";
  lastMessageAt: string;
  [key: string]: unknown;
}

import { apiJson } from "@/lib/api-client-shared";

export default function SocialsPage(): React.JSX.Element {
    const [tab, setTab] = useState<Tab>("whatsapp");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [waLoading, setWaLoading] = useState(false);
    const [ig, setIg] = useState<IgStatus | null>(null);
    const [igLoading, setIgLoading] = useState(false);
    const [igBusy, setIgBusy] = useState(false);
    const [isSocialsEnabled, setIsSocialsEnabled] = useState<boolean | null>(null);
    const [isInstagramEnabled, setIsInstagramEnabled] = useState<boolean | null>(null);
    const [aiReport, setAiReport] = useState<AIReport | null>(null);

    const connectHref = useMemo(() => {
        const url = new URL("/api/socials/instagram/connect", window.location.origin);
        url.searchParams.set("returnTo", "/dashboard/socials");
        return url.pathname + url.search;
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const fetchMe = async () => {
            try {
                const data = await apiJson<any>("/api/auth/merchant/me", { signal: controller.signal });
                const payload = data?.data || data;
                const enabled = Boolean(payload?.features?.socials?.enabled ?? payload?.merchant?.features?.socials?.enabled);
                const igEnabled = Boolean(
                    payload?.features?.socials?.instagramEnabled ?? payload?.merchant?.features?.socials?.instagramEnabled,
                );
                setIsSocialsEnabled(enabled);
                setIsInstagramEnabled(igEnabled);
                if (!enabled) setTab("connections");
                if (enabled && !igEnabled && tab === "instagram") setTab("whatsapp");
            } catch (error: unknown) {
                if ((error as { name?: string })?.name !== "AbortError") {
                    setIsSocialsEnabled(false);
                    setIsInstagramEnabled(false);
                }
            }
        };
        void fetchMe();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (tab !== "whatsapp") return;
        setSelectedConversationId(null);
        setWaLoading(true);
        WaAgentService.getConversations("whatsapp")
            .then((data) => {
                setConversations(data || []);
            })
            .catch(() => {})
            .finally(() => setWaLoading(false));
    }, [tab]);

    useEffect(() => {
        if (tab !== "instagram") return;
        if (!ig?.connected) return;
        setSelectedConversationId(null);
        setWaLoading(true);
        WaAgentService.getConversations("instagram")
            .then((data) => {
                setConversations(data || []);
            })
            .catch(() => {})
            .finally(() => setWaLoading(false));
    }, [tab, ig?.connected]);

    useEffect(() => {
        if (tab !== "instagram" && tab !== "connections") return;
        const controller = new AbortController();
        const fetchIgStatus = async () => {
            setIgLoading(true);
            try {
                const data = await apiJson<any>("/api/socials/instagram/status", { signal: controller.signal });
                if (!data) {
                    setIg(null);
                    return;
                }
                setIg({
                    connected: Boolean(data.connected),
                    account: data.account ?? null,
                    pageId: data.pageId ?? null,
                    igBusinessId: data.igBusinessId ?? null,
                });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
                const _errMsg = error instanceof Error ? error.message : String(error);
                if ((error as {name?: string})?.name !== "AbortError") {
                    setIg(null);
                }
            } finally {
                setIgLoading(false);
            }
        };
        void fetchIgStatus();
        return () => controller.abort();
    }, [tab]);

    const disconnectInstagram = async () => {
        setIgBusy(true);
        try {
            await apiJson("/api/socials/instagram/disconnect", { method: "POST" });
            const refreshed = await apiJson<any>("/api/socials/instagram/status");
            setIg({
                connected: Boolean(refreshed?.connected),
                account: refreshed?.account ?? null,
                pageId: refreshed?.pageId ?? null,
                igBusinessId: refreshed?.igBusinessId ?? null,
            });
            toast.success("Instagram disconnected");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const _errMsg = error instanceof Error ? error.message : String(error);
            logger.error("[DISCONNECT_IG_ERROR]", { error: _errMsg, app: "merchant" });
            toast.error("Failed to disconnect account");
        } finally {
            setIgBusy(false);
        }
    };

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await apiJson<AIReport>("/api/socials/ai-report");
                if (data) setAiReport(data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
                const _errMsg = err instanceof Error ? err.message : String(err);
                logger.error("[Socials] Failed to load AI report", { error: _errMsg, app: "merchant" });
            }
        };
        void fetchReport();
    }, []);

  const pendingDMs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return conversations.filter((c: Conversation) => c.unreadCount > 0 || c.needsAttention);
  }, [conversations]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto apple-stagger pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Icon name="MessageCircle" size={24} className="text-text-inverse" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Icon name="Instagram" size={24} className="text-text-inverse" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">Social Channels</h1>
            <p className="text-text-tertiary">AI-powered conversations</p>
          </div>
        </div>
        <Link href="/dashboard/settings/ai-agent">
          <Button className="bg-primary text-text-inverse hover:bg-primary/90 font-bold apple-button apple-ripple">
            <Icon name="Settings" size={16} className="mr-2" /> AI Settings
          </Button>
        </Link>
      </div>

      {/* AI Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-tertiary font-medium">Total Conversations</p>
            <Icon name="MessageCircle" size={16} className="text-info" />
          </div>
          <p className="text-3xl font-black text-text-primary">{aiReport?.totalConversations || 0}</p>
          <p className="text-xs text-text-tertiary mt-1">Last 30 days</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-tertiary font-medium">Response Rate</p>
            <Icon name="TrendingUp" size={16} className="text-success" />
          </div>
          <p className="text-3xl font-black text-text-primary">{aiReport?.responseRate || 0}%</p>
          <p className="text-xs text-text-tertiary mt-1">AI + Manual</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-tertiary font-medium">Avg Response Time</p>
            <Icon name="Clock" size={16} className="text-primary" />
          </div>
          <p className="text-3xl font-black text-text-primary">{aiReport?.avgResponseTime || "--"}</p>
          <p className="text-xs text-text-tertiary mt-1">First reply</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-tertiary font-medium">Satisfaction</p>
            <Icon name="Star" size={16} className="text-warning" />
          </div>
          <p className="text-3xl font-black text-text-primary">{aiReport?.satisfactionScore || 0}%</p>
          <p className="text-xs text-text-tertiary mt-1">Customer rating</p>
        </div>
        <div className="bg-gradient-to-br from-status-danger to-red-600 rounded-xl border border-status-danger p-4 shadow-lg apple-card apple-gpu apple-elastic">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-inverse font-bold">Needs Attention</p>
            <Icon name="AlertCircle" size={16} className="text-text-inverse" />
          </div>
          <p className="text-3xl font-black text-text-inverse">{pendingDMs.length}</p>
          <p className="text-xs text-text-inverse/80 mt-1">Pending DMs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-1 inline-flex gap-1">
        {(["whatsapp", "instagram", "connections"] as const)
          .filter((t) => {
            if (t === "instagram") return isInstagramEnabled !== false;
            return true;
          })
          .map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              tab === t
                ? "bg-text-primary text-text-inverse"
                : "text-text-tertiary hover:text-text-primary hover:bg-background/30"
            }`}
          >
            {t === "whatsapp" && <Icon name="MessageCircle" size={16} />}
            {t === "instagram" && <Icon name="Instagram" size={16} />}
            {t === "connections" && <Icon name="Link" size={16} />}
          </Button>
        ))}
      </div>

      {isSocialsEnabled === false && (
        <div className="flex-1 overflow-hidden bg-background/30">
          <div className="p-6 h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-text-primary">Socials is not enabled</h2>
              <p className="text-sm text-text-secondary mt-1">
                This module is currently disabled for your store.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSocialsEnabled !== false && (
      <div className="space-y-6">
        {tab === "whatsapp" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DMs Needing Attention */}
            <div className="lg:col-span-1">
              <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-bold text-black flex items-center gap-2">
                    <Icon name="AlertCircle" size={18} className="text-red-500" />
                    Needs Attention ({pendingDMs.length})
                  </h3>
                  <p className="text-xs text-text-tertiary mt-1">Unread or flagged conversations</p>
                </div>
                <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
                  {pendingDMs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="CheckCircle" size={32} className="text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-text-tertiary">All caught up!</p>
                    </div>
                  ) : (
                    pendingDMs.map((conv: { id: string; contact?: { name?: string }; unreadCount?: number; lastMessage?: { text?: string } }) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className="p-4 hover:bg-background/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                            {conv.contact?.name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm text-black truncate">{conv.contact?.name || "Unknown"}</p>
                              {(conv.unreadCount ?? 0) > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-tertiary truncate">{conv.lastMessage?.text || "No message"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* All Conversations */}
            <div className="lg:col-span-2">
              <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm h-[700px] flex flex-col">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-bold text-black">All Conversations</h3>
                  <p className="text-xs text-text-tertiary mt-1">WhatsApp messages</p>
                </div>
                <div className="flex-1 overflow-hidden flex">
                  <div className="w-80 border-r border-border flex flex-col">
                    <ConversationList
                      conversations={conversations}
                      selectedId={selectedConversationId}
                      onSelect={setSelectedConversationId}
                      isLoading={waLoading}
                    />
                  </div>
                  <div className="flex-1 bg-background/30">
                    {selectedConversationId ? (
                      <ChatWindowContainer conversationId={selectedConversationId} conversations={conversations} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                        <Icon name="MessageCircle" size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Select a conversation to view</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "instagram" && (
          <div>
            {ig?.connected ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 apple-stagger">
                <div className="lg:col-span-1">
                  <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm">
                    <div className="p-4 border-b border-border/40">
                      <h3 className="font-bold text-text-primary flex items-center gap-2">
                        <Icon name="AlertCircle" size={18} className="text-destructive" />
                        Needs Attention ({pendingDMs.length})
                      </h3>
                      <p className="text-xs text-text-tertiary mt-1">Unread Instagram DMs</p>
                    </div>
                    <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
                      {pendingDMs.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
                          <p className="text-sm text-text-tertiary">All caught up!</p>
                        </div>
                      ) : (
                        pendingDMs.map((conv: { id: string; contact?: { name?: string }; unreadCount?: number; lastMessage?: { text?: string } }) => (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedConversationId(conv.id)}
                            className="p-4 hover:bg-background/30 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                {conv.contact?.name?.[0] || "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-sm text-black truncate">{conv.contact?.name || "Unknown"}</p>
                                  {(conv.unreadCount ?? 0) > 0 && (
                                    <span className="bg-destructive text-text-inverse text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-tertiary truncate">{conv.lastMessage?.text || "No message"}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border p-4 shadow-sm apple-card apple-gpu">
                    <div className="p-4 border-b border-border/40">
                      <h3 className="font-bold text-black">All Conversations</h3>
                      <p className="text-xs text-text-tertiary mt-1">Instagram DMs</p>
                    </div>
                    <div className="flex-1 overflow-hidden flex">
                      <div className="w-80 border-r border-border flex flex-col">
                        <ConversationList
                          conversations={conversations}
                          selectedId={selectedConversationId}
                          onSelect={setSelectedConversationId}
                          isLoading={waLoading}
                        />
                      </div>
                      <div className="flex-1 bg-background/30">
                        {selectedConversationId ? (
                          <ChatWindowContainer conversationId={selectedConversationId} conversations={conversations} />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                            <Icon name="MessageCircle" size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Select a conversation to view</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Icon name="Instagram" size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-text-primary mb-2">Connect Instagram</h2>
                  <p className="text-text-secondary mb-6">
                    Manage Instagram DMs directly from your dashboard with AI-powered responses.
                  </p>
                  <Link href={connectHref} aria-disabled={igLoading}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg" disabled={igLoading}>
                      {igLoading ? "Checking..." : "Connect Instagram Account"}
                    </Button>
                  </Link>
                  <div className="mt-8 text-sm text-text-secondary space-y-2">
                    <div className="flex items-center gap-2 justify-center">
                      <Icon name="ShieldCheck" size={16} className="text-purple-600" />
                      Official Meta integration
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Icon name="Lock" size={16} className="text-purple-600" />
                      Secure token storage
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "connections" && (
          <div className="p-6 h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-success/10 p-2 rounded">
                    <Icon name="MessageSquare" size={18} className="text-success" />
                  </div>
                  <h3 className="font-semibold text-text-primary">WhatsApp</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">Connect WhatsApp to manage conversations and automate replies.</p>
                <Link href="/dashboard/wa-agent">
                  <Button variant="outline" size="sm" className="w-full">Open WhatsApp setup</Button>
                </Link>
              </div>

              <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <Icon name="MessageCircle" size={18} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Instagram</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">Connect Instagram to receive and reply to DMs.</p>
                {isInstagramEnabled === false ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Instagram is disabled
                  </Button>
                ) : ig?.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={disconnectInstagram}
                    disabled={igBusy || igLoading}
                  >
                    Disconnect ({ig.account || "Instagram"})
                  </Button>
                ) : (
                  <Link href={connectHref} aria-disabled={igLoading}>
                    <Button variant="outline" size="sm" className="w-full" disabled={igLoading}>
                      {igLoading ? "Checking..." : "Connect Instagram"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
