import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class NonprofitService {
  constructor(private readonly db = prisma) {}

  async getDonors(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.donorType) where.donorType = filters.donorType;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [donors, total] = await Promise.all([
      this.db.donor.findMany({
        where,
        include: {
          donations: {
            take: 5,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { lastName: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.donor.count({ where }),
    ]);

    return { donors, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createDonor(storeId: string, donorData: any) {
    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      donorType,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      communicationPreferences,
      anonymous,
      tributeName,
    } = donorData;

    const donor = await this.db.donor.create({
      data: {
        id: `donor-${Date.now()}`,
        storeId,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        organization: organization || null,
        donorType: donorType || 'individual',
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || 'US',
        notes: notes || null,
        communicationPreferences: communicationPreferences || {},
        anonymous: anonymous || false,
        tributeName: tributeName || null,
        status: 'active',
        lifetimeValue: 0,
      },
    });

    logger.info(`[Nonprofit] Created donor ${donor.id}`);
    return donor;
  }

  async getDonorEngagement(donorId: string, storeId: string) {
    const donor = await this.db.donor.findFirst({
      where: { id: donorId },
      include: {
        donations: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!donor || donor.storeId !== storeId) {
      throw new Error('Donor not found');
    }

    const totalDonations = donor.donations.length;
    const totalAmount = donor.donations.reduce((sum, d) => sum + d.amount, 0);
    const lastDonationDate = donor.donations[0]?.date || null;

    return {
      donor,
      totalDonations,
      totalAmount,
      averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
      lastDonationDate,
    };
  }

  async getGrants(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;

    const [grants, total] = await Promise.all([
      this.db.grant.findMany({
        where,
        include: {
          funder: true,
        },
        orderBy: { applicationDeadline: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.grant.count({ where }),
    ]);

    return { grants, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createGrant(storeId: string, grantData: any) {
    const {
      name,
      description,
      funderId,
      amount,
      applicationDeadline,
      startDate,
      endDate,
      status,
    } = grantData;

    const grant = await this.db.grant.create({
      data: {
        id: `grant-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        funderId,
        amount,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'draft',
      },
    });

    logger.info(`[Nonprofit] Created grant ${grant.id}`);
    return grant;
  }

  async getDonations(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.donorId) where.donorId = filters.donorId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.status) where.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = filters.fromDate;
      if (filters.toDate) where.date.lte = filters.toDate;
    }

    const [donations, total] = await Promise.all([
      this.db.donation.findMany({
        where,
        include: {
          donor: true,
          campaign: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.donation.count({ where }),
    ]);

    return { donations, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createDonation(storeId: string, donationData: any) {
    const { donorId, campaignId, amount, date, type, paymentMethod, notes } = donationData;

    const donation = await this.db.donation.create({
      data: {
        id: `donation-${Date.now()}`,
        storeId,
        donorId,
        campaignId: campaignId || null,
        amount,
        date: date ? new Date(date) : new Date(),
        type: type || 'one-time',
        paymentMethod: paymentMethod || null,
        status: 'completed',
        notes: notes || null,
      },
      include: { donor: true, campaign: true },
    });

    // Update donor lifetime value
    await this.db.donor.update({
      where: { id: donorId },
      data: {
        lifetimeValue: { increment: amount },
      },
    });

    logger.info(`[Nonprofit] Created donation ${donation.id}`);
    return donation;
  }

  async getNonprofitStats(storeId: string) {
    const [
      totalDonors,
      activeDonors,
      totalDonations,
      totalRevenue,
      activeGrants,
      pendingGrants,
    ] = await Promise.all([
      this.db.donor.count({ where: { storeId } }),
      this.db.donor.count({ where: { storeId, status: 'active' } }),
      this.db.donation.count({ where: { storeId } }),
      this.db.donation.aggregate({
        where: { storeId, status: 'completed' },
        _sum: { amount: true },
      }),
      this.db.grant.count({ where: { storeId, status: 'active' } }),
      this.db.grant.count({ where: { storeId, status: 'pending' } }),
    ]);

    return {
      donors: { total: totalDonors, active: activeDonors },
      donations: { total: totalDonations, revenue: totalRevenue._sum.amount || 0 },
      grants: { active: activeGrants, pending: pendingGrants },
    };
  }

  /**
   * Grants Management
   */
  async getGrants(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.funder) where.funder = { contains: filters.funder, mode: 'insensitive' };

    const [grants, total] = await Promise.all([
      this.db.grant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { deadline: 'asc' },
      }),
      this.db.grant.count({ where }),
    ]);

    return {
      grants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createGrant(storeId: string, grantData: any) {
    const { funder, title, amount, deadline, status, description, requirements } = grantData;

    if (!funder || !title || !amount || !deadline || !status) {
      throw new Error('Funder, title, amount, deadline, and status are required');
    }

    const grant = await this.db.grant.create({
      data: {
        id: `grant-${Date.now()}`,
        storeId,
        funder,
        title,
        amount: parseFloat(String(amount)),
        deadline: new Date(deadline),
        status,
        description: description || null,
        requirements: requirements || [],
      },
    });

    logger.info(`[Nonprofit] Created grant ${grant.id}`);
    return grant;
  }

  async getGrant(grantId: string, storeId: string) {
    const grant = await this.db.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant || grant.storeId !== storeId) {
      throw new Error('Grant not found');
    }

    return grant;
  }

  async updateGrant(grantId: string, storeId: string, updates: any) {
    const grant = await this.db.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant || grant.storeId !== storeId) {
      throw new Error('Grant not found');
    }

    const updated = await this.db.grant.update({
      where: { id: grantId },
      data: updates,
    });

    logger.info(`[Nonprofit] Updated grant ${grantId}`);
    return updated;
  }

  async deleteGrant(grantId: string, storeId: string) {
    const grant = await this.db.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant || grant.storeId !== storeId) {
      throw new Error('Grant not found');
    }

    await this.db.grant.delete({
      where: { id: grantId },
    });

    logger.info(`[Nonprofit] Deleted grant ${grantId}`);
    return { success: true };
  }

  async getGrantPipeline(storeId: string) {
    const [submitted, inProgress, planning, awarded, rejected] = await Promise.all([
      this.db.grant.count({ where: { storeId, status: 'submitted' } }),
      this.db.grant.count({ where: { storeId, status: 'in_progress' } }),
      this.db.grant.count({ where: { storeId, status: 'planning' } }),
      this.db.grant.aggregate({
        where: { storeId, status: 'awarded' },
        _sum: { amount: true },
      }),
      this.db.grant.aggregate({
        where: { storeId, status: 'rejected' },
        _sum: { amount: true },
      }),
    ]);

    const totalPending = await this.db.grant.aggregate({
      where: { storeId, status: { in: ['submitted', 'in_progress', 'planning'] } },
      _sum: { amount: true },
    });

    const totalSubmitted = await this.db.grant.count({ where: { storeId } });
    const totalAwarded = await this.db.grant.count({ where: { storeId, status: 'awarded' } });

    const successRate = totalSubmitted > 0 ? Math.round((totalAwarded / totalSubmitted) * 100) : 0;

    return {
      submitted,
      inProgress,
      planning,
      awarded: awarded._sum.amount || 0,
      pending: totalPending._sum.amount || 0,
      rejected: rejected._sum.amount || 0,
      successRate,
    };
  }
}
