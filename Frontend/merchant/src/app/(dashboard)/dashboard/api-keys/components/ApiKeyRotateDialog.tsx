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
import { logger } from "@/lib/logger";
import { Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyRotateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  apiKey: {
    id: string;
    name: string;
    keyPrefix: string;
  } | null;
}

export function ApiKeyRotateDialog({
  open,
  onOpenChange,
  onSuccess,
  apiKey,
}: ApiKeyRotateDialogProps) {
  const [gracePeriodDays, setGracePeriodDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [rotationResult, setRotationResult] = useState<{
    newKey: { id: string; key: string; prefix: string };
    oldKeyExpiry: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRotate = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/api-keys/${apiKey.id}/rotate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gracePeriodDays }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRotationResult(data);
        onSuccess();
      }
    } catch (error) {
      logger.error("[ApiKeyRotate] Failed to rotate:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGracePeriodDays(30);
    setRotationResult(null);
    onOpenChange(false);
  };

  const copyKey = () => {
    if (rotationResult?.newKey.key) {
      navigator.clipboard.writeText(rotationResult.newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (rotationResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Key Rotated!</DialogTitle>
            <DialogDescription>
              Your API key has been rotated successfully. The old key will remain
              active until the grace period expires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Update your integrations with the new key immediately. The old
                key expires on{" "}
                {new Date(rotationResult.oldKeyExpiry).toLocaleDateString()}.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>New API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={rotationResult.newKey.key}
                  readOnly
                  type="password"
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded-md text-sm space-y-2">
              <p className="font-medium">Rotation Summary:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>New key created and active immediately</li>
                <li>
                  Old key expires:{" "}
                  {new Date(rotationResult.oldKeyExpiry).toLocaleDateString()}
                </li>
                <li>Both keys work during the grace period</li>
              </ul>
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rotate API Key</DialogTitle>
          <DialogDescription>
            Rotate &quot;{apiKey?.name}" to generate a new key. The old key will
            remain active during a grace period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Rotating this key will create a new one with the same permissions.
              Make sure to update your integrations before the grace period
              expires.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-sm font-medium">Key to Rotate:</p>
            <p className="text-sm text-gray-500">{apiKey?.name}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {apiKey?.keyPrefix}••••••••••••••••
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
            <Input
              id="gracePeriod"
              type="number"
              min={1}
              max={90}
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500">
              Number of days the old key will remain active. Default: 30 days.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRotate}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rotating...
              </>
            ) : (
              "Rotate Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
