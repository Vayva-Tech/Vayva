import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import { generatePolicyFromTemplate, sanitizeMarkdown, validatePolicyContent } from "@vayva/policies";
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

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/merchant/policies/publish-defaults',
      operation: 'POST_PUBLISH_DEFAULTS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
