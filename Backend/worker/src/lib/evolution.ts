import { logger } from "@vayva/shared";

export interface EvolutionSendTextOptions {
  instanceName: string;
  to: string;
  body: string;
}

export class EvolutionProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || "http://127.0.0.1:8080";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
  }

  async sendText(
    options: EvolutionSendTextOptions,
  ): Promise<{ providerMessageId?: string }> {
    if (!this.apiKey) {
      throw new Error("EVOLUTION_API_KEY is not set");
    }

    const cleanPhone = String(options.to).replace(/\D/g, "");

    const res = await fetch(
      `${this.apiUrl}/message/sendText/${options.instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: "composing" },
          text: options.body,
        }),
      },
    );

    const data: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as Record<string, unknown>).message)
          : `Evolution sendText failed (${res.status} ${res.statusText})`;

      logger.error("[EvolutionProvider] Send failed", {
        error: errMsg,
        status: res.status,
        app: "worker",
      });

      throw new Error(errMsg);
    }

    // Evolution responses vary by version. Best-effort extraction.
    const providerMessageId =
      typeof data === "object" &&
      data !== null &&
      "key" in data &&
      typeof (data as Record<string, unknown>).key === "object" &&
      (data as Record<string, unknown>).key !== null &&
      "id" in ((data as Record<string, unknown>).key as Record<string, unknown>)
        ? String(
            ((data as Record<string, unknown>).key as Record<string, unknown>).id,
          )
        : undefined;

    return { providerMessageId };
  }
}
