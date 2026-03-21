"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { logger } from "@/lib/logger";
import { Loader2, Copy, Check } from "lucide-react";

interface WebhookCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AVAILABLE_EVENTS = [
  { id: "order.created", label: "Order Created", category: "Orders" },
  { id: "order.paid", label: "Order Paid", category: "Orders" },
  { id: "order.shipped", label: "Order Shipped", category: "Orders" },
  { id: "order.delivered", label: "Order Delivered", category: "Orders" },
  { id: "order.cancelled", label: "Order Cancelled", category: "Orders" },
  { id: "payment.success", label: "Payment Success", category: "Payments" },
  { id: "payment.failed", label: "Payment Failed", category: "Payments" },
  { id: "customer.created", label: "Customer Created", category: "Customers" },
  { id: "customer.updated", label: "Customer Updated", category: "Customers" },
  { id: "product.created", label: "Product Created", category: "Products" },
  { id: "product.updated", label: "Product Updated", category: "Products" },
  { id: "inventory.low_stock", label: "Low Stock Alert", category: "Inventory" },
  { id: "subscription.created", label: "Subscription Created", category: "Subscriptions" },
  { id: "subscription.cancelled", label: "Subscription Cancelled", category: "Subscriptions" },
  { id: "whatsapp.message.received", label: "WhatsApp Message Received", category: "WhatsApp" },
];

export function WebhookCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: WebhookCreateDialogProps) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdWebhook, setCreatedWebhook] = useState<{
    id: string;
    url: string;
    secret: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === AVAILABLE_EVENTS.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(AVAILABLE_EVENTS.map((e) => e.id));
    }
  };

  const handleSubmit = async () => {
    if (!url || selectedEvents.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          description,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedWebhook(data);
        onSuccess();
      }
    } catch (error) {
      logger.error("[WebhookCreate] Failed to create:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setDescription("");
    setSelectedEvents([]);
    setCreatedWebhook(null);
    onOpenChange(false);
  };

  const copySecret = () => {
    if (createdWebhook?.secret) {
      navigator.clipboard.writeText(createdWebhook.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group events by category
  const eventsByCategory = AVAILABLE_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_EVENTS>);

  if (createdWebhook) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Webhook Created!</DialogTitle>
            <DialogDescription>
              Your webhook has been created successfully. Copy the secret now - it
              won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input value={createdWebhook.url} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={createdWebhook.secret}
                  readOnly
                  type="password"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copySecret}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use this secret to verify webhook signatures in your endpoint.
              </p>
            </div>

            <div className="bg-gray-100 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-500">
                <li>Copy the webhook secret above</li>
                <li>Configure your endpoint to verify signatures</li>
                <li>Test the webhook using the Test button</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Webhook Endpoint</DialogTitle>
          <DialogDescription>
            Create a new webhook to receive real-time event notifications at your
            URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">
              Endpoint URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              placeholder="https://your-app.com/webhooks/vayva"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Must be a valid HTTPS URL that can receive POST requests.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Production webhook for order notifications"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Events to Subscribe <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                type="button"
              >
                {selectedEvents.length === AVAILABLE_EVENTS.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              {Object.entries(eventsByCategory).map(([category, events]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                        />
                        <Label
                          htmlFor={event.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedEvents.length > 0 && (
              <p className="text-sm text-gray-500">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!url || selectedEvents.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Webhook"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
