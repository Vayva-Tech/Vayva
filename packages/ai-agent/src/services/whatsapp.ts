// Wrapper for Evolution API (Self-Hosted WhatsApp Gateway)
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "global-api-key";

type EvolutionMessageKey = {
    id?: string;
    remoteJid?: string;
    fromMe?: boolean;
    participant?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getNestedString(value: unknown, path: string[]): string | undefined {
    let cur: unknown = value;
    for (const key of path) {
        if (!isRecord(cur) || !(key in cur)) return undefined;
        cur = cur[key];
    }
    return typeof cur === "string" ? cur : undefined;
}

export class WhatsappManager {
    static async createInstance(instanceName: string): Promise<unknown> {
        try {
            const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    instanceName,
                    token: instanceName, // Simplification
                    qrcode: true
                })
            });
            return await res.json();
        }
        catch (error: unknown) {
            console.error("Failed to create WhatsApp instance:", error);
            throw error;
        }
    }
    static async connectInstance(instanceName: string): Promise<unknown> {
        try {
            // In Evolution API, connect usually fetches QR
            const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
                method: "GET",
                headers: { "apikey": EVOLUTION_API_KEY }
            });
            if (!res.ok)
                throw new Error("Failed to connect instance");
            return await res.json();
        }
        catch (error: unknown) {
            console.error("Failed to connect WhatsApp instance:", error);
            throw error;
        }
    }
    static async sendMessage(instanceName: string, phone: string, text: string): Promise<unknown> {
        try {
            // Standardize phone (remove +, ensure 234)
            const cleanPhone = String(phone).replace(/\D/g, "");
            const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    number: cleanPhone,
                    options: { delay: 1200, presence: "composing" },
                    textMessage: { text }
                })
            });
            if (!res.ok)
                throw new Error("Failed to send message: " + res.statusText);
            return await res.json();
        }
        catch (error: unknown) {
            console.error(`Failed to send WA message to ${phone}:`, error);
            throw error;
        }
    }

    static async getPairingCode(instanceName: string, phoneNumber: string): Promise<unknown> {
        try {
            const cleanPhone = phoneNumber.replace(/\D/g, "");
            const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}/phonenumber`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    phoneNumber: cleanPhone
                })
            });
            if (!res.ok)
                throw new Error("Failed to get pairing code: " + res.statusText);

            // Expected response: { pairingCode: "ABCD-1234", ... }
            return await res.json();
        }
        catch (error: unknown) {
            console.error("Failed to get pairing code:", error);
            throw error;
        }
    }

    static async getBase64FromMediaMessage(instanceName: string, messageKey: EvolutionMessageKey): Promise<unknown> {
        const res = await fetch(`${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
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
            })
        });
        const data: unknown = await res.json().catch(async () => ({ raw: await res.text() }));
        if (!res.ok) {
            const errMsg =
                getNestedString(data, ["error", "message"]) ||
                getNestedString(data, ["message"]) ||
                "Failed to fetch base64 media";
            throw new Error(errMsg);
        }
        return data;
    }

    static async getMediaDataUrlFromMessage(instanceName: string, messageKey: EvolutionMessageKey, fallbackMimeType?: string): Promise<string> {
        const data = await this.getBase64FromMediaMessage(instanceName, messageKey);
        const base64 =
            getNestedString(data, ["base64"]) ||
            getNestedString(data, ["media", "base64"]) ||
            getNestedString(data, ["message", "base64"]) ||
            getNestedString(data, ["data"]) ||
            "";
        const mimeType =
            getNestedString(data, ["mimetype"]) ||
            getNestedString(data, ["mimeType"]) ||
            fallbackMimeType ||
            "application/octet-stream";
        if (!base64 || typeof base64 !== "string") {
            throw new Error("No base64 returned by Evolution");
        }
        const cleaned = base64.includes(",") ? base64.split(",").pop() : base64;
        return `data:${mimeType};base64,${cleaned}`;
    }
}
