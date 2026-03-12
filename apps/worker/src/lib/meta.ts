import axios from "axios";
import { logger } from "@vayva/shared";

export interface SendMessageOptions {
    recipient: string;
    type: "text" | "template";
    body?: string; // For text messages
    templateName?: string; // For templates
    language?: string;
    components?: unknown[];
}

export class MetaProvider {
    private apiToken: string;
    private phoneNumberId: string;
    private version: string;

    constructor() {
        this.apiToken = process.env.WHATSAPP_API_TOKEN || "";
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
        this.version = "v18.0";
    }

    async sendMessage(options: SendMessageOptions) {
        if (!this.apiToken || !this.phoneNumberId) {
            throw new Error(
                "WhatsApp MetaProvider: Missing required credentials. " +
                "Ensure WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables are set."
            );
        }

        const url = `https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`;

        const payload: Record<string, unknown> = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: options.recipient,
            type: options.type,
        };

        if (options.type === "text") {
            payload.text = { body: options.body };
        } else if (options.type === "template") {
            payload.template = {
                name: options.templateName,
                language: { code: options.language || "en_US" },
                components: options.components || [],
            };
        }

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                    "Content-Type": "application/json",
                },
            });
            return {
                providerMessageId: response.data.messages[0].id,
            };
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message: string };
            logger.error("[MetaProvider] Send failed", {
                error: err.response?.data || err.message,
                app: "worker"
            });
            throw new Error("Failed to send WhatsApp message");
        }
    }
}
