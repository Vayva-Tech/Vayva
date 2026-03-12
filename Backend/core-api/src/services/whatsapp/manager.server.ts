// Wrapper for Evolution API (Self-Hosted WhatsApp Gateway)
const EVOLUTION_API_URL =
  process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

import { logger } from "@vayva/shared";

// Validate configuration on load
if (!EVOLUTION_API_KEY) {
  logger.warn("[WhatsApp] EVOLUTION_API_KEY not set - WhatsApp features will fail");
}

export class WhatsappManager {
  static async createInstance(instanceName: string) {
    try {
      const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          instanceName,
          token: instanceName, // Simplification
          qrcode: true,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to create WhatsApp instance", {
        error: message,
        stack,
        instanceName,
        app: "merchant",
      });
      throw error;
    }
  }
  static async connectInstance(instanceName: string) {
    try {
      // In Evolution API, connect usually fetches QR
      const res = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
        {
          method: "GET",
          headers: { apikey: EVOLUTION_API_KEY },
        },
      );
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorData = data as Record<string, unknown>;
        throw new Error(
          String(errorData?.message || "Failed to connect instance"),
        );
      }
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to connect WhatsApp instance", {
        error: message,
        stack,
        instanceName,
        app: "merchant",
      });
      throw error;
    }
  }
  static async sendMessage(instanceName: string, phone: string, text: string) {
    try {
      // Standardize phone (remove +, ensure 234)
      const cleanPhone = phone.replace(/\D/g, "");
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
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorData = data as Record<string, unknown>;
        throw new Error(
          String(
            errorData?.message || "Failed to send message: " + res.statusText,
          ),
        );
      }
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error(`Failed to send WA message to ${phone}`, {
        error: message,
        stack,
        instanceName,
        phone,
        app: "merchant",
      });
      throw error;
    }
  }

  static async getPairingCode(instanceName: string, phoneNumber: string) {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const res = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}/phonenumber`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            phoneNumber: cleanPhone,
          }),
        },
      );
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorData = data as Record<string, unknown>;
        throw new Error(
          String(
            errorData?.message ||
              "Failed to get pairing code: " + res.statusText,
          ),
        );
      }

      // Expected response: { pairingCode: "ABCD-1234", ... }
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to get pairing code", {
        error: message,
        stack,
        instanceName,
        app: "merchant",
      });
      throw error;
    }
  }

  static async getBase64FromMediaMessage(
    instanceName: string,
    messageKey: Record<string, unknown>,
  ) {
    const res = await fetch(
      `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          message: {
            key: {
              id: messageKey?.id,
              remoteJid: messageKey?.remoteJid,
              fromMe: Boolean(messageKey?.fromMe),
              participant: messageKey?.participant,
            },
          },
        }),
      },
    );
    const data = await res
      .json()
      .catch(async () => ({ raw: await res.text() }));
    if (!res.ok) {
      throw new Error(
        ((data as Record<string, unknown>)?.error as string) ||
          ((data as Record<string, unknown>)?.message as string) ||
          "Failed to fetch base64 media",
      );
    }
    return data;
  }

  static async getMediaDataUrlFromMessage(
    instanceName: string,
    messageKey: Record<string, unknown>,
    fallbackMimeType?: string,
  ) {
    const data = (await this.getBase64FromMediaMessage(
      instanceName,
      messageKey,
    )) as Record<string, unknown> & {
      base64?: string;
      media?: { base64?: string };
      message?: { base64?: string };
      data?: string;
      mimetype?: string;
      mimeType?: string;
    };
    const base64 = String(
      data?.base64 ||
        data?.media?.base64 ||
        data?.message?.base64 ||
        data?.data ||
        "",
    );
    const mimeType = String(
      data?.mimetype ||
        data?.mimeType ||
        fallbackMimeType ||
        "application/octet-stream",
    );
    if (!base64) {
      throw new Error("No base64 returned by Evolution");
    }
    const cleaned = base64.includes(",") ? base64.split(",").pop() : base64;
    return `data:${mimeType};base64,${cleaned}`;
  }
}
