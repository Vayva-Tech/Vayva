"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Spinner as Loader2,
  ArrowSquareOut as ExternalLink
} from "@phosphor-icons/react/ssr";
import Image from "next/image";

interface TemplatePreviewModalProps {
  template: {
    id: string;
    name: string;
    description: string;
    previewImageUrl?: string;
    previewUrl?: string;
    requiredPlan?: string;
  } | null;
  pricing: {
    amount: number;
    amountFormatted: string;
    requiresPayment: boolean;
    reason: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function TemplatePreviewModal({
  template,
  pricing,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: TemplatePreviewModalProps) {
  if (!template || !pricing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.name}</span>
            {pricing.requiresPayment && (
              <Badge className="bg-amber-500 text-white">
                {pricing.amountFormatted}
              </Badge>
            )}
            {!pricing.requiresPayment &&
              pricing.reason === "first_selection" && (
                <Badge className="bg-green-500 text-white">Free</Badge>
              )}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Image */}
          <AspectRatio
            ratio={16 / 9}
            className="bg-white/40 rounded-lg overflow-hidden"
          >
            {template.previewImageUrl ? (
              <Image
                src={template.previewImageUrl}
                alt={template.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                No Preview Available
              </div>
            )}
          </AspectRatio>

          {/* Live Preview Link */}
          {template.previewUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(template.previewUrl, "_blank")}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Preview
            </Button>
          )}

          {/* Pricing Info */}
          <div className="bg-white/40 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Pricing Details</h4>
            {pricing.requiresPayment ? (
              <>
                <p className="text-sm text-text-secondary">
                  Switching to this template will cost{" "}
                  <strong>{pricing.amountFormatted}</strong>.
                </p>
                {pricing.reason === "upgrade" && (
                  <p className="text-sm text-amber-600">
                    This is a Pro tier template. Growth users pay ₦10,000 to
                    access Pro templates.
                  </p>
                )}
                <p className="text-xs text-text-tertiary mt-2">
                  No refunds available after payment.
                </p>
              </>
            ) : (
              <p className="text-sm text-green-600">
                {pricing.reason === "first_selection"
                  ? "Your first template selection is free!"
                  : "No charge for this template."}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {pricing.requiresPayment
                ? "Proceed to Payment"
                : "Apply Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
