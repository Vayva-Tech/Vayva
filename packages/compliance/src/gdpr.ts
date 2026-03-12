import { prisma } from "@vayva/db";
import { addDays, addYears } from "date-fns";
import { v4 as uuid } from "uuid";

// Types for GDPR operations
export interface DataExportPackage {
  merchantId: string;
  exportedAt: Date;
  profile: {
    name: string;
    createdAt: Date;
  };
  products: Array<{
    name: string;
    price: number;
    createdAt: Date;
  }>;
  orders: Array<{
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
  customers: Array<{
    name: string;
    phone: string | null;
    email: string | null;
  }>;
  conversations: Array<{
    customerPhone: string;
    messageCount: number;
  }>;
}

export interface DeletionReport {
  merchantId: string;
  deletedAt: Date;
  retentionDate: Date;
  anonymizedId: string;
}

export interface ConsentRecordData {
  merchantId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentStatus {
  marketing: boolean;
  analytics: boolean;
  thirdParty: boolean;
  lastUpdated?: Date;
}

/**
 * Storage interface for uploading export packages
 * Implement this based on your storage provider (S3, Cloudflare R2, etc.)
 */
export interface StorageProvider {
  upload(data: Buffer | string, path: string): Promise<string>;
  getSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}

/**
 * WhatsApp notification interface
 * Implement this using your WhatsApp provider (Evolution API, etc.)
 */
export interface WhatsAppNotifier {
  sendMessage(instanceName: string, phone: string, text: string): Promise<unknown>;
}

/**
 * Interface for getting store owner information
 * This abstracts the store-owner relationship which varies by schema
 */
export interface StoreOwnerProvider {
  getOwnerInfo(storeId: string): Promise<{
    userId: string;
    email: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null>;
}

/**
 * GDPR Automation class for handling data subject requests
 */
export class GdprAutomation {
  private storage: StorageProvider;
  private whatsapp: WhatsAppNotifier;
  private systemInstance: string;
  private ownerProvider?: StoreOwnerProvider;

  constructor(
    storage: StorageProvider,
    whatsapp: WhatsAppNotifier,
    systemInstance: string = "vayva-official",
    ownerProvider?: StoreOwnerProvider
  ) {
    this.storage = storage;
    this.whatsapp = whatsapp;
    this.systemInstance = systemInstance;
    this.ownerProvider = ownerProvider;
  }

