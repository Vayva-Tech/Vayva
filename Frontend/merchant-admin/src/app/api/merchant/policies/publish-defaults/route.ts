import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { generatePolicyFromTemplate, sanitizeMarkdown, validatePolicyContent } from "@vayva/policies";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type PolicyType = "TERMS" | "PRIVACY" | "RETURNS" | "REFUNDS" | "SHIPPING_DELIVERY";

type GeneratedType = "terms" | "privacy" | "returns" | "refunds" | "shipping_delivery";

const TYPE_MAP: Record<GeneratedType, PolicyType> = {
  terms: "TERMS",
  privacy: "PRIVACY",
  returns: "RETURNS",
  refunds: "REFUNDS",
  shipping_delivery: "SHIPPING_DELIVERY",
};

interface StoreSettings {
  supportEmail?: string;
  whatsappNumber?: string;
  [key: string]: unknown;
}

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (_req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true, slug: true, settings: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const settings = (store.settings as StoreSettings | null) ?? {};

      const generated = generatePolicyFromTemplate({
        storeName: store.name,
        storeSlug: store.slug || store.name.toLowerCase().replace(/\s+/g, "-"),
        supportEmail: settings.supportEmail,
        merchantSupportWhatsApp: settings.whatsappNumber,
      });

      const required: Array<GeneratedType> = [
        "terms",
        "privacy",
        "returns",
        "refunds",
        "shipping_delivery",
      ];

      const published: PolicyType[] = [];
      const skipped: PolicyType[] = [];

      for (const policy of generated) {
        const mappedType = TYPE_MAP[policy.type as GeneratedType];
        if (!mappedType) continue;
        if (!required.includes(policy.type as GeneratedType)) continue;

        const validation = validatePolicyContent(policy.contentMd);
        if (!validation.valid) {
          skipped.push(mappedType);
          continue;
        }

        const contentHtml = sanitizeMarkdown(policy.contentMd);

        await prisma.merchantPolicy.upsert({
          where: {
            storeId_type: {
              storeId,
              type: mappedType as any,
            },
          },
          create: {
            merchantId: storeId,
            storeId,
            storeSlug: store.slug || "",
            type: mappedType as any,
            title: policy.title,
            contentMd: policy.contentMd,
            contentHtml,
            status: "PUBLISHED" as any,
            publishedAt: new Date(),
            publishedVersion: 1,
          } as any,
          update: {
            title: policy.title,
            contentMd: policy.contentMd,
            contentHtml,
            status: "PUBLISHED" as any,
            publishedAt: new Date(),
            publishedVersion: { increment: 1 } as any,
          } as any,
        });

        published.push(mappedType);
      }

      return NextResponse.json({ success: true, published, skipped });
    } catch (error: unknown) {
      logger.error("[POLICY_PUBLISH_DEFAULTS] Failed", { storeId, error });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  },
);
