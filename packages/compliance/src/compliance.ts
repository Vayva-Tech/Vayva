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

export interface ConsentRecord {
  id: string;
  storeId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface StorageProvider {
  upload(data: Buffer | string, path: string): Promise<string>;
  getSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}

export interface WhatsAppNotifier {
  sendMessage(): Promise<unknown>;
}

export interface ConsentStatus {
  marketing: boolean;
  analytics: boolean;
  third_party: boolean;
  cookies: boolean;
  notifications: boolean;
  lastUpdated: Date;
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

/**
 * GDPR Automation Service
 * Handles consent management, data export, and deletion requests
 */
export class GdprAutomation {
  private storage: StorageProvider;
  private whatsapp: WhatsAppNotifier;

  constructor(storage: StorageProvider, whatsapp: WhatsAppNotifier) {
    this.storage = storage;
    this.whatsapp = whatsapp;
  }

  /**
   * Get current consent status for a store
   */
  async getConsentStatus(storeId: string): Promise<ConsentStatus> {
    const consents = await prisma.consentRecord.findMany({
      where: { storeId },
      orderBy: { timestamp: 'desc' },
    });

    const latestConsents: Record<string, boolean> = {};
    let lastUpdated: Date | null = null;

    for (const consent of consents) {
      if (!latestConsents[consent.consentType]) {
        latestConsents[consent.consentType] = consent.granted;
        if (!lastUpdated || consent.timestamp > lastUpdated) {
          lastUpdated = consent.timestamp;
        }
      }
    }

    return {
      marketing: latestConsents['marketing'] ?? false,
      analytics: latestConsents['analytics'] ?? false,
      third_party: latestConsents['third_party'] ?? false,
      cookies: latestConsents['cookies'] ?? false,
      notifications: latestConsents['notifications'] ?? false,
      lastUpdated: lastUpdated || new Date(),
    };
  }

  /**
   * Record or update consent
   */
  async recordConsent(
    storeId: string,
    consentType: string,
    granted: boolean,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<ConsentRecord> {
    const consent = await prisma.consentRecord.create({
      data: {
        storeId,
        consentType,
        granted,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });

    // Send WhatsApp notification for important consent changes
    if (['marketing', 'third_party'].includes(consentType)) {
      try {
        await this.whatsapp.sendMessage();
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    return consent;
  }

  /**
   * Export all data for a store (GDPR right to access)
   */
  async exportData(storeId: string): Promise<string> {
    const [store, products, customers, orders, consents] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findMany({ where: { storeId } }),
      prisma.customer.findMany({ where: { storeId } }),
      prisma.order.findMany({ where: { storeId } }),
      prisma.consentRecord.findMany({ where: { storeId } }),
    ]);

    const exportData = {
      store,
      products,
      customers,
      orders,
      consents,
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const exportPath = `exports/${storeId}/${new Date().toISOString()}.json`;
    
    return this.storage.upload(jsonString, exportPath);
  }

  /**
   * Delete all personal data for a store (GDPR right to be forgotten)
   */
  async deleteData(storeId: string): Promise<void> {
    // Anonymize customer data instead of hard deleting
    await prisma.customer.updateMany({
      where: { storeId },
      data: {
        email: 'deleted@example.com',
        phone: null,
        firstName: 'Deleted',
        lastName: 'User',
      },
    });

    // Delete consent records
    await prisma.consentRecord.deleteMany({
      where: { storeId },
    });

    // Notify via WhatsApp
    try {
      await this.whatsapp.sendMessage();
    } catch (error) {
      console.error('Failed to send deletion notification:', error);
    }
  }
}
