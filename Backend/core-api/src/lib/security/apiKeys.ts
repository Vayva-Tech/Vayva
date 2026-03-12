import { prisma } from "@/lib/db";
import { randomBytes, createHash } from "crypto";
import { Prisma } from "@vayva/db";

export type ApiKeyScope = string;

const KEY_PREFIX = "vayva_live_";
const KEY_LENGTH_BYTES = 16;

function generateVayvaApiKey() {
  const keyBody = randomBytes(KEY_LENGTH_BYTES).toString("hex");
  const key = `${KEY_PREFIX}${keyBody}`;
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, hash };
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
  ): Promise<{ id: string; key: string }> {
    const { key, hash } = generateVayvaApiKey();

    const created = await prisma.apiKey.create({
      data: {
        storeId,
        name,
        scopes,
        status: "ACTIVE",
        keyHash: hash,
        createdByUserId,
      } as Prisma.ApiKeyCreateInput,
      select: {
        id: true,
      },
    });

    return { id: created.id, key };
  },

  async verifyApiKey(rawKey: string, ip?: string) {
    const keyHash = hashVayvaApiKey(rawKey);

    const record = await prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!record) {
      throw new Error("API Key not found");
    }

    if (String(record.status).toUpperCase() !== "ACTIVE") {
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

  async revokeKey(storeId: string, id: string) {
    await prisma.apiKey.updateMany({
      where: { id, storeId },
      data: { status: "REVOKED" },
    });
  },
};
