import { prisma, type ExtendedPrismaClient } from '@vayva/db';
import { encrypt, decrypt } from '../../lib/security/encryption';
import { logger } from '../../lib/logger';

export type IdType = 'NIN' | 'DRIVERS_LICENSE' | 'VOTERS_CARD' | 'PASSPORT' | 'CAC';

export interface KycSubmissionData {
  idType: IdType;
  idNumber: string;
  idImageUrl?: string;
  cacNumber?: string;
  cacDocumentUrl?: string;
  proofOfAddressUrl?: string;
  consent: boolean;
  ipAddress: string;
  actorUserId: string;
}

export interface KycLevel {
  level: 0 | 1 | 2 | 3;
  name: string;
  dailyLimit: number;
  features: string[];
}

export const KYC_LEVELS: KycLevel[] = [
  {
    level: 0,
    name: 'Basic',
    dailyLimit: 50000,
    features: ['Create store', 'Basic dashboard'],
  },
  {
    level: 1,
    name: 'Verified',
    dailyLimit: 200000,
    features: ['Accept payments', 'Withdraw funds', 'Basic support'],
  },
  {
    level: 2,
    name: 'Trusted',
    dailyLimit: 1000000,
    features: ['Higher limits', 'Priority support', 'Advanced analytics'],
  },
  {
    level: 3,
    name: 'Business Verified',
    dailyLimit: 5000000,
    features: ['Unlimited transactions', 'Dedicated account manager', 'API access'],
  },
];

interface AuditEntry {
  timestamp: string;
  action: string;
  method?: string;
  idLast4?: string;
  hasCac?: boolean;
  hasProofOfAddress?: boolean;
  targetLevel?: number;
  result?: string;
  ipAddress?: string;
  actorUserId?: string;
  notes?: string;
  reviewedBy?: string;
}

/**
 * KYC Service - Know Your Customer compliance management
 * Handles identity verification, document submission, and transaction limits
 * Supports multiple ID types and progressive verification levels
 */
export class KycService {
  constructor(private readonly db: ExtendedPrismaClient = prisma) {}

