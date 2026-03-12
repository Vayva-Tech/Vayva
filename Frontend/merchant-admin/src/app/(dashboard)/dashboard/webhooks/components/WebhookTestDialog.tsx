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
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { logger } from "@/lib/logger";

interface WebhookTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: {
    id: string;
    url: string;
  };
}

interface TestResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  responseTime?: number;
}

export function WebhookTestDialog({
  open,
  onOpenChange,
  webhook,
}: WebhookTestDialogProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setIsTesting(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/integrations/webhooks/${webhook.id}/test`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      logger.error("[WebhookTest] Failed:", { error });
      setResult({
        success: false,
        error: "Failed to run test. Please try again.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (isTesting) return <Clock className="h-12 w-12 text-blue-500" />;
    if (!result) return null;
    if (result.success)
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    return <XCircle className="h-12 w-12 text-red-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Test Webhook Endpoint</DialogTitle>
          <DialogDescription>
            Send a test event to verify your endpoint is working correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-3 rounded-md mb-4">
            <p className="text-sm font-medium">Endpoint URL:</p>
            <p className="text-sm text-muted-foreground truncate">{webhook.url}</p>
          </div>

          {!result && !isTesting && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Click the button below to send a test event to your webhook
                endpoint.
              </p>
              <Button onClick={runTest}>Send Test Event</Button>
            </div>
          )}

          {isTesting && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Sending test event...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">
                    {result.success ? "Test Successful" : "Test Failed"}
                  </p>
                  {result.responseTime && (
                    <p className="text-sm text-muted-foreground">
                      Response time: {result.responseTime}ms
                    </p>
                  )}
                </div>
              </div>

              {result.statusCode && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">HTTP Status:</p>
                  <p
                    className={`text-lg font-mono ${
                      result.statusCode >= 200 && result.statusCode < 300
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.statusCode}
                  </p>
                </div>
              )}

              {result.responseBody && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Response Body:</p>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                    {result.responseBody}
                  </pre>
                </div>
              )}

              {result.error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-sm font-medium text-red-800">Error:</p>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Expected Response:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-1">
                  <li>HTTP 200 OK status</li>
                  <li>Response within 30 seconds</li>
                  <li>Valid JSON or plain text response</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {result && (
            <Button onClick={runTest} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Again"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
