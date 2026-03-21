import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import type { ApiKey, Prisma } from "@vayva/db";

export type ApiKeyScope = string;

const KEY_PREFIX = "vayva_live_";
const KEY_LENGTH_BYTES = 16;

function generateVayvaApiKey() {
    const keyBody = randomBytes(KEY_LENGTH_BYTES).toString("hex");
    const key = `${KEY_PREFIX}${keyBody}`;
    const hash = createHash("sha256").update(key).digest("hex");
    const last4 = key.slice(-4);
    return { key, hash, last4 };
}

function hashVayvaApiKey(rawKey: string) {
    return createHash("sha256").update(rawKey).digest("hex");
}

export const ApiKeyService = {
    hashKey(rawKey: string) {
        return hashVayvaApiKey(rawKey);
    },

    async createKey(
        storeId: string,
        name: string,
        scopes: ApiKeyScope[],
        createdByUserId: string,
    ): Promise<{ id: string; key: string; last4: string }> {
        const { key, hash, last4 } = generateVayvaApiKey();

        const created = await prisma.apiKey?.create({
            data: {
                storeId,
                name,
                scopes,
                status: "ACTIVE",
                keyHash: hash,
                createdByUserId,
                // Store last4 in metadata for masking (schema doesn't have dedicated field yet)
                metadata: { last4 },
            } as Prisma.ApiKeyCreateInput,
            select: {
                id: true,
            },
        });

        return { id: created.id, key, last4 };
    },

    async verifyApiKey(rawKey: string, ip?: string): Promise<ApiKey | null> {
        const keyHash = hashVayvaApiKey(rawKey);

        const record = await prisma.apiKey?.findUnique({
            where: { keyHash },
        });

        if (!record) {
            throw new Error("API Key not found");
        }

        if (String((record as any).status).toUpperCase() !== "ACTIVE") {
            throw new Error("API Key is not active");
        }

        if (record.expiresAt && new Date() > record.expiresAt) {
            throw new Error("API Key has expired");
        }

        const allowlist: string[] = Array.isArray(record.ipAllowlist)
            ? (record.ipAllowlist as string[])
            : [];

        if (ip && allowlist.length > 0 && !allowlist.includes(ip)) {
            throw new Error(`IP ${ip} is not allowed`);
        }

        return record;
    },

    /**
     * Mask an API key for display, showing only the last 4 characters
     * Format: vayva_live_...a1b2
     */
    maskKey(keyOrLast4: string): string {
        const last4 = keyOrLast4.length > 4 ? keyOrLast4.slice(-4) : keyOrLast4;
        return `vayva_live_...${last4}`;
    },

    /**
     * Mask a key from metadata (for listing API keys)
     */
    maskKeyFromMetadata(metadata: unknown): string {
        if (typeof metadata === "object" && metadata !== null) {
            const last4 = (metadata as Record<string, string>).last4;
            if (last4) return `vayva_live_...${last4}`;
        }
        return "vayva_live_...••••";
    },

    async revokeKey(storeId: string, id: string) {
        await prisma.apiKey?.updateMany({
            where: { id, storeId },
            data: { status: "REVOKED" },
        });
    },

    async getKeys(storeId: string) {
        const keys = await prisma.apiKey?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });
        return keys.map((key: ApiKey & { metadata?: unknown }) => ({
            ...key,
            maskedKey: this.maskKeyFromMetadata(key.metadata),
        }));
    },
};
