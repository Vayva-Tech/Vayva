import { prisma, type KycStatus } from '@vayva/db';
import { encrypt } from '../../lib/security/encryption';
import { logger } from '../../lib/logger';
import { PaystackService } from '../financial/paystack.service';

export class KycService {
  constructor(
    private readonly db = prisma,
    private readonly paystackService = new PaystackService(),
  ) {}

  async submitForReview(
    storeId: string,
    data: {
      nin: string;
      cacNumber?: string;
      consent: boolean;
      ipAddress: string;
      actorUserId: string;
    }
  ) {
    const ninLast4 = data.nin?.slice(-4);

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'MANUAL_SUBMISSION',
      method: 'NIN',
      result: 'PENDING',
      ipAddress: data.ipAddress,
      actorUserId: data.actorUserId,
    };

    const record = await this.db.kycRecord?.upsert({
      where: { storeId },
      create: {
        storeId,
        ninLast4,
        bvnLast4: '',
        status: 'PENDING',
        fullNinEncrypted: encrypt(data.nin),
        audit: [auditEntry],
      },
      update: {
        ninLast4,
        status: 'PENDING',
        fullNinEncrypted: encrypt(data.nin),
        audit: { push: auditEntry },
      },
    });

    await this.db.store.update({
      where: { id: storeId },
      data: { kycStatus: 'PENDING' },
    });

