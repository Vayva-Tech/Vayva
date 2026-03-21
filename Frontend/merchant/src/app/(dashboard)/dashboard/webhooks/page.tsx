"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Webhook,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Activity,
  ExternalLink,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebhookCreateDialog } from "./components/WebhookCreateDialog";
import { WebhookTestDialog } from "./components/WebhookTestDialog";
import { WebhookDeliveryDialog } from "./components/WebhookDeliveryDialog";

interface WebhookEndpoint {
  id: string;
  url: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  subscribedEvents: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface WebhookStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
  averageResponseTime: number;
}

export default function WebhooksPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [stats, setStats] = useState<Record<string, WebhookStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/integrations/webhooks?${params}`);
      const data = await response.json();

      let filtered = data.webhooks || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (wh: WebhookEndpoint) =>
            wh.url.toLowerCase().includes(searchLower) ||
            wh.description?.toLowerCase().includes(searchLower)
        );
      }

      setWebhooks(filtered);

      // Fetch stats for all webhooks in parallel for better performance
      const statsMap: Record<string, WebhookStats> = {};
      if (filtered.length > 0) {
        try {
          const statsPromises = filtered.map((webhook: WebhookEndpoint) =>
            fetch(`/api/integrations/webhooks/${webhook.id}/stats`).then(async (res) => {
              if (res.ok) {
                const stats = await res.json();
                statsMap[webhook.id] = stats;
              }
            }).catch(() => {
              // Ignore individual stats fetch errors
            })
          );
          
          await Promise.all(statsPromises);
        } catch {
          // Ignore overall stats fetch errors
        }
      }
      setStats(statsMap);
    } catch (error) {
      logger.error("[Webhooks] Failed to fetch:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [search, statusFilter]);

  const toggleWebhookStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const response = await fetch(`/api/integrations/webhooks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      logger.error("[Webhooks] Failed to toggle status:", { error });
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/webhooks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      logger.error("[Webhooks] Failed to delete:", { error });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      PAUSED: "bg-yellow-100 text-yellow-800",
      DISABLED: "bg-gray-100 text-gray-800",
    };
    const icons = {
      ACTIVE: <CheckCircle className="h-3 w-3" />,
      PAUSED: <Pause className="h-3 w-3" />,
      DISABLED: <XCircle className="h-3 w-3" />,
    };
    return (
      <Badge className={variants[status]}>
        <span className="flex items-center gap-1">
          {icons[status as keyof typeof icons]}
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
      </Badge>
    );
  };

  const getSuccessRateBadge = (webhookId: string) => {
    const stat = stats[webhookId];
    if (!stat || stat.total === 0) return null;

    const rate = stat.successRate;
    let color = "bg-green-100 text-green-800";
    if (rate < 80) color = "bg-yellow-100 text-yellow-800";
    if (rate < 50) color = "bg-red-100 text-red-800";

    return (
      <Badge className={color}>
        {rate.toFixed(1)}% success
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Manage webhook endpoints to receive real-time event notifications"
        primaryAction={{
          label: "Add Webhook",
          icon: "Plus",
          onClick: () => setShowCreateDialog(true),
        }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhooks.filter((w) => w.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Paused
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {webhooks.filter((w) => w.status === "PAUSED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Events (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((acc, s) => acc + s.total, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search webhooks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health (24h)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading webhooks...
                    </TableCell>
                  </TableRow>
                ) : webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No webhooks found. Add your first webhook to receive
                      real-time event notifications.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium truncate max-w-[300px]">
                            {webhook.url}
                          </p>
                          {webhook.description && (
                            <p className="text-xs text-gray-500">
                              {webhook.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.subscribedEvents.slice(0, 3).map((event, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.subscribedEvents.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{webhook.subscribedEvents.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                      <TableCell>{getSuccessRateBadge(webhook.id)}</TableCell>
                      <TableCell>{formatDate(webhook.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedWebhook(webhook);
                                setShowDeliveryDialog(true);
                              }}
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              View Deliveries
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedWebhook(webhook);
                                setShowTestDialog(true);
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Test Endpoint
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleWebhookStatus(webhook.id, webhook.status)}
                            >
                              {webhook.status === "ACTIVE" ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteWebhook(webhook.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <WebhookCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchWebhooks}
      />

      {selectedWebhook && (
        <>
          <WebhookTestDialog
            open={showTestDialog}
            onOpenChange={setShowTestDialog}
            webhook={selectedWebhook}
          />
          <WebhookDeliveryDialog
            open={showDeliveryDialog}
            onOpenChange={setShowDeliveryDialog}
            webhook={selectedWebhook}
          />
        </>
      )}
    </div>
  );
}
