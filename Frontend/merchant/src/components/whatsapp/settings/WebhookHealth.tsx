"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pulse as Activity,
  XCircle,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";

import { apiJson } from "@/lib/api-client-shared";

interface WebhookStatsResponse {
  status: string;
  lastReceived: string | null;
  successRate: string;
  events24h: number;
  failed: number;
  recentEvents: Array<{
    status: string;
    event: string;
    timestamp: string;
  }>;
}

export function WebhookHealth() {
  const { data, isLoading } = useSWR<WebhookStatsResponse>(
    "/api/settings/whatsapp/stats",
    (url: string) => apiJson<WebhookStatsResponse>(url),
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Webhook Status
            <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const stats = data || {
    status: "UNKNOWN",
    lastReceived: null,
    successRate: "0%",
    events24h: 0,
    failed: 0,
    recentEvents: [],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Webhook Status
          {stats.status === "HEALTHY" ? (
            <Badge className="bg-green-500">Healthy</Badge>
          ) : (
            <Badge variant="destructive">{stats.status}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time status of message delivery events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <div className="text-2xl font-bold">{stats.events24h}</div>
            <div className="text-xs text-gray-500">Events (24h)</div>
          </div>
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate}
            </div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <div
              className={`${stats.failed > 0 ? "text-red-500" : "text-gray-400"} text-2xl font-bold`}
            >
              {stats.failed}
            </div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Events</h4>
          <div className="text-sm space-y-2">
            {stats.recentEvents.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">
                No recent events found.
              </div>
            ) : (
              stats.recentEvents.map((event, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <span className="flex items-center gap-2">
                    {event.status === "FAILED" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-mono text-xs">{event.event}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
