"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@vayva/ui";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

type RiskLevel = "high" | "critical" | "ultra";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
  riskLevel?: RiskLevel;
  actionDetails?: {
    type: string;
    target: string;
    impact?: string;
  };
  requireTypedConfirmation?: boolean;
  confirmationText?: string;
}

const riskConfig = {
  high: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    buttonVariant: "bg-amber-500 hover:bg-amber-600" as const,
    minReasonLength: 10,
  },
  critical: {
    icon: ShieldAlert,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    buttonVariant: "bg-orange-500 hover:bg-orange-600" as const,
    minReasonLength: 20,
  },
  ultra: {
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    buttonVariant: "bg-red-500 hover:bg-red-600" as const,
    minReasonLength: 30,
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  placeholder = "Please provide a detailed reason for this action...",
  riskLevel = "high",
  actionDetails,
  requireTypedConfirmation = false,
  confirmationText = "CONFIRM",
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState("");
  const [typedConfirmation, setTypedConfirmation] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setTypedConfirmation("");
      setShowDetails(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (reason.trim().length < config.minReasonLength) return;
    if (requireTypedConfirmation && typedConfirmation !== confirmationText) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error: unknown) {
      console.error("Failed to confirm action", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    reason.trim().length >= config.minReasonLength &&
    (!requireTypedConfirmation || typedConfirmation === confirmationText);

  return (
    <Dialog open={isOpen} onOpenChange={(open: any) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Action Details */}
        {actionDetails && (
          <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Action Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 text-xs"
              >
                {showDetails ? "Hide" : "Show"}
              </Button>
            </div>
            {showDetails && (
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{actionDetails.type}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Target:</span>{" "}
                  <span className="font-medium">{actionDetails.target}</span>
                </p>
                {actionDetails.impact && (
                  <p>
                    <span className="text-muted-foreground">Impact:</span>{" "}
                    <span className="font-medium text-red-500">{actionDetails.impact}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Reason for Action
              <span className="text-muted-foreground text-xs ml-1">
                (minimum {config.minReasonLength} characters)
              </span>
            </label>
            <Textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              placeholder={placeholder}
              className="min-h-[100px] bg-slate-50/50 border-slate-200"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {reason.trim().length < config.minReasonLength ? (
                <span className="text-amber-500">
                  Need {config.minReasonLength - reason.trim().length} more characters
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Reason is sufficient
                </span>
              )}
            </p>
          </div>

          {/* Typed Confirmation for Ultra High Risk */}
          {requireTypedConfirmation && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Type "{confirmationText}" to confirm
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e: any) => setTypedConfirmation(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm uppercase font-mono tracking-wider"
                placeholder={confirmationText}
              />
            </div>
          )}

          <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3`}>
            <p className="text-xs text-muted-foreground">
              <span className={`font-semibold ${config.color}`}>⚠️ Security Notice:</span>{" "}
              This action will be permanently logged in the audit trail with your identity,
              timestamp, and reason. All high-risk actions require justification and may be
              reviewed by compliance.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className={`${config.buttonVariant} text-white`}
          >
            {isSubmitting ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