  /**
   * Handle data export request (Right to Access)
   * Collects all merchant data and creates a downloadable package
   */
  async handleDataExportRequest(merchantId: string): Promise<DataExportPackage> {
    const merchant = await prisma.store.findUnique({
      where: { id: merchantId },
      include: {
        products: true,
        orders: { include: { items: true } },
        customers: true,
        conversations: { include: { messages: true } },
      },
    });

    if (!merchant) {
      throw new Error(`Merchant not found: ${merchantId}`);
    }

    // Get owner info if provider is available
    const ownerInfo = this.ownerProvider ? await this.ownerProvider.getOwnerInfo(merchantId) : null;

    const exportPackage: DataExportPackage = {
      merchantId,
      exportedAt: new Date(),
      profile: {
        name: merchant.name,
        createdAt: merchant.createdAt,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: merchant.products.map((p: any) => ({
        name: p.title || p.name,
        price: Number(p.price),
        createdAt: p.createdAt,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders: merchant.orders.map((o: any) => ({
        orderNumber: String(o.orderNumber),
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customers: merchant.customers.map((c: any) => ({
        name: c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.firstName || c.lastName || "Unknown",
        phone: c.phone,
        email: c.email,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conversations: merchant.conversations.map((c: any) => ({
        customerPhone: c.contact?.phone || c.contactId || "Unknown",
        messageCount: c.messages?.length || 0,
      })),
    };

    // Generate downloadable package
    const json = JSON.stringify(exportPackage, null, 2);
    const filePath = `exports/${merchantId}-${Date.now()}.json`;
    await this.storage.upload(json, filePath);
    const downloadUrl = await this.storage.getSignedUrl(filePath, 30 * 24 * 60 * 60); // 30 days

    // Send notification via WhatsApp if owner info is available
    if (ownerInfo?.phone) {
      const firstName = ownerInfo.firstName || "there";
      await this.whatsapp.sendMessage(
        this.systemInstance,
        ownerInfo.phone,
        `Hi ${firstName}!\n\nYour data export is ready. Download it here: ${downloadUrl}\n\nThis link expires in 30 days.`
      );
    }

    // Log the export
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: ownerInfo?.userId || "system",
        action: "GDPR_DATA_EXPORT",
        targetType: "store",
        targetId: merchantId,
        reason: "Data subject access request",
        createdAt: new Date(),
      },
    });

    return exportPackage;
  }

  /**
   * Handle deletion request (Right to be Forgotten)
   * Schedules account deletion with 30-day grace period
   */
  async handleDeletionRequest(
    merchantId: string,
    requestedByUserId: string
  ): Promise<{ deletionRequestId: string; scheduledFor: Date }> {
    const merchant = await prisma.store.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error(`Merchant not found: ${merchantId}`);
    }

    // Use existing AccountDeletionRequest model
    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        storeId: merchantId,
        requestedByUserId,
        status: "SCHEDULED",
        scheduledFor: addDays(new Date(), 30), // 30-day grace period
        reason: "GDPR deletion request",
      },
    });

    // Log the request
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: requestedByUserId,
        action: "GDPR_DELETION_REQUESTED",
        targetType: "store",
        targetId: merchantId,
        reason: "Data subject deletion request",
        before: { status: "active" },
        after: { status: "scheduled_for_deletion", scheduledFor: deletionRequest.scheduledFor },
        createdAt: new Date(),
      },
    });

    // Get owner info if provider is available
    const ownerInfo = this.ownerProvider ? await this.ownerProvider.getOwnerInfo(merchantId) : null;

    // Notify merchant if phone is available
    if (ownerInfo?.phone) {
      const firstName = ownerInfo.firstName || "there";
      await this.whatsapp.sendMessage(
        this.systemInstance,
        ownerInfo.phone,
        `Hi ${firstName}.\n\nWe've received your account deletion request. Your account will be permanently deleted on ${deletionRequest.scheduledFor.toLocaleDateString()}.\n\nIf you change your mind, log in before this date to cancel.`
      );
    }

    return {
      deletionRequestId: deletionRequest.id,
      scheduledFor: deletionRequest.scheduledFor,
    };
  }

  /**
   * Cancel a pending deletion request
   */
  async cancelDeletionRequest(deletionRequestId: string): Promise<void> {
    const deletionRequest = await prisma.accountDeletionRequest.update({
      where: { id: deletionRequestId },
      data: {
        status: "CANCELED",
        updatedAt: new Date(),
      },
    });

    // Log the cancellation
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: deletionRequest.requestedByUserId,
        action: "GDPR_DELETION_CANCELED",
        targetType: "store",
        targetId: deletionRequest.storeId,
        reason: "User canceled deletion request",
        createdAt: new Date(),
      },
    });

    // Get owner info if provider is available
    const ownerInfo = this.ownerProvider ? await this.ownerProvider.getOwnerInfo(deletionRequest.storeId) : null;

    // Notify merchant if phone is available
    if (ownerInfo?.phone) {
      const firstName = ownerInfo.firstName || "there";
      await this.whatsapp.sendMessage(
        this.systemInstance,
        ownerInfo.phone,
        `Hi ${firstName}.\n\nYour account deletion request has been canceled. Your account is now active again.`
      );
    }
  }

