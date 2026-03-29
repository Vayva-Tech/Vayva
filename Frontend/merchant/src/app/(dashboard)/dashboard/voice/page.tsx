"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Mic,
  Speaker,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
  Smartphone,
  Headphones,
  Volume2,
  Play,
  Pause,
  BarChart3,
  Zap,
  Target,
  Globe,
} from "lucide-react";

// Types
interface VoiceSession {
  id: string;
  customerId: string;
  customerName?: string;
  phoneNumber?: string;
  status: "active" | "completed" | "failed" | "timeout";
  startedAt: string;
  endedAt?: string;
  duration: number;
  commandsProcessed: number;
  cartValue: number;
  language: string;
  platform: "phone" | "smart_speaker" | "mobile_app" | "web";
  sessionType: "order" | "inquiry" | "support";
  commands: VoiceCommand[];
}

interface VoiceCommand {
  id: string;
  timestamp: string;
  rawInput: string;
  intent: string;
  confidence: number;
  action: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  success: boolean;
  response: string;
}

interface VoiceStats {
  totalSessions: number;
  activeSessions: number;
  totalRevenue: number;
  avgSessionDuration: number;
  commandSuccessRate: number;
  topIntents: Array<{ intent: string; count: number }>;
  platformBreakdown: Array<{ platform: string; sessions: number; revenue: number }>;
  hourlyActivity: Array<{ hour: number; sessions: number }>;
}

const PLATFORM_LABELS: Record<string, string> = {
  phone: "Phone Call",
  smart_speaker: "Smart Speaker",
  mobile_app: "Mobile App",
  web: "Web Voice",
};

const INTENT_LABELS: Record<string, string> = {
  search_product: "Search Product",
  add_to_cart: "Add to Cart",
  checkout: "Checkout",
  track_order: "Track Order",
  get_price: "Get Price",
  compare_products: "Compare Products",
  get_recommendations: "Recommendations",
  cancel_order: "Cancel Order",
  speak_to_human: "Speak to Human",
};

export default function VoiceCommerceDashboard() {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [stats, setStats] = useState<VoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<VoiceSession | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s for live sessions
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        apiJson<{ sessions: VoiceSession[] }>("/voice/sessions"),
        apiJson<VoiceStats>("/voice/stats"),
      ]);
      setSessions(sessionsRes.sessions || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[Voice] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === "active");
  const recentSessions = sessions.slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-7 h-7 text-violet-600" />
            Voice Commerce
          </h1>
          <p className="text-gray-500 mt-1">
            AI-powered voice shopping and command processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Globe className="w-3 h-3 mr-1" />
            English, Yoruba, Igbo, Hausa
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Mic className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Volume2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Now</p>
                  <p className="text-2xl font-bold">{stats.activeSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.commandSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Duration</p>
                  <p className="text-2xl font-bold">{Math.round(stats.avgSessionDuration / 60)}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-600 animate-pulse" />
              Live Voice Sessions ({activeSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session) => (
                <Card key={session.id} className="bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {session.customerName || session.phoneNumber || "Anonymous"}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {PLATFORM_LABELS[session.platform]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Commands:</span>
                        <span className="ml-1 font-medium">{session.commandsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cart:</span>
                        <span className="ml-1 font-medium">{formatCurrency(session.cartValue)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => setSelectedSession(session)}
                    >
                      Monitor Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="commands">Command Analytics</TabsTrigger>
          <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Voice shopping sessions and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        {session.platform === "phone" ? (
                          <Smartphone className="w-5 h-5 text-violet-600" />
                        ) : (
                          <Speaker className="w-5 h-5 text-violet-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {session.customerName || session.phoneNumber || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{PLATFORM_LABELS[session.platform]}</span>
                          <span>•</span>
                          <span>{session.commandsProcessed} commands</span>
                          <span>•</span>
                          <span>{Math.round(session.duration / 60)} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(session.cartValue)}</p>
                        <p className="text-xs text-gray-500">Cart Value</p>
                      </div>
                      <Badge
                        className={
                          session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {session.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSession(session)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commands Tab */}
        <TabsContent value="commands" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Top Voice Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topIntents.map((intent) => (
                  <div key={intent.intent} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="font-medium">
                        {INTENT_LABELS[intent.intent] || intent.intent}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500"
                          style={{
                            width: `${(intent.count / (stats.topIntents[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{intent.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {stats?.platformBreakdown.map((platform) => (
              <Card key={platform.platform}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                      {platform.platform === "phone" ? (
                        <Smartphone className="w-6 h-6 text-violet-600" />
                      ) : platform.platform === "smart_speaker" ? (
                        <Speaker className="w-6 h-6 text-violet-600" />
                      ) : (
                        <Mic className="w-6 h-6 text-violet-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{PLATFORM_LABELS[platform.platform]}</h4>
                      <p className="text-sm text-gray-500">{platform.sessions} sessions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-2xl font-bold">{platform.sessions}</p>
                      <p className="text-xs text-gray-500">Sessions</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-2xl font-bold">{formatCurrency(platform.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Details Dialog */}
      {selectedSession && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Session Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                  Close
                </Button>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-bold">{Math.round(selectedSession.duration / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commands</p>
                  <p className="text-xl font-bold">{selectedSession.commandsProcessed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cart Value</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedSession.cartValue)}</p>
                </div>
              </div>

              {/* Command Log */}
              <div>
                <h3 className="font-semibold mb-3">Command History</h3>
                <div className="space-y-3">
                  {selectedSession.commands.map((command) => (
                    <div
                      key={command.id}
                      className={`p-3 rounded-lg border ${
                        command.success ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-violet-600" />
                            <span className="font-medium">&ldquo;{command.rawInput}&rdquo;</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <Badge variant="outline">{INTENT_LABELS[command.intent] || command.intent}</Badge>
                            <span className="text-gray-500">
                              {Math.round(command.confidence * 100)}% confidence
                            </span>
                          </div>
                          {command.productName && (
                            <p className="text-sm text-gray-500 mt-1">
                              Product: {command.productName}
                              {command.quantity && ` × ${command.quantity}`}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            command.success
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {command.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic">
                        &ldquo;{command.response}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
