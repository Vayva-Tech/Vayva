import { logger } from "@vayva/shared";
import { prisma } from "@/lib/db";

/**
 * WhatsApp OTP Service
 * Sends OTP codes to users via WhatsApp using the official Vayva WhatsApp number
 * Official Number: +234 810 769 2393
 * Uses Evolution API for WhatsApp Business integration
 */

export type OTPMethod = "EMAIL" | "WHATSAPP";

interface SendOTPResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

// Evolution API instance name for Vayva official number
const VAYVA_OFFICIAL_INSTANCE = process.env.VAYVA_OFFICIAL_WHATSAPP_INSTANCE || "vayva-official";

// Evolution API configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "global-api-key";

/**
 * Send WhatsApp message via Evolution API
 */
async function sendEvolutionMessage(
  instanceName: string,
  phone: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Standardize phone (remove +, ensure 234)
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

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If starts with 0, replace with 234 (Nigeria)
  if (cleaned.startsWith("0")) {
    return `234${cleaned.substring(1)}`;
  }
  
  // If starts with +, remove the +
  if (cleaned.startsWith("+")) {
    return cleaned.substring(1);
  }
  
  // If already starts with country code (234), return as is
  if (cleaned.startsWith("234")) {
    return cleaned;
  }
  
  // Default: assume Nigerian number without leading 0
  return `234${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Nigerian numbers: 234 + 10 digits, or 0 + 10 digits
  return /^234[0-9]{10}$/.test(cleaned) || /^0[0-9]{10}$/.test(cleaned);
}

/**
 * Mask phone number for display (e.g., +234 810 *** 2393)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const formatted = formatPhoneNumber(phone);
  // Format: 2348012345678 -> +234 801 *** 5678
  return `+${formatted.slice(0, 3)} ${formatted.slice(3, 6)} *** ${formatted.slice(-4)}`;
}

/**
 * Send OTP via WhatsApp using Evolution API
 * Uses the official Vayva WhatsApp Business number: +234 810 769 2393
 */
export async function sendWhatsAppOTP(
  phoneNumber: string,
  code: string,
  firstName: string,
): Promise<SendOTPResult> {
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
      logger.warn("[WhatsAppOTP] Evolution API not configured, logging OTP for dev mode");
      // In development without Evolution API, just log and return success
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
      };
    }

    // Build OTP message
    const message = `Hello ${firstName || "there"}\n\nYour Vayva verification code is ${code}\n\nThis code will expire in 10 minutes\n\nIf you did not request this you can ignore this message\n\nTeam Vayva`;

    // Send via Evolution API using the official Vayva instance
    const result = await sendEvolutionMessage(
      VAYVA_OFFICIAL_INSTANCE,
      formattedPhone,
      message,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send WhatsApp OTP",
      };
    }

    logger.info("[WhatsAppOTP] OTP sent successfully via Evolution API", {
      phone: maskPhoneNumber(phoneNumber),
      instance: VAYVA_OFFICIAL_INSTANCE,
    });

    return {
      success: true,
      messageId: `whatsapp_${Date.now()}_${formattedPhone}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send WhatsApp OTP";
    logger.error("[WhatsAppOTP] Failed to send WhatsApp OTP", { message: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send OTP via the specified method
 */
export async function sendOTP(
  method: OTPMethod,
  identifier: string, // email or phone
  code: string,
  firstName: string,
): Promise<SendOTPResult> {
  if (method === "WHATSAPP") {
    return sendWhatsAppOTP(identifier, code, firstName);
  }
  
  // Email OTP is handled by ResendEmailService
  // This function is primarily for WhatsApp
  return {
    success: false,
    error: "Email OTP should be handled by ResendEmailService",
  };
}

/**
 * Create and store OTP in database
 */
export async function createOTP(
  identifier: string,
  method: OTPMethod,
): Promise<string> {
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

  // Invalidate any existing unused OTPs for this identifier
  await prisma.otpCode.updateMany({
    where: {
      identifier: identifier.toLowerCase(),
      type: method === "WHATSAPP" ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION",
      isUsed: false,
    },
    data: { isUsed: true },
  });

  // Create new OTP
  await prisma.otpCode.create({
    data: {
      identifier: identifier.toLowerCase(),
      code,
      type: method === "WHATSAPP" ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION",
      expiresAt,
    },
  });

  return code;
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  identifier: string,
  code: string,
  method: OTPMethod,
): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      identifier: identifier.toLowerCase(),
      type: method === "WHATSAPP" ? "PHONE_VERIFICATION" : "EMAIL_VERIFICATION",
      isUsed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return false;
  }

  if (new Date() > otpRecord.expiresAt) {
    return false;
  }

  if (otpRecord.code !== code) {
    return false;
  }

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return true;
}
