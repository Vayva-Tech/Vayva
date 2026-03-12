import { prisma, PolicyType, MerchantPolicy } from "@vayva/db";

type StoreCompliance = {
  logoUrl: string | null;
  socialImage: string | null;
  name: string;
  seoDescription: string | null;
};

export interface ComplianceReport {
  storeId: string;
  isValid: boolean;
  checks: {
    legalPolicies: boolean;
    productReadiness: boolean;
    brandingReadiness: boolean;
    contentModeration: boolean;
  };
  details: {
    missingPolicies: string[];
    issueCount: number;
    prohibitedWordsFound: string[];
    productCount: number;
  };
}

const PROHIBITED_KEYWORDS = [
  "scam",
  "fraud",
  "illegal",
  "drug",
  "weapon",
  "explicit",
  "counterfeit",
];

export async function validateStoreCompliance(
  storeId: string,
): Promise<ComplianceReport> {
  const [store, products, policies] = await Promise.all([
    prisma.store.findUnique({
      where: { id: storeId },
      select: {
        logoUrl: true,
        socialImage: true,
        name: true,
        seoDescription: true,
      }, // Updated fields
    }),
    prisma.product.count({
      where: { storeId, status: "ACTIVE" },
    }),
    prisma.merchantPolicy.findMany({
      where: { storeId },
    }),
  ]);

  if (!store) {
    throw new Error("Store not found");
  }

  const typedStore = store as StoreCompliance;

  // 1. Legal Policies
  const publishedPolicyTypes = policies
    .filter((p: MerchantPolicy) => p.status === "PUBLISHED")
    .map((p: MerchantPolicy) => p.type);
  const requiredPolicies: PolicyType[] = [
    PolicyType.PRIVACY,
    PolicyType.TERMS,
    PolicyType.RETURNS,
    PolicyType.REFUNDS,
    PolicyType.SHIPPING_DELIVERY,
  ];
  const missingPolicies = requiredPolicies.filter(
    (type) => !publishedPolicyTypes.includes(type),
  );
  const legalPolicies = missingPolicies.length === 0;

  // 2. Product Readiness
  const productReadiness = products > 0;

  // 3. Branding Readiness
  // Note: Schema uses 'socialImage' as closest proxy for banner currently? Or it's missing. Using socialImage for now.
  const brandingReadiness = !!(typedStore.logoUrl && typedStore.socialImage);

  // 4. Content Moderation
  const textToScan =
    `${typedStore.name} ${typedStore.seoDescription || ""}`.toLowerCase();
  const prohibitedWordsFound = PROHIBITED_KEYWORDS.filter((word) =>
    textToScan.includes(word),
  );
  const contentModeration = prohibitedWordsFound.length === 0;

  const isValid = legalPolicies && productReadiness && contentModeration;

  return {
    storeId,
    isValid,
    checks: {
      legalPolicies,
      productReadiness,
      brandingReadiness,
      contentModeration,
    },
    details: {
      missingPolicies,
      issueCount:
        missingPolicies.length +
        prohibitedWordsFound.length +
        (productReadiness ? 0 : 1),
      prohibitedWordsFound,
      productCount: products,
    },
  };
}
