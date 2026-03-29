import { logger } from "@vayva/shared";
import { useState } from "react";
import { CartItem } from "./useCart";
import { toast } from "sonner";

export type CheckoutMode = "whatsapp" | "website";

interface UseCheckoutOptions {
  merchantPhone?: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface CheckoutResponse {
  checkoutUrl?: string;
}

export const useCheckout = (options: UseCheckoutOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateWhatsAppMessage = (cart: CartItem[], total: number) => {
    let message = `*New Order Request*\n\n`;
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.name}`;
      if (item.options && Object.keys(item.options).length > 0) {
        const opts = Object.values(item.options).join(", ");
        message += ` (${opts})`;
      }
      message += ` - ₦${(item.price * item.quantity).toLocaleString()}\n`;
    });
    message += `\n*Total: ₦${total.toLocaleString()}*\n\n`;
    message += `I would like to pay for this order. Please confirm availability.`;
    return encodeURIComponent(message);
  };

  const checkout = async (
    mode: CheckoutMode,
    cart: CartItem[],
    total: number,
  ) => {
    setIsProcessing(true);
    try {
      if (mode === "whatsapp") {
        if (!options.merchantPhone) {
          throw new Error("Merchant phone number is missing");
        }
        const message = generateWhatsAppMessage(cart, total);
        // Clean phone number (remove +, spaces)
        const phone = options.merchantPhone.replace(/[^0-9]/g, "");
        // Simulate network delay for UX
        await new Promise((resolve) => setTimeout(resolve, 800));
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
      } else if (mode === "website") {
        // Real API Flow (Phase 3 Wiring)
        // In live mode, this must hit /api/checkout/initialize
        try {
          const data = await apiJson<CheckoutResponse>(
            "/checkout/initialize",
            {
              method: "POST",
              body: JSON.stringify({ items: cart, total, method: "paystack" }),
            },
          );

          if (data?.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            // Test success fallback if API returns tested success (for now)
            toast.message(
              `Calculated Checkout: ₦${total.toLocaleString()} (Redirecting to Paystack...)`,
            );
          }
        } catch (apiError) {
          const _errMsg =
            apiError instanceof Error ? apiError.message : String(apiError);
          logger.error("[CHECKOUT_API_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
          toast.error(_errMsg || "Failed to create checkout");
        }
      }
    } catch (e) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[CHECKOUT_FAILED]", { error: _errMsg, app: "merchant" });
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    checkout,
  };
};
