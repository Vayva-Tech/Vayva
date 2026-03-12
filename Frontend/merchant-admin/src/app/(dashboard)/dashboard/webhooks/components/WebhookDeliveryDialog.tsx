"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";
import { logger } from "@/lib/logger";

interface WebhookDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: {
    id: string;
    url: string;
  };
}

interface WebhookDelivery {
  id: string;
  eventType: string;
  status: "PENDING" | "DELIVERED" | "FAILED" | "RETRYING";
  attempt: number;
  responseCode?: number;
  createdAt: string;
  deliveredAt?: string;
  responseBodySnippet?: string;
}

export function WebhookDeliveryDialog({
  open,
  onOpenChange,
  webhook,
}: WebhookDeliveryDialogProps) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/webhooks/${webhook.id}/deliveries`
      );
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
      }
    } catch (error) {
      logger.error("[WebhookDeliveries] Failed to fetch:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDeliveries();
    }
  }, [open, webhook.id]);

  const replayDelivery = async (deliveryId: string) => {
    setReplayingId(deliveryId);
    try {
      const response = await fetch(
        `/api/integrations/webhooks/deliveries/${deliveryId}/replay`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchDeliveries();
      }
    } catch (error) {
      logger.error("[WebhookDeliveries] Failed to replay:", { error });
    } finally {
      setReplayingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      DELIVERED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      RETRYING: "bg-blue-100 text-blue-800",
    };
    const icons = {
      PENDING: <Clock className="h-3 w-3" />,
      DELIVERED: <CheckCircle className="h-3 w-3" />,
      FAILED: <XCircle className="h-3 w-3" />,
      RETRYING: <RefreshCw className="h-3 w-3 animate-spin" />,
    };
    return (
      <Badge className={variants[status]}>
        <span className="flex items-center gap-1">
          {icons[status as keyof typeof icons]}
          {status}
        </span>
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Webhook Deliveries</DialogTitle>
          <DialogDescription>
            View delivery history and retry failed webhooks.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-3 rounded-md mb-4">
            <p className="text-sm font-medium">Endpoint:</p>
            <p className="text-sm text-muted-foreground truncate">{webhook.url}</p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No deliveries found. Events will appear here when they are
                      triggered.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {delivery.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell>{delivery.attempt}</TableCell>
                      <TableCell>
                        {delivery.responseCode ? (
                          <span
                            className={`font-mono text-sm ${
                              delivery.responseCode >= 200 &&
                              delivery.responseCode < 300
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {delivery.responseCode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {delivery.deliveredAt
                          ? formatDate(delivery.deliveredAt)
                          : formatDate(delivery.createdAt)}
                      </TableCell>
                      <TableCell>
                        {(delivery.status === "FAILED" ||
                          delivery.status === "RETRYING") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => replayDelivery(delivery.id)}
                            disabled={replayingId === delivery.id}
                          >
                            {replayingId === delivery.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {deliveries.some((d) => d.status === "FAILED") && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Failed deliveries will be retried
                automatically up to 5 times with exponential backoff. You can
                also retry manually using the replay button.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
