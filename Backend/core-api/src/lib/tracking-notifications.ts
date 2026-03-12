import { logger } from "@vayva/shared";
import { prisma } from "@/lib/db";

// Evolution API configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "global-api-key";
const VAYVA_OFFICIAL_INSTANCE = process.env.VAYVA_OFFICIAL_WHATSAPP_INSTANCE || "vayva-official";

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.startsWith("0")) {
    return `234${cleaned.substring(1)}`;
  }
  
  if (cleaned.startsWith("+")) {
    return cleaned.substring(1);
  }
  
  if (cleaned.startsWith("234")) {
    return cleaned;
  }
  
  return `234${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^234[0-9]{10}$/.test(cleaned) || /^0[0-9]{10}$/.test(cleaned);
}

/**
 * Send WhatsApp message via Evolution API
 */
async function sendEvolutionMessage(
  instanceName: string,
  phone: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const res = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: "composing" },
          text,
        }),
      },
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to send message: ${res.statusText} - ${errorText}`);
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send WhatsApp message";
    return { success: false, error: errorMessage };
  }
}

interface SendTrackingNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send delivery tracking notification via WhatsApp
 */
export async function sendTrackingNotification(
  phoneNumber: string,
  trackingCode: string,
  storeName: string,
  storefrontUrl?: string,
): Promise<SendTrackingNotificationResult> {
  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: "Invalid phone number format. Please use a valid Nigerian phone number.",
      };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Check if Evolution API is configured
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    if (!evolutionUrl) {
      logger.warn("[TrackingNotification] Evolution API not configured, logging for dev mode", {
        phone: formattedPhone,
        trackingCode,
      });
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
      };
    }

    // Generate tracking URL
    const trackingUrl = storefrontUrl 
      ? `${storefrontUrl}/tracking?code=${encodeURIComponent(trackingCode)}`
      : `https://vayva.co/tracking?code=${encodeURIComponent(trackingCode)}`;

    // Build tracking notification message
    const message = `🚚 *Your Delivery is on the way!*\n\n` +
      `Hi from ${storeName}!\n\n` +
      `Your order has been dispatched and is being delivered. ` +
      `Track your delivery in real-time using the link below:\n\n` +
      `*Tracking Code:* ${trackingCode}\n` +
      `*Track Here:* ${trackingUrl}\n\n` +
      `You'll receive updates as your delivery progresses. ` +
      `Thank you for shopping with us!\n\n` +
      `_Powered by Vayva_`;

    // Send via Evolution API
    const result = await sendEvolutionMessage(
      VAYVA_OFFICIAL_INSTANCE,
      formattedPhone,
      message,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send tracking notification",
      };
    }

    logger.info("[TrackingNotification] WhatsApp notification sent successfully", {
      phone: formattedPhone.replace(/\d(?=\d{4})/g, "*"),
      trackingCode,
      storeName,
    });

    return {
      success: true,
      messageId: `tracking_${Date.now()}_${formattedPhone}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send tracking notification";
    logger.error("[TrackingNotification] Failed to send WhatsApp notification", { 
      error: errorMessage,
      phoneNumber: phoneNumber?.replace(/\d(?=\d{4})/g, "*"),
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send delivery status update notification via WhatsApp
 */
export async function sendDeliveryStatusUpdate(
  phoneNumber: string,
  trackingCode: string,
  status: string,
  storeName: string,
  storefrontUrl?: string,
): Promise<SendTrackingNotificationResult> {
  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: "Invalid phone number format",
      };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Check if Evolution API is configured
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    if (!evolutionUrl) {
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
      };
    }

    // Map status to customer-friendly message
    const statusMessages: Record<string, string> = {
      ACCEPTED: "Your delivery has been accepted by the driver and they are heading to pick up your order.",
      PICKED_UP: "Great news! Your order has been picked up and is now on its way to you.",
      IN_TRANSIT: "Your order is currently in transit and will arrive soon.",
      DELIVERED: "Your order has been delivered! We hope you enjoy your purchase.",
      FAILED: "There was an issue with your delivery. Please contact the store for assistance.",
      CANCELED: "Your delivery has been canceled. Please contact the store for more information.",
    };

    const statusMessage = statusMessages[status] || `Your delivery status has been updated to: ${status}`;

    // Generate tracking URL
    const trackingUrl = storefrontUrl 
      ? `${storefrontUrl}/tracking?code=${encodeURIComponent(trackingCode)}`
      : `https://vayva.co/tracking?code=${encodeURIComponent(trackingCode)}`;

    // Build status update message
    const message = `📦 *Delivery Update*\n\n` +
      `Hi from ${storeName}!\n\n` +
      `${statusMessage}\n\n` +
      `*Tracking Code:* ${trackingCode}\n` +
      `*Current Status:* ${status}\n\n` +
      `Track your delivery: ${trackingUrl}\n\n` +
      `Thank you for your patience!`;

    // Send via Evolution API
    const result = await sendEvolutionMessage(
      VAYVA_OFFICIAL_INSTANCE,
      formattedPhone,
      message,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send status update",
      };
    }

    logger.info("[TrackingNotification] Status update sent successfully", {
      phone: formattedPhone.replace(/\d(?=\d{4})/g, "*"),
      trackingCode,
      status,
    });

    return {
      success: true,
      messageId: `status_${Date.now()}_${formattedPhone}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send status update";
    logger.error("[TrackingNotification] Failed to send status update", { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Record notification in database for tracking
 */
export async function recordTrackingNotification(
  shipmentId: string,
  phoneNumber: string,
  type: "INITIAL" | "STATUS_UPDATE",
  status: string,
  messageId?: string,
): Promise<void> {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { storeId: true },
    });

    if (!shipment) return;

    await prisma.trackingEvent.create({
      data: {
        storeId: shipment.storeId,
        shipmentId,
        status: "PENDING",
        description: `WhatsApp notification (${type}) sent`,
        locationText: phoneNumber.replace(/\d(?=\d{4})/g, "*"),
        raw: {
          notificationType: type,
          deliveryStatus: status,
          messageId,
          channel: "WHATSAPP",
        },
      },
    });
  } catch (error) {
    logger.error("[TrackingNotification] Failed to record notification", { error });
  }
}
