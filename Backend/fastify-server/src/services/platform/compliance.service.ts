import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ComplianceService {
  constructor(private readonly db = prisma) {}

  async exportGdprData(userId: string, storeId: string) {
    const [user, orders, customers, products] = await Promise.all([
      this.db.user.findUnique({
        where: { id: userId },
        include: {
          stores: true,
          teamMemberships: true,
        },
      }),
      this.db.order.findMany({
        where: { OR: [{ customerId: userId }, { userId }] },
        include: { items: true, customer: true },
      }),
      this.db.customer.findMany({
        where: { email: (await this.db.user.findUnique({ where: { id: userId } }))?.email || '' },
      }),
      this.db.product.findMany({
        where: { createdBy: userId },
      }),
    ]);

    const exportData = {
      user,
      orders,
      customers,
      products,
      exportedAt: new Date().toISOString(),
    };

    logger.info(`[Compliance] Exported GDPR data for user ${userId}`);
    return exportData;
  }

  /**
   * Get risk scores dashboard
   */
  async getRiskScores(params?: { limit?: number; minScore?: number }) {
    const { limit = 100, minScore = 0 } = params || {};

    const riskScores = await this.db.riskScore.findMany({
      where: { score: { gte: minScore } },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        store: {
          select: { name: true, slug: true },
        },
      },
    });

    return { riskScores };
  }

  /**
   * Resolve a risk item
   */
  async resolveRisk(riskId: string, resolverId: string, resolution: string) {
    const risk = await this.db.riskScore.findUnique({
      where: { id: riskId },
    });

    if (!risk) {
      throw new Error('Risk not found');
    }

    await this.db.riskScore.update({
      where: { id: riskId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: resolverId,
        resolutionNotes: resolution,
      },
    });

    logger.info(`[Compliance] Risk ${riskId} resolved by ${resolverId}`);
    return { success: true, message: 'Risk resolved' };
  }

  /**
   * Get active merchant sessions for ops dashboard
   */
  async getActiveSessions() {
    const sessions = await this.db.merchantSession.findMany({
      where: {
        expiresAt: { gt: new Date() }, // Only active sessions
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
      take: 50,
    });

    return { data: sessions };
  }

  /**
   * Get KYC queue for ops dashboard
   */
  async getKycQueue() {
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
  }

  /**
   * Process KYC action (approve/reject)
   */
  async processKycAction(
    kycId: string,
    userId: string,
    userEmail: string,
    action: 'approve' | 'reject',
    notes?: string,
    rejectionReason?: string
  ) {
    const record = await this.db.kycRecord.findUnique({
      where: { id: kycId },
      include: { store: true },
    });

    if (!record) {
      throw new Error('KYC record not found');
    }

    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';

    // Update KYC record
    await this.db.kycRecord.update({
      where: { id: kycId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: userId || 'ops_admin',
        notes: notes || null,
        rejectionReason: action === 'reject' ? rejectionReason : null,
      },
    });

    // Update store KYC status
    const storeKycStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    await this.db.store.update({
      where: { id: record.storeId },
      data: {
        kycStatus: storeKycStatus,
      },
    });

    // Update wallet KYC status if exists
    await this.db.wallet.updateMany({
      where: { storeId: record.storeId },
      data: {
        kycStatus: storeKycStatus,
      },
    });

    logger.info(`[KYC_${action.toUpperCase()}]`, {
      kycRecordId: kycId,
      storeId: record.storeId,
      storeName: record.store?.name,
      processedBy: userEmail,
    });

    return { success: true };
  }

  /**
   * Assign KYC records to reviewers
   */
  async assignKycRecords(
    kycIds: string[],
    reviewerId: string,
    assignedByUserId: string,
    assignedByEmail: string
  ) {
    // Validate reviewer exists and has permissions
    const reviewer = await this.db.opsUser?.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    const allowedRoles = ['OPS_OWNER', 'SUPERVISOR', 'OPERATOR', 'OPS_ADMIN'];
    if (!allowedRoles.includes(reviewer.role)) {
      throw new Error('Reviewer does not have KYC review privileges');
    }

    // Create assignment note
    const assignmentNote = JSON.stringify({
      assignedTo: reviewerId,
      assignedToName: reviewer.name,
      assignedAt: new Date().toISOString(),
      assignedBy: assignedByUserId,
      assignedByEmail: assignedByEmail,
    });

    // Update KYC records
    const updatePromises = kycIds.map((kycId) =>
      this.db.kycRecord?.update({
        where: { id: kycId, status: 'PENDING' },
        data: {
          notes: assignmentNote,
        },
      })
    );

    const updatedRecords = await Promise.allSettled(updatePromises);
    const successful = updatedRecords.filter((r) => r.status === 'fulfilled').length;
    const failed = updatedRecords.filter((r) => r.status === 'rejected').length;

    logger.info('[KYC_ASSIGNED]', {
      kycIds,
      assignedTo: reviewerId,
      assignedToEmail: reviewer.email,
      assignedToName: reviewer.name,
      count: successful,
      failed,
    });

    return {
      success: true,
      assigned: successful,
      failed,
      reviewer: {
        id: reviewer.id,
        name: reviewer.name,
        email: reviewer.email,
      },
    };
  }

  /**
   * Get eligible KYC reviewers
   */
  async getKycReviewers() {
    const reviewers = await this.db.opsUser?.findMany({
      where: {
        isActive: true,
        role: { in: ['OPS_OWNER', 'SUPERVISOR', 'OPERATOR', 'OPS_ADMIN'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    // Count assignments for each reviewer
    const allPendingKyc = await this.db.kycRecord?.findMany({
      where: { status: 'PENDING' },
      select: { notes: true },
    });

    const reviewersWithCounts = reviewers.map((reviewer) => {
      const count = allPendingKyc.filter((kyc) => {
        if (!kyc.notes) return false;
        try {
          const notesData = JSON.parse(kyc.notes);
          return notesData.assignedTo === reviewer.id;
        } catch {
          return false;
        }
      }).length;
      return {
        ...reviewer,
        currentAssignments: count,
      };
    });

    return { reviewers: reviewersWithCounts };
  }

  /**
   * Revoke a merchant session
   */
  async revokeSession(sessionId: string, userId: string) {
    await this.db.merchantSession.delete({
      where: { id: sessionId },
    });

    logger.info(`[SESSION_REVOKE] Session ${sessionId} revoked by ${userId}`);
    return { success: true };
  }

  /**
   * Get security audit logs
   */
  async getSecurityLogs(params: {
    page: number;
    limit: number;
    type?: string;
    userId?: string;
  }) {
    const { page, limit, type, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.eventType = type;
    if (userId) where.opsUserId = userId;

    const [events, total] = await Promise.all([
      this.db.opsAuditEvent.findMany({
        where,
        include: {
          opsUser: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.db.opsAuditEvent.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get security statistics dashboard
   */
  async getSecurityStats() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [failedLogins, activeSessions, adminActions, activeUsers] =
      await Promise.all([
        this.db.opsAuditEvent?.count({
          where: {
            eventType: 'OPS_LOGIN_FAILED',
            createdAt: { gte: yesterday },
          },
        }) ?? 0,
        this.db.opsSession?.count({
          where: {
            expiresAt: { gt: now },
          },
        }) ?? 0,
        this.db.opsAuditEvent?.count({
          where: {
            createdAt: { gte: yesterday },
          },
        }) ?? 0,
        this.db.opsSession?.groupBy({
          by: ['opsUserId'],
          where: {
            expiresAt: { gt: now },
          },
        }) ?? [],
      ]);

    return {
      stats: {
        failedLogins,
        activeSessions,
        adminActions,
        uniqueActiveUsers: activeUsers.length,
      },
    };
  }

  async deleteGdprData(userId: string, storeId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    await Promise.all([
      this.db.order.updateMany({
        where: { userId },
        data: { userId: null },
      }),
      this.db.customer.updateMany({
        where: { email: user.email },
        data: { email: 'deleted@example.com', firstName: 'Deleted', lastName: 'User' },
      }),
      this.db.teamMember.deleteMany({
        where: { userId },
      }),
    ]);

    logger.info(`[Compliance] Deleted GDPR data for user ${userId}`);
    return { success: true, deletedAt: new Date().toISOString() };
  }

  async recordConsent(storeId: string, consentData: any) {
    const { userId, consentType, granted, metadata } = consentData;

    const consent = await this.db.consent.create({
      data: {
        id: `consent-${Date.now()}`,
        userId,
        storeId,
        consentType,
        granted,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });

    logger.info(`[Compliance] Recorded consent ${consent.id} for user ${userId}`);
    return consent;
  }

  async getConsentHistory(userId: string, storeId: string) {
    const consents = await this.db.consent.findMany({
      where: { userId, storeId },
      orderBy: { timestamp: 'desc' },
    });

    return consents;
  }

  async submitKyc(storeId: string, kycData: any) {
    const { entityType, businessName, registrationNumber, taxId, address, documents } = kycData;

    const kyc = await this.db.kycVerification.create({
      data: {
        id: `kyc-${Date.now()}`,
        storeId,
        entityType: entityType || 'business',
        businessName,
        registrationNumber,
        taxId,
        address,
        documents: documents || [],
        status: 'pending',
        submittedAt: new Date(),
      },
    });

    logger.info(`[Compliance] Submitted KYC verification ${kyc.id}`);
    return kyc;
  }

  async getKycStatus(storeId: string) {
    const kyc = await this.db.kycVerification.findFirst({
      where: { storeId },
      orderBy: { submittedAt: 'desc' },
    });

    return kyc || { status: 'not_submitted' };
  }

  async submitKycCac(storeId: string, cacData: any) {
    const { cacNumber, incorporationDate, businessType, registeredAddress } = cacData;

    const submission = await this.db.cacSubmission.create({
      data: {
        id: `cac-${Date.now()}`,
        storeId,
        cacNumber,
        incorporationDate: incorporationDate ? new Date(incorporationDate) : null,
        businessType: businessType || 'limited_liability',
        registeredAddress,
        status: 'pending',
        submittedAt: new Date(),
      },
    });

    logger.info(`[Compliance] Submitted CAC ${submission.id}`);
    return submission;
  }

  async getDisputes(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [disputes, total] = await Promise.all([
      this.db.dispute.findMany({
        where,
        include: {
          order: true,
          customer: true,
          evidence: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.dispute.count({ where }),
    ]);

    return { disputes, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createDispute(storeId: string, disputeData: any) {
    const { orderId, reason, description, evidence } = disputeData;

    const dispute = await this.db.dispute.create({
      data: {
        id: `disp-${Date.now()}`,
        storeId,
        orderId,
        reason,
        description,
        status: 'open',
        evidence: evidence || [],
      },
      include: { order: true, customer: true },
    });

    logger.info(`[Compliance] Created dispute ${dispute.id}`);
    return dispute;
  }

  async addDisputeEvidence(disputeId: string, storeId: string, evidenceData: any) {
    const dispute = await this.db.dispute.findFirst({
      where: { id: disputeId },
    });

    if (!dispute || dispute.storeId !== storeId) {
      throw new Error('Dispute not found');
    }

    const evidence = await this.db.evidence.create({
      data: {
        id: `ev-${Date.now()}`,
        disputeId,
        type: evidenceData.type,
        url: evidenceData.url,
        description: evidenceData.description || null,
        submittedAt: new Date(),
      },
    });

    logger.info(`[Compliance] Added evidence ${evidence.id} to dispute ${disputeId}`);
    return evidence;
  }

  async getAppeals(storeId: string) {
    const appeals = await this.db.appeal.findMany({
      where: { storeId },
      include: {
        decision: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return appeals;
  }

  async createAppeal(storeId: string, appealData: any) {
    const { decisionId, reason, grounds, additionalEvidence } = appealData;

    const appeal = await this.db.appeal.create({
      data: {
        id: `app-${Date.now()}`,
        storeId,
        decisionId,
        reason,
        grounds: grounds || [],
        additionalEvidence: additionalEvidence || [],
        status: 'pending',
      },
      include: { decision: true },
    });

    logger.info(`[Compliance] Created appeal ${appeal.id}`);
    return appeal;
  }

  async getLegalClients(storeId: string) {
    const clients = await this.db.legalClient.findMany({
      where: { storeId },
      include: {
        cases: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return clients;
  }

  async createLegalClient(storeId: string, clientData: any) {
    const { name, email, phone, company, caseType } = clientData;

    const client = await this.db.legalClient.create({
      data: {
        id: `lc-${Date.now()}`,
        storeId,
        name,
        email,
        phone: phone || null,
        company: company || null,
        caseType: caseType || null,
      },
    });

    logger.info(`[Legal] Created client ${client.id}`);
    return client;
  }

  async getClientCases(clientId: string, storeId: string) {
    const cases = await this.db.legalCase.findMany({
      where: { clientId, storeId },
      include: {
        client: true,
        tasks: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cases;
  }

  async getTimesheets(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const [timesheets, total] = await Promise.all([
      this.db.timesheet.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          case: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.timesheet.count({ where }),
    ]);

    return { timesheets, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async approveTimesheet(timesheetId: string, storeId: string) {
    const timesheet = await this.db.timesheet.findFirst({
      where: { id: timesheetId },
    });

    if (!timesheet || timesheet.storeId !== storeId) {
      throw new Error('Timesheet not found');
    }

    const approved = await this.db.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
      include: { user: true, case: true },
    });

    logger.info(`[Legal] Approved timesheet ${timesheetId}`);
    return approved;
  }

  // Appeals Management
  async getAppeals(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const settings = store.settings as Record<string, any> || {};
    const appeals = Array.isArray(settings.appeals) ? settings.appeals : [];
    const warnings = Array.isArray(settings.warnings) ? settings.warnings : [];
    const restrictions = (settings.restrictions as Record<string, any>) || {};

    return {
      appeals,
      warnings,
      restrictions: {
        ordersDisabled: restrictions.ordersDisabled === true,
        productsDisabled: restrictions.productsDisabled === true,
        marketingDisabled: restrictions.marketingDisabled === true,
        settingsEditsDisabled: restrictions.settingsEditsDisabled === true,
        salesDisabled: restrictions.salesDisabled === true,
        paymentsDisabled: restrictions.paymentsDisabled === true,
        uploadsDisabled: restrictions.uploadsDisabled === true,
        aiDisabled: restrictions.aiDisabled === true,
      },
    };
  }

  async createAppeal(storeId: string, userId: string, appealData: any) {
    const { reason, message, channel, customerEmail, customerPhone, evidenceUrls } = appealData;

    if (!reason || reason.length < 10) {
      throw new Error('Reason must be at least 10 characters');
    }

    if (!message || message.length < 5) {
      throw new Error('Message must be at least 5 characters');
    }

    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, settings: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const prevSettings = (store.settings as Record<string, any>) || {};
    const prevAppeals = Array.isArray(prevSettings.appeals) ? prevSettings.appeals : [];

    const appealId = `appeal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const appeal = {
      id: appealId,
      status: 'OPEN',
      createdAt: nowIso,
      createdBy: 'merchant',
      severity: 'MEDIUM',
      channel: channel || undefined,
      reason,
      message,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      evidenceUrls: evidenceUrls || [],
      history: [
        {
          at: nowIso,
          by: 'merchant',
          type: 'SUBMITTED',
          status: 'OPEN',
          notes: message,
        },
      ],
    };

    const nextSettings = {
      ...prevSettings,
      appeals: [...prevAppeals, appeal],
    };

    await this.db.store.update({
      where: { id: storeId },
      data: { settings: nextSettings },
    });

    logger.info(`[Compliance] Created appeal ${appealId} for store ${storeId}`);
    return appeal;
  }
}