    return {
      success: true,
      status: 'pending' as KycStatus,
      recordId: record.id,
    };
  }

  async getStatus(storeId: string) {
    return await this.db.kycRecord?.findFirst({
      where: { storeId },
      select: {
        id: true,
        status: true,
        ninLast4: true,
        bvnLast4: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(
    storeId: string,
    status: KycStatus,
    reviewedByUserId: string,
    notes?: string
  ) {
    const record = await this.db.kycRecord?.findFirst({
      where: { storeId },
    });

    if (!record) {
      throw new Error('KYC record not found');
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'REVIEW',
      method: 'ADMIN',
      result: status,
      reviewedByUserId,
      notes: notes || '',
    };

    await this.db.kycRecord.update({
      where: { id: record.id },
      data: {
        status,
        audit: { push: auditEntry },
      },
    });

    await this.db.store.update({
      where: { id: storeId },
      data: { kycStatus: status },
    });

    return { success: true, status };
  }

  async submitCAC(storeId: string, userId: string, data: any) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: { kycRecord: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const kycRecord = await this.db.kycRecord.upsert({
      where: { storeId },
      update: {
        status: 'PENDING_REVIEW',
        cacData: data.cacData || null,
        submittedAt: new Date(),
      },
      create: {
        storeId,
        status: 'PENDING_REVIEW',
        cacData: data.cacData || null,
        submittedAt: new Date(),
      },
    });

    // Create audit log
    await this.db.auditLog.create({
      data: {
        action: 'KYC_CAC_SUBMIT',
        actorUserId: userId,
        targetStoreId: storeId,
        targetType: 'KYC_RECORD',
        targetId: kycRecord.id,
        metadata: {
          cacData: data.cacData,
        },
      },
    });

    logger.info(`[KYC] CAC submission for store ${storeId}`);
    return { success: true, kycRecord };
  }

  async submitBVN(
    storeId: string,
    userId: string,
    data: {
      bvn: string;
      consent: boolean;
      gracePeriod?: boolean;
      ipAddress?: string;
      accountNumber?: string;
      bankCode?: string;
      merchantName?: string;
    }
  ) {
    try {
      const bvnLast4 = data.bvn.slice(-4);
      
      // Step 1: Verify BVN with Paystack
      const bvnVerification = await this.paystackService.verifyBvn(data.bvn);
      
      if (!bvnVerification.verified) {
        throw new Error('BVN verification failed. Please check your BVN and try again.');
      }
      
      // Step 2: If account number provided, verify name match
      let nameMatchScore = bvnVerification.nameMatchScore;
      let accountVerified = false;
      let accountName = '';
      
      if (data.accountNumber && data.bankCode) {
        try {
          const accountDetails = await this.paystackService.resolveBankAccount(
            data.accountNumber,
            data.bankCode
          );
          accountName = accountDetails.account_name;
          
          // Calculate name match between BVN name and account name
          const bvnFullName = `${bvnVerification.firstName} ${bvnVerification.lastName}`.toLowerCase();
          const accountFullName = accountName.toLowerCase();
          
          // Simple name matching logic
          const namesMatch = 
            bvnFullName.includes(bvnVerification.firstName.toLowerCase()) &&
            bvnFullName.includes(bvnVerification.lastName.toLowerCase()) &&
            (accountFullName.includes(bvnVerification.firstName.toLowerCase()) ||
             accountFullName.includes(bvnVerification.lastName.toLowerCase()));
          
          if (namesMatch) {
            nameMatchScore = Math.max(nameMatchScore, 90); // High confidence
            accountVerified = true;
          } else {
            nameMatchScore = Math.min(nameMatchScore, 30); // Low confidence
          }
        } catch (error) {
          logger.warn('[KYC.submitBVN] Account resolution failed', { storeId, error });
          // Continue with BVN verification only
        }
      }
      
      // Step 3: Check if merchant name matches BVN name
      let merchantNameMatch = false;
      if (data.merchantName) {
        const merchantLower = data.merchantName.toLowerCase();
        merchantNameMatch = 
          merchantLower.includes(bvnVerification.firstName.toLowerCase()) ||
          merchantLower.includes(bvnVerification.lastName.toLowerCase());
      }
      
      // Step 4: Determine KYC status based on verification results
      // Auto-approve if: BVN verified + name match score >= 70 + account verified OR merchant name match
      const shouldAutoApprove = 
        bvnVerification.verified &&
        nameMatchScore >= 70 &&
        (accountVerified || merchantNameMatch);
      
      const finalStatus = shouldAutoApprove ? 'VERIFIED' : (data.gracePeriod ? 'PENDING_NIN' : 'PENDING');
      
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'BVN_SUBMISSION',
        method: 'PAYSTACK_AUTO_VERIFY',
        result: finalStatus,
        ipAddress: data.ipAddress || 'unknown',
        actorUserId: userId,
        metadata: {
          bvnVerified: bvnVerification.verified,
          nameMatchScore,
          accountVerified,
          merchantNameMatch,
          accountName,
          bvnFirstName: bvnVerification.firstName,
          bvnLastName: bvnVerification.lastName,
        },
      };

      const kycRecord = await this.db.kycRecord.upsert({
        where: { storeId },
        update: {
          bvnLast4,
          status: finalStatus,
          fullBvnEncrypted: encrypt(data.bvn),
          submittedAt: new Date(),
          ninDueDate: data.gracePeriod && !shouldAutoApprove ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
          audit: { push: auditEntry },
          verifiedAt: shouldAutoApprove ? new Date() : null,
        },
        create: {
          storeId,
          bvnLast4,
          ninLast4: '',
          status: finalStatus,
          fullBvnEncrypted: encrypt(data.bvn),
          submittedAt: new Date(),
          ninDueDate: data.gracePeriod && !shouldAutoApprove ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
          audit: [auditEntry],
          verifiedAt: shouldAutoApprove ? new Date() : null,
        },
      });

      await this.db.store.update({
        where: { id: storeId },
        data: { 
          kycStatus: finalStatus,
        },
      });

      logger.info(`[KYC] BVN submitted for store ${storeId}`, { 
        gracePeriod: data.gracePeriod,
        autoApproved: shouldAutoApprove,
        nameMatchScore,
        finalStatus 
      });

      return {
        success: true,
        status: finalStatus,
        recordId: kycRecord.id,
        message: shouldAutoApprove
          ? 'BVN verified successfully! Your account has been auto-approved.'
          : data.gracePeriod 
            ? 'BVN verified! Please submit NIN within 7 days.'
            : 'BVN submitted for manual verification',
        ninDueDate: kycRecord.ninDueDate,
        autoApproved: shouldAutoApprove,
        verificationDetails: {
          bvnVerified: bvnVerification.verified,
          nameMatchScore,
          accountVerified,
          merchantNameMatch,
          accountName,
          bvnName: `${bvnVerification.firstName} ${bvnVerification.lastName}`,
        },
      };
    } catch (error) {
      logger.error('[KYC.submitBVN]', { storeId, error });
      throw error;
    }
  }
}