  /**
   * Submit KYC information for manual review
   * Encrypts sensitive data and creates audit trail
   * 
   * @param storeId - The store/merchant ID
   * @param data - KYC submission data including ID type and documents
   * @returns Submission confirmation with target verification level
   */
  async submitForReview(storeId: string, data: KycSubmissionData) {
    try {
      const idLast4 = data.idNumber.slice(-4);
      
      // Calculate KYC level based on documents provided
      let targetLevel: 0 | 1 | 2 | 3 = 1;
      if (data.idType === 'CAC' || data.cacNumber) {
        targetLevel = 3;
      } else if (data.proofOfAddressUrl) {
        targetLevel = 2;
      }

      const auditEntry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: 'MANUAL_SUBMISSION',
        method: data.idType,
        idLast4,
        hasCac: !!data.cacNumber,
        hasProofOfAddress: !!data.proofOfAddressUrl,
        targetLevel,
        result: 'PENDING',
        ipAddress: data.ipAddress,
        actorUserId: data.actorUserId,
      };

      const record = await this.db.kycRecord.upsert({
        where: { storeId },
        create: {
          storeId,
          ninLast4: data.idType === 'NIN' ? idLast4 : '',
          bvnLast4: '',
          status: 'PENDING',
          fullNinEncrypted: encrypt(data.idNumber),
          audit: [auditEntry],
          cacNumberEncrypted: data.cacNumber ? encrypt(data.cacNumber) : null,
        },
        update: {
          ninLast4: data.idType === 'NIN' ? idLast4 : '',
          status: 'PENDING',
          fullNinEncrypted: encrypt(data.idNumber),
          audit: { push: auditEntry },
          cacNumberEncrypted: data.cacNumber ? encrypt(data.cacNumber) : undefined,
        },
      });

      // Update store kycStatus cache
      await this.db.store.update({
        where: { id: storeId },
        data: { kycStatus: 'PENDING' },
      });

      return {
        success: true,
        status: 'PENDING',
        recordId: record.id,
        targetLevel,
        message: 'Your documents have been submitted for review. You can start using the platform with basic limits while we verify your information.',
      };
    } catch (error) {
      logger.error('[KycService.submitForReview]', { storeId, error });
      throw error;
    }
  }

  /**
   * Skip KYC for now - allows onboarding with Level 0 limits
   * Merchant can complete verification later from settings
   * 
   * @param storeId - The store/merchant ID
   * @param actorUserId - User performing the action
   * @param ipAddress - IP address for audit trail
   * @returns Confirmation with Level 0 status
   */
  async skipForNow(storeId: string, actorUserId: string, ipAddress: string) {
    try {
      const auditEntry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: 'SKIPPED',
        result: 'NOT_STARTED',
        ipAddress,
        actorUserId,
      };

      const record = await this.db.kycRecord.upsert({
        where: { storeId },
        create: {
          storeId,
          ninLast4: '',
          bvnLast4: '',
          status: 'NOT_STARTED',
          audit: [auditEntry],
        },
        update: {
          status: 'NOT_STARTED',
          audit: { push: auditEntry },
        },
      });

      await this.db.store.update({
        where: { id: storeId },
        data: { kycStatus: 'NOT_STARTED' },
      });

      return {
        success: true,
        status: 'NOT_STARTED',
        recordId: record.id,
        targetLevel: 0,
        message: 'You can complete verification later from your settings to unlock higher limits.',
      };
    } catch (error) {
      logger.error('[KycService.skipForNow]', { storeId, error });
      throw error;
    }
  }

  /**
   * Get current KYC level and limits for a store
   * Returns appropriate level based on verification status
   * 
   * @param storeId - The store/merchant ID
   * @returns Current KYC level with limits and features
   */
  async getKycLevel(storeId: string): Promise<KycLevel> {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { kycStatus: true },
      });

      if (!store || store.kycStatus !== 'VERIFIED') {
        // Return level 0 or 1 based on verification status
        if (store?.kycStatus === 'PENDING') {
          return KYC_LEVELS[1]; // Level 1 while pending review
        }
        return KYC_LEVELS[0]; // Level 0 for skipped/unverified
      }

      // For verified users, get level from KYC record audit trail
      const record = await this.db.kycRecord.findUnique({
        where: { storeId },
        select: { audit: true },
      });

      if (record?.audit && Array.isArray(record.audit)) {
        const submissionEntry = record.audit.find((entry: unknown) => {
          const e = entry as AuditEntry;
          return e.action === 'MANUAL_SUBMISSION';
        });
        
        if (submissionEntry) {
          const targetLevel = (submissionEntry as AuditEntry).targetLevel;
          if (targetLevel !== undefined && targetLevel >= 0 && targetLevel <= 3) {
            return KYC_LEVELS[targetLevel] || KYC_LEVELS[1];
          }
        }
      }

      return KYC_LEVELS[1];
    } catch (error) {
      logger.error('[KycService.getKycLevel]', { storeId, error });
      throw error;
    }
  }

  /**
   * Check if transaction is within daily KYC limit
   * Prevents merchants from exceeding their verification tier limits
   * 
   * @param storeId - The store/merchant ID
   * @param amount - Transaction amount to validate
   * @returns Validation result with current usage and limit
   */
  async checkDailyLimit(storeId: string, amount: number): Promise<{ allowed: boolean; limit: number; current: number }> {
    try {
      const level = await this.getKycLevel(storeId);
      const limit = level.dailyLimit;

      // Get today's transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyTotal = await this.db.paymentTransaction.aggregate({
        where: {
          storeId,
          createdAt: { gte: today },
          status: 'SUCCESS',
        },
        _sum: {
          amount: true,
        },
      });

      const current = Number(dailyTotal._sum.amount || 0);
      const allowed = (current + amount) <= limit;

      return { allowed, limit, current };
    } catch (error) {
      logger.error('[KycService.checkDailyLimit]', { storeId, error });
      throw error;
    }
  }

  /**
   * Admin: Review and approve/reject KYC submission
   * Creates audit trail of admin decision
   * 
   * @param kycRecordId - KYC record ID to review
   * @param approved - Whether to approve or reject
   * @param reviewedBy - Admin user ID performing review
   * @param notes - Review notes/reason
   * @returns Updated KYC status
   */
  async reviewSubmission(
    kycRecordId: string,
    approved: boolean,
    reviewedBy: string,
    notes?: string
  ) {
    try {
      const record = await this.db.kycRecord.findUnique({
        where: { id: kycRecordId },
        include: { store: true },
      });

      if (!record) {
        throw new Error('KYC record not found');
      }

      const status = approved ? 'VERIFIED' : 'REJECTED';
      
      const auditEntry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: approved ? 'APPROVED' : 'REJECTED',
        result: status,
        reviewedBy,
        notes: notes || (approved ? 'Approved' : 'Rejected'),
      };

      await this.db.kycRecord.update({
        where: { id: kycRecordId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy,
          notes,
          audit: { push: auditEntry },
        },
      });

      // Update store kycStatus cache
      await this.db.store.update({
        where: { id: record.storeId },
        data: { kycStatus: status },
      });

      return {
        success: true,
        status,
        storeId: record.storeId,
        message: approved 
          ? 'KYC verification approved. Store now has verified status.'
          : 'KYC verification rejected. Store needs to resubmit documents.',
      };
    } catch (error) {
      logger.error('[KycService.reviewSubmission]', { kycRecordId, error });
      throw error;
    }
  }

  /**
   * Admin: Get all pending KYC submissions for review queue
   * Includes store info and bank details for verification
   * 
   * @returns List of pending KYC records with store and bank information
   */
  async getPendingSubmissions() {
    try {
      const records = await this.db.kycRecord.findMany({
        where: { status: 'PENDING' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              industrySlug: true,
              onboardingStatus: true,
              onboardingLastStep: true,
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
      });

      // Get bank info for each record
      const data = await Promise.all(
        records.map(async (rec) => {
          const bank = await this.db.bankBeneficiary.findFirst({
            where: { storeId: rec.storeId, isDefault: true },
            select: {
              bankName: true,
              bankCode: true,
              accountNumber: true,
              accountName: true,
            },
          });

          return {
            id: rec.id,
            storeId: rec.storeId,
            status: rec.status,
            ninLast4: rec.ninLast4 || '',
            bvnLast4: rec.bvnLast4 || '',
            cacNumberEncrypted: rec.cacNumberEncrypted,
            submittedAt: rec.submittedAt?.toISOString() || rec.createdAt.toISOString(),
            reviewedAt: rec.reviewedAt?.toISOString() || null,
            notes: rec.notes,
            store: rec.store,
            bank,
          };
        }),
      );

      return { data };
    } catch (error) {
      logger.error('[KycService.getPendingSubmissions]', { error });
      throw error;
    }
  }

  /**
   * Get decrypted KYC information for admin review
   * Sensitive data decryption only available for authorized admin access
   * 
   * @param kycRecordId - KYC record ID
   * @returns Decrypted KYC information
   */
  async getDecryptedData(kycRecordId: string) {
    try {
      const record = await this.db.kycRecord.findUnique({
        where: { id: kycRecordId },
      });

      if (!record) {
        throw new Error('KYC record not found');
      }

      return {
        id: record.id,
        ninLast4: record.ninLast4,
        bvnLast4: record.bvnLast4,
        fullNin: record.fullNinEncrypted ? decrypt(record.fullNinEncrypted) : null,
        cacNumber: record.cacNumberEncrypted ? decrypt(record.cacNumberEncrypted) : null,
        submittedAt: record.submittedAt,
        reviewedAt: record.reviewedAt,
        status: record.status,
      };
    } catch (error) {
      logger.error('[KycService.getDecryptedData]', { kycRecordId, error });
      throw error;
    }
  }
}

// Export singleton instance for backwards compatibility
export const kycService = new KycService();