  /**
   * Execute deletion (called by scheduled worker after grace period)
   * Anonymizes data instead of deleting for financial records compliance
   */
  async executeDeletion(merchantId: string): Promise<DeletionReport> {
    const anonymizedId = `deleted_${uuid()}`;

    await prisma.$transaction(async (tx) => {
      // Anonymize merchant
      await tx.store.update({
        where: { id: merchantId },
        data: {
          name: "Deleted Merchant",
          deletedAt: new Date(),
          logoUrl: null,
          socialImage: null,
          seoDescription: null,
          isLive: false,
          isActive: false,
        },
      });

      // Anonymize customers
      await tx.customer.updateMany({
        where: { storeId: merchantId },
        data: {
          firstName: "Deleted",
          lastName: "Customer",
          phone: null,
          email: null,
          notes: null,
        },
      });

      // Delete conversations (not needed for accounting)
      await tx.conversation.deleteMany({
        where: { storeId: merchantId },
      });

      // Keep orders for accounting but anonymize any PII in notes
      await tx.order.updateMany({
        where: { storeId: merchantId },
        data: {
          customerNote: null,
          internalNote: null,
        },
      });

      // Update deletion request status
      await tx.accountDeletionRequest.updateMany({
        where: { storeId: merchantId, status: "SCHEDULED" },
        data: { status: "EXECUTED" },
      });
    });

    const report: DeletionReport = {
      merchantId: anonymizedId,
      deletedAt: new Date(),
      retentionDate: addYears(new Date(), 7), // Financial records kept 7 years
      anonymizedId,
    };

    // Log the deletion
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: "system",
        action: "GDPR_DELETION_EXECUTED",
        targetType: "store",
        targetId: merchantId,
        reason: "Scheduled GDPR deletion executed",
        after: { anonymizedId, retentionDate: report.retentionDate },
        createdAt: new Date(),
      },
    });

    return report;
  }

  /**
   * Record consent for a specific type
   */
  async recordConsent(
    merchantId: string,
    consentType: string,
    granted: boolean,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    // Use Prisma's raw query or type assertion to access consentRecord
    // The model exists in schema at line 69
    const prismaWithConsent = prisma as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consentRecord: any;
    };
    
    await prismaWithConsent.consentRecord.create({
      data: {
        storeId: merchantId,
        consentType,
        granted,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Get current consent status for a merchant
   */
  async getConsentStatus(merchantId: string): Promise<ConsentStatus> {
    const prismaWithConsent = prisma as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consentRecord: any;
    };
    
    const records = await prismaWithConsent.consentRecord.findMany({
      where: { storeId: merchantId },
      orderBy: { createdAt: "desc" },
    }) as Array<{ consentType: string; granted: boolean; createdAt: Date }>;

    // Get latest record for each consent type
    const latestByType = new Map<string, { consentType: string; granted: boolean; createdAt: Date }>();
    for (const record of records) {
      if (!latestByType.has(record.consentType)) {
        latestByType.set(record.consentType, record);
      }
    }

    return {
      marketing: latestByType.get("marketing")?.granted ?? false,
      analytics: latestByType.get("analytics")?.granted ?? false,
      thirdParty: latestByType.get("third_party")?.granted ?? false,
      lastUpdated: records[0]?.createdAt,
    };
  }

  /**
   * Check if a merchant has pending deletion request
   */
  async hasPendingDeletion(merchantId: string): Promise<boolean> {
    const count = await prisma.accountDeletionRequest.count({
      where: {
        storeId: merchantId,
        status: "SCHEDULED",
        scheduledFor: { gt: new Date() },
      },
    });
    return count > 0;
  }

  /**
   * Get pending deletions that are due for execution
   */
  async getPendingDeletionsDue(): Promise<
    Array<{
      id: string;
      storeId: string;
      scheduledFor: Date;
    }>
  > {
    return await prisma.accountDeletionRequest.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: { lte: new Date() },
      },
      select: {
        id: true,
        storeId: true,
        scheduledFor: true,
      },
    });
  }
}

export default GdprAutomation;
