"use client";

import { useState } from "react";
import { Button } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { type TemplateGalleryItem } from "@/template-gallery";
import { 
  X, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Monitor,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplatePurchaseModalProps {
  template: TemplateGalleryItem;
  userPlan: "starter" | "pro";
  currentTemplateId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplatePurchaseModal({
  template,
  userPlan,
  currentTemplateId,
  onClose,
  onSuccess,
}: TemplatePurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const swapPrice = userPlan === "starter" ? 10000 : 5000;
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(swapPrice);

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const result = await apiJson<{
        success: boolean;
        authorization_url?: string;
        reference?: string;
        error?: string;
      }>("/api/billing/template-purchase", {
        method: "POST",
        body: JSON.stringify({
          templateId: template.id,
          amount: swapPrice * 100, // Convert to kobo
        }),
      });

      if (result.success && result.authorization_url) {
        // Redirect to Paystack
        window.location.href = result.authorization_url;
      } else {
        toast.error(result.error || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error("Failed to process purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Purchase Template</h2>
            <p className="text-text-secondary text-sm">
              Add this template to your collection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Preview Section */}
          <div className="p-6 bg-surface-2 border-r">
            <div className="flex justify-center mb-4">
              <div className="flex bg-background p-1 rounded-lg">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    previewMode === "desktop"
                      ? "bg-surface-2 shadow-sm"
                      : "text-text-secondary"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    previewMode === "mobile"
                      ? "bg-surface-2 shadow-sm"
                      : "text-text-secondary"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>

            <div
              className={cn(
                "mx-auto bg-background rounded-lg overflow-hidden shadow-lg transition-all duration-300",
                previewMode === "desktop" ? "w-full aspect-[16/10]" : "w-[280px] aspect-[9/16]"
              )}
            >
              <img
                src={previewMode === "desktop" ? template.preview.desktopUrl : template.preview.mobileUrl}
                alt={template.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{template.displayName}</h3>
              <p className="text-text-secondary">{template.compare.headline}</p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text-secondary uppercase tracking-wide">
                Key Features
              </h4>
              <ul className="space-y-2">
                {template.compare.bullets.slice(0, 3).map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text-secondary uppercase tracking-wide">
                Best For
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.compare.bestFor.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-surface-2 rounded-full text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Template Warning */}
            {currentTemplateId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Template Swap
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You already have a template. Purchasing this will add it to your collection. 
                    You can switch between templates anytime.
                  </p>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-surface-2 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Template Price</span>
                <span className="text-2xl font-bold">{formattedPrice}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <CreditCard className="w-3 h-3" />
                <span>Secure payment via Paystack</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full h-12 text-base font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formattedPrice}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-text-tertiary text-center">
              By purchasing, you agree to our Terms of Service. 
              Payments are processed securely by Paystack.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
