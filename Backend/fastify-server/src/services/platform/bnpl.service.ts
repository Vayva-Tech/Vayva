import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BNPLService {
  constructor(private readonly db = prisma) {}

  async getDashboard(storeId: string) {
    const [totalApplications, approvedApplications, activeLoans, totalDisbursed, totalRepaid] = await Promise.all([
      this.db.bnplApplication.count({ where: { storeId } }),
      this.db.bnplApplication.count({ where: { storeId, status: 'approved' } }),
      this.db.bnplLoan.count({ where: { storeId, status: 'active' } }),
      this.db.bnplLoan.aggregate({
        where: { storeId },
        _sum: { principalAmount: true },
      }),
      this.db.bnplRepayment.aggregate({
        where: { loan: { storeId } },
        _sum: { amountPaid: true },
      }),
    ]);

    const loans = await this.db.bnplLoan.findMany({
      where: { storeId },
      include: {
        application: {
          select: {
            id: true,
            purpose: true,
          },
        },
        repayments: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      stats: {
        totalApplications,
        approvedApplications,
        activeLoans: activeLoans,
        totalDisbursed: totalDisbursed._sum.principalAmount || 0,
        totalRepaid: totalRepaid._sum.amountPaid || 0,
      },
      recentLoans: loans.map((loan) => ({
        id: loan.id,
        applicationId: loan.applicationId,
        purpose: loan.application?.purpose,
        principalAmount: Number(loan.principalAmount),
        interestRate: Number(loan.interestRate),
        tenureMonths: loan.tenureMonths,
        status: loan.status,
        disbursedAt: loan.disbursedAt,
        dueDate: loan.dueDate,
        repaidAmount: loan.repayments.reduce((sum, r) => sum + Number(r.amountPaid), 0),
        outstandingAmount: 
          Number(loan.principalAmount) + 
          (Number(loan.interestAmount) || 0) - 
          loan.repayments.reduce((sum, r) => sum + Number(r.amountPaid), 0),
      })),
    };
  }
}
