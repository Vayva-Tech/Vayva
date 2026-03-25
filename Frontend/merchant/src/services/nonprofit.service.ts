import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { DonationCampaign, CampaignStatus, CreateDonationCampaignInput, Donation, DonationStatus, CreateDonationInput, Volunteer, VolunteerStatus, CreateVolunteerInput, VolunteerShift, CreateVolunteerShiftInput, VolunteerAssignment, Grant, GrantStatus, CreateGrantInput, GrantExpense, CreateGrantExpenseInput } from '@/types/phase4-industry';
import type { DonationCampaign as PrismaDonationCampaign, Donation as PrismaDonation, Volunteer as PrismaVolunteer, VolunteerShift as PrismaVolunteerShift, Grant as PrismaGrant, GrantExpense as PrismaGrantExpense } from '@vayva/db';

export class NonprofitService {
  // ===== DONATION CAMPAIGNS =====

  async getCampaigns(
    storeId: string,
    filters?: { status?: CampaignStatus; featured?: boolean }
  ): Promise<DonationCampaign[]> {
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        storeId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.featured !== undefined && { featured: filters.featured }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c: PrismaDonationCampaign) => ({
      id: c.id,
      storeId: c.storeId,
      title: c.title,
      description: c.description ?? undefined,
      goal: Number(c.goal),
      raised: Number(c.raised),
      currency: c.currency,
      startDate: c.startDate,
      endDate: c.endDate ?? undefined,
      status: c.status as CampaignStatus,
      bannerImage: c.bannerImage ?? undefined,
      featured: c.featured,
      impactMetrics: c.impactMetrics as unknown as Record<string, number> | undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getCampaignById(storeId: string, id: string): Promise<DonationCampaign | null> {
    const c = await prisma.donationCampaign.findFirst({ where: { id, storeId } });
    if (!c) return null;

    return {
      id: c.id,
      storeId: c.storeId,
      title: c.title,
      description: c.description ?? undefined,
      goal: Number(c.goal),
      raised: Number(c.raised),
      currency: c.currency,
      startDate: c.startDate,
      endDate: c.endDate ?? undefined,
      status: c.status as CampaignStatus,
      bannerImage: c.bannerImage ?? undefined,
      featured: c.featured,
      impactMetrics: c.impactMetrics as unknown as Record<string, number> | undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async createCampaign(data: CreateDonationCampaignInput): Promise<DonationCampaign> {
    const c = await prisma.donationCampaign.create({
      data: {
        storeId: data.storeId,
        title: data.title,
        description: data.description,
        goal: data.goal,
        raised: 0,
        currency: data.currency ?? 'USD',
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'active',
        bannerImage: data.bannerImage,
        featured: false,
        impactMetrics: data.impactMetrics as any,
      },
    });

    return {
      id: c.id,
      storeId: c.storeId,
      title: c.title,
      description: c.description ?? undefined,
      goal: Number(c.goal),
      raised: Number(c.raised),
      currency: c.currency,
      startDate: c.startDate,
      endDate: c.endDate ?? undefined,
      status: c.status as CampaignStatus,
      bannerImage: c.bannerImage ?? undefined,
      featured: c.featured,
      impactMetrics: c.impactMetrics as unknown as Record<string, number> | undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async updateCampaignRaised(storeId: string, campaignId: string, amount: number): Promise<DonationCampaign> {
    const updated = await prisma.donationCampaign.updateMany({
      where: { id: campaignId, storeId },
      data: {
        raised: { increment: amount },
      },
    });
    if (updated.count === 0) {
      throw new Error('Campaign not found');
    }
    const c = await prisma.donationCampaign.findFirst({
      where: { id: campaignId, storeId },
    });
    if (!c) throw new Error('Campaign not found');

    return {
      id: c.id,
      storeId: c.storeId,
      title: c.title,
      description: c.description ?? undefined,
      goal: Number(c.goal),
      raised: Number(c.raised),
      currency: c.currency,
      startDate: c.startDate,
      endDate: c.endDate ?? undefined,
      status: c.status as CampaignStatus,
      bannerImage: c.bannerImage ?? undefined,
      featured: c.featured,
      impactMetrics: c.impactMetrics as unknown as Record<string, number> | undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  // ===== DONATIONS =====

  async getDonations(
    storeId: string,
    filters?: { campaignId?: string; donorId?: string; status?: DonationStatus }
  ): Promise<Donation[]> {
    const donations = await prisma.donation.findMany({
      where: {
        storeId,
        ...(filters?.campaignId && { campaignId: filters.campaignId }),
        ...(filters?.donorId && { donorId: filters.donorId }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return donations.map((d: PrismaDonation) => ({
      id: d.id,
      campaignId: d.campaignId ?? undefined,
      storeId: d.storeId,
      donorId: d.donorId ?? undefined,
      donorEmail: d.donorEmail,
      donorName: d.donorName ?? undefined,
      amount: Number(d.amount),
      currency: d.currency,
      isAnonymous: d.isAnonymous,
      message: d.message ?? undefined,
      recurring: d.recurring,
      frequency: d.frequency ?? undefined,
      paymentMethod: d.paymentMethod,
      status: d.status as DonationStatus,
      receiptSent: d.receiptSent,
      receiptUrl: d.receiptUrl ?? undefined,
      taxReceiptNumber: d.taxReceiptNumber ?? undefined,
      matchedBy: d.matchedBy ?? undefined,
      matchedAmount: d.matchedAmount ? Number(d.matchedAmount) : undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async createDonation(data: CreateDonationInput): Promise<Donation> {
    const d = await prisma.donation.create({
      data: {
        campaignId: data.campaignId,
        storeId: data.storeId,
        donorId: data.donorId,
        donorEmail: data.donorEmail,
        donorName: data.donorName,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        isAnonymous: data.isAnonymous ?? false,
        message: data.message,
        recurring: data.recurring ?? false,
        frequency: data.frequency,
        paymentMethod: data.paymentMethod,
        status: 'completed',
      },
    });

    // Update campaign raised amount if campaignId provided
    if (data.campaignId) {
      await this.updateCampaignRaised(data.storeId, data.campaignId, data.amount);
    }

    return {
      id: d.id,
      campaignId: d.campaignId ?? undefined,
      storeId: d.storeId,
      donorId: d.donorId ?? undefined,
      donorEmail: d.donorEmail,
      donorName: d.donorName ?? undefined,
      amount: Number(d.amount),
      currency: d.currency,
      isAnonymous: d.isAnonymous,
      message: d.message ?? undefined,
      recurring: d.recurring,
      frequency: d.frequency ?? undefined,
      paymentMethod: d.paymentMethod,
      status: d.status as DonationStatus,
      receiptSent: d.receiptSent,
      receiptUrl: d.receiptUrl ?? undefined,
      taxReceiptNumber: d.taxReceiptNumber ?? undefined,
      matchedBy: d.matchedBy ?? undefined,
      matchedAmount: d.matchedAmount ? Number(d.matchedAmount) : undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async getDonationStats(storeId: string): Promise<{
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    recurringDonors: number;
  }> {
    const donations = await prisma.donation.findMany({
      where: { storeId, status: 'completed' },
    });

    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum: number, d: PrismaDonation) => sum + Number(d.amount), 0);
    const recurringDonors = donations.filter((d: PrismaDonation) => d.recurring).length;

    return {
      totalDonations,
      totalAmount,
      averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
      recurringDonors,
    };
  }

  // ===== VOLUNTEERS =====

  async getVolunteers(
    storeId: string,
    status?: VolunteerStatus
  ): Promise<Volunteer[]> {
    const volunteers = await prisma.volunteer.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return volunteers.map((v: PrismaVolunteer) => ({
      id: v.id,
      storeId: v.storeId,
      email: v.email,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone ?? undefined,
      skills: v.skills,
      availability: v.availability as unknown as { day: string; start: string; end: string }[] | undefined,
      emergencyContact: v.emergencyContact ?? undefined,
      backgroundCheck: v.backgroundCheck ?? undefined,
      status: v.status as VolunteerStatus,
      hoursVolunteered: v.hoursVolunteered,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  async createVolunteer(data: CreateVolunteerInput): Promise<Volunteer> {
    const v = await prisma.volunteer.create({
      data: {
        storeId: data.storeId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        skills: data.skills ?? [],
        availability: (data.availability ?? null) as import("@vayva/db").Prisma.InputJsonValue,
        emergencyContact: data.emergencyContact,
        status: 'active',
        hoursVolunteered: 0,
      },
    });

    return {
      id: v.id,
      storeId: v.storeId,
      email: v.email,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone ?? undefined,
      skills: v.skills,
      availability: v.availability as unknown as { day: string; start: string; end: string }[] | undefined,
      emergencyContact: v.emergencyContact ?? undefined,
      backgroundCheck: v.backgroundCheck ?? undefined,
      status: v.status as VolunteerStatus,
      hoursVolunteered: v.hoursVolunteered,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }

  async updateVolunteerHours(storeId: string, id: string, hours: number): Promise<Volunteer> {
    const updated = await prisma.volunteer.updateMany({
      where: { id, storeId },
      data: {
        hoursVolunteered: { increment: hours },
      },
    });
    if (updated.count === 0) {
      throw new Error('Volunteer not found');
    }
    const v = await prisma.volunteer.findFirst({ where: { id, storeId } });
    if (!v) throw new Error('Volunteer not found');

    return {
      id: v.id,
      storeId: v.storeId,
      email: v.email,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone ?? undefined,
      skills: v.skills,
      availability: v.availability as unknown as { day: string; start: string; end: string }[] | undefined,
      emergencyContact: v.emergencyContact ?? undefined,
      backgroundCheck: v.backgroundCheck ?? undefined,
      status: v.status as VolunteerStatus,
      hoursVolunteered: v.hoursVolunteered,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }

  // ===== VOLUNTEER SHIFTS =====

  async getVolunteerShifts(
    storeId: string,
    eventId?: string
  ): Promise<VolunteerShift[]> {
    const shifts = await prisma.volunteerShift.findMany({
      where: {
        storeId,
        ...(eventId && { eventId }),
      },
      orderBy: { startTime: 'asc' },
    });

    return shifts.map((s: PrismaVolunteerShift) => ({
      id: s.id,
      storeId: s.storeId,
      eventId: s.eventId ?? undefined,
      title: s.title,
      description: s.description ?? undefined,
      location: s.location ?? undefined,
      startTime: s.startTime,
      endTime: s.endTime,
      volunteersNeeded: s.volunteersNeeded,
      volunteersAssigned: s.volunteersAssigned,
      status: s.status as 'open' | 'filled' | 'cancelled' | 'completed',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async createVolunteerShift(data: CreateVolunteerShiftInput): Promise<VolunteerShift> {
    const s = await prisma.volunteerShift.create({
      data: {
        storeId: data.storeId,
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: data.startTime,
        endTime: data.endTime,
        volunteersNeeded: data.volunteersNeeded,
        volunteersAssigned: [],
        status: 'open',
      },
    });

    return {
      id: s.id,
      storeId: s.storeId,
      eventId: s.eventId ?? undefined,
      title: s.title,
      description: s.description ?? undefined,
      location: s.location ?? undefined,
      startTime: s.startTime,
      endTime: s.endTime,
      volunteersNeeded: s.volunteersNeeded,
      volunteersAssigned: s.volunteersAssigned,
      status: s.status as 'open' | 'filled' | 'cancelled' | 'completed',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  async assignVolunteerToShift(storeId: string, shiftId: string, volunteerId: string): Promise<VolunteerShift> {
    const shift = await prisma.volunteerShift.findFirst({ where: { id: shiftId, storeId } });
    if (!shift) throw new Error('Shift not found');

    const volunteer = await prisma.volunteer.findFirst({ where: { id: volunteerId, storeId } });
    if (!volunteer) throw new Error('Volunteer not found');

    const assigned = [...shift.volunteersAssigned, volunteerId];
    const status = assigned.length >= shift.volunteersNeeded ? 'filled' : 'open';

    const updatedShift = await prisma.$transaction(async (tx) => {
      const u = await tx.volunteerShift.updateMany({
        where: { id: shiftId, storeId },
        data: {
          volunteersAssigned: assigned,
          status,
        },
      });
      if (u.count === 0) throw new Error('Shift not found');

      await tx.volunteerAssignment.create({
        data: {
          volunteerId,
          shiftId,
          status: 'confirmed',
        },
      });

      const s = await tx.volunteerShift.findFirst({ where: { id: shiftId, storeId } });
      if (!s) throw new Error('Shift not found');
      return s;
    });

    return {
      id: updatedShift.id,
      storeId: updatedShift.storeId,
      eventId: updatedShift.eventId ?? undefined,
      title: updatedShift.title,
      description: updatedShift.description ?? undefined,
      location: updatedShift.location ?? undefined,
      startTime: updatedShift.startTime,
      endTime: updatedShift.endTime,
      volunteersNeeded: updatedShift.volunteersNeeded,
      volunteersAssigned: updatedShift.volunteersAssigned,
      status: updatedShift.status as 'open' | 'filled' | 'cancelled' | 'completed',
      createdAt: updatedShift.createdAt,
      updatedAt: updatedShift.updatedAt,
    };
  }

  // ===== GRANTS =====

  async getGrants(storeId: string, status?: GrantStatus): Promise<Grant[]> {
    const grants = await prisma.grant.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return grants.map((g: PrismaGrant) => ({
      id: g.id,
      storeId: g.storeId,
      name: g.name,
      funder: g.funder,
      amount: Number(g.amount),
      currency: g.currency,
      startDate: g.startDate,
      endDate: g.endDate,
      status: g.status as GrantStatus,
      requirements: g.requirements ?? undefined,
      restrictions: g.restrictions ?? undefined,
      reportingSchedule: g.reportingSchedule ?? undefined,
      fundsAllocated: Number(g.fundsAllocated),
      fundsSpent: Number(g.fundsSpent),
      documents: g.documents as unknown as Record<string, string>[] | undefined,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));
  }

  async createGrant(data: CreateGrantInput): Promise<Grant> {
    const g = await prisma.grant.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        funder: data.funder,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'pending',
        requirements: data.requirements,
        restrictions: data.restrictions,
        reportingSchedule: data.reportingSchedule,
      },
    });

    return {
      id: g.id,
      storeId: g.storeId,
      name: g.name,
      funder: g.funder,
      amount: Number(g.amount),
      currency: g.currency,
      startDate: g.startDate,
      endDate: g.endDate,
      status: g.status as GrantStatus,
      requirements: g.requirements ?? undefined,
      restrictions: g.restrictions ?? undefined,
      reportingSchedule: g.reportingSchedule ?? undefined,
      fundsAllocated: Number(g.fundsAllocated),
      fundsSpent: Number(g.fundsSpent),
      documents: g.documents as unknown as Record<string, string>[] | undefined,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  }

  async approveGrant(id: string, storeId: string): Promise<Grant> {
    const upd = await prisma.grant.updateMany({
      where: { id, storeId },
      data: { status: 'approved' },
    });
    if (upd.count === 0) {
      throw new Error('Grant not found');
    }

    const g = await prisma.grant.findFirst({ where: { id, storeId } });
    if (!g) throw new Error('Grant not found');

    return {
      id: g.id,
      storeId: g.storeId,
      name: g.name,
      funder: g.funder,
      amount: Number(g.amount),
      currency: g.currency,
      startDate: g.startDate,
      endDate: g.endDate,
      status: g.status as GrantStatus,
      requirements: g.requirements ?? undefined,
      restrictions: g.restrictions ?? undefined,
      reportingSchedule: g.reportingSchedule ?? undefined,
      fundsAllocated: Number(g.fundsAllocated),
      fundsSpent: Number(g.fundsSpent),
      documents: g.documents as unknown as Record<string, string>[] | undefined,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  }

  // ===== GRANT EXPENSES =====

  async getGrantExpenses(storeId: string, grantId: string): Promise<GrantExpense[]> {
    const grant = await prisma.grant.findFirst({
      where: { id: grantId, storeId },
      select: { id: true },
    });
    if (!grant) {
      throw new Error('Grant not found');
    }

    const expenses = await prisma.grantExpense.findMany({
      where: { grantId },
      orderBy: { date: 'desc' },
    });

    return expenses.map((e: PrismaGrantExpense) => ({
      id: e.id,
      grantId: e.grantId,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      receiptUrl: e.receiptUrl ?? undefined,
      date: e.date,
      approvedBy: e.approvedBy ?? undefined,
      status: e.status as 'pending' | 'approved' | 'rejected',
      createdAt: e.createdAt,
    }));
  }

  async createGrantExpense(storeId: string, data: CreateGrantExpenseInput): Promise<GrantExpense> {
    const e = await prisma.$transaction(async (tx) => {
      const grantOk = await tx.grant.findFirst({
        where: { id: data.grantId, storeId },
        select: { id: true },
      });
      if (!grantOk) {
        throw new Error('Grant not found');
      }

      const created = await tx.grantExpense.create({
        data: {
          grantId: data.grantId,
          category: data.category,
          description: data.description,
          amount: data.amount,
          date: data.date,
          receiptUrl: data.receiptUrl,
          status: 'pending',
        },
      });

      const spentUpd = await tx.grant.updateMany({
        where: { id: data.grantId, storeId },
        data: {
          fundsSpent: { increment: data.amount },
        },
      });
      if (spentUpd.count === 0) {
        throw new Error('Grant not found');
      }

      return created;
    });

    return {
      id: e.id,
      grantId: e.grantId,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      receiptUrl: e.receiptUrl ?? undefined,
      date: e.date,
      approvedBy: e.approvedBy ?? undefined,
      status: e.status as 'pending' | 'approved' | 'rejected',
      createdAt: e.createdAt,
    };
  }

  async approveExpense(storeId: string, id: string, approvedBy: string): Promise<GrantExpense> {
    const expense = await prisma.grantExpense.findFirst({
      where: { id },
      select: { grantId: true },
    });
    if (!expense) {
      throw new Error('Expense not found');
    }

    const grant = await prisma.grant.findFirst({
      where: { id: expense.grantId, storeId },
      select: { id: true },
    });
    if (!grant) {
      throw new Error('Expense not found');
    }

    const upd = await prisma.grantExpense.updateMany({
      where: { id, grantId: expense.grantId },
      data: {
        status: 'approved',
        approvedBy,
      },
    });
    if (upd.count === 0) {
      throw new Error('Expense not found');
    }

    const e = await prisma.grantExpense.findFirst({ where: { id } });
    if (!e) throw new Error('Expense not found');

    return {
      id: e.id,
      grantId: e.grantId,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      receiptUrl: e.receiptUrl ?? undefined,
      date: e.date,
      approvedBy: e.approvedBy ?? undefined,
      status: e.status as 'pending' | 'approved' | 'rejected',
      createdAt: e.createdAt,
    };
  }
}

export const nonprofitService = new NonprofitService();
