import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ProfessionalServicesService {
  constructor(private readonly db = prisma) {}

  async findProposals(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 200, 500);
    const where: any = {};

    if (filters.status) where.status = filters.status;

    const proposals = await this.db.proposal.findMany({
      where,
      include: {
        client: true,
      },
      orderBy: { submittedDate: 'desc' },
      take: limit,
    });

    return proposals;
  }

  async createProposal(storeId: string, data: any) {
    const { clientId, title, description, value, deadline } = data;

    const proposal = await this.db.proposal.create({
      data: {
        clientId,
        title,
        description,
        value,
        deadline,
        status: 'draft',
      },
      include: {
        client: true,
      },
    });

    logger.info(`[ProfessionalServices] Created proposal ${proposal.id}`);
    return proposal;
  }

  async findOne(proposalId: string) {
    const proposal = await this.db.proposal.findUnique({
      where: { id: proposalId },
      include: {
        client: true,
      },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    return proposal;
  }

  async updateStatus(proposalId: string, status: string) {
    const proposal = await this.db.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const updated = await this.db.proposal.update({
      where: { id: proposalId },
      data: { status },
    });

    logger.info(`[ProfessionalServices] Updated proposal ${proposalId} status to ${status}`);
    return updated;
  }

  async delete(proposalId: string) {
    const proposal = await this.db.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    await this.db.proposal.delete({
      where: { id: proposalId },
    });

    logger.info(`[ProfessionalServices] Deleted proposal ${proposalId}`);
  }

  async getAnalytics(storeId: string) {
    const [totalProposals, wonProposals, pendingProposals, totalValue] = await Promise.all([
      this.db.proposal.count({}),
      this.db.proposal.count({ where: { status: 'won' } }),
      this.db.proposal.count({ where: { status: 'pending' } }),
      this.db.proposal.aggregate({
        _sum: { value: true },
        where: { status: 'won' },
      }),
    ]);

    return {
      totalProposals,
      wonProposals,
      pendingProposals,
      totalValue: totalValue._sum.value || 0,
      winRate: totalProposals > 0 ? (wonProposals / totalProposals) * 100 : 0,
    };
  }

  async getTeamMembers(storeId: string) {
    const team = await this.db.user.findMany({
      where: { storeId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return team;
  }
}
