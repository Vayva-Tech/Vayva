/**
 * Matter Management Service
 * 
 * Handles case/matter management for law firms including
 * case tracking, practice areas, and matter workflows.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatterData {
  storeId: string;
  caseNumber: string;
  clientName: string;
  practiceAreaId: string;
  description: string;
  stage?: string;
  status?: 'active' | 'pending' | 'closed';
  opposingParties?: any[];
}

export class MatterManagementService {
  /**
   * Get cases grouped by practice area
   */
  async getCasesByPracticeArea(storeId: string): Promise<any[]> {
    const cases = await prisma.case.findMany({
      where: { storeId, status: 'active' },
      include: {
        practiceArea: true,
      },
    });

    const grouped = cases.reduce((acc, caseItem) => {
      const pa = caseItem.practiceArea;
      if (!acc[pa.code]) {
        acc[pa.code] = {
          practiceArea: pa.name,
          code: pa.code,
          count: 0,
          totalValue: 0,
        };
      }
      acc[pa.code].count++;
      if (caseItem.actualValue) {
        acc[pa.code].totalValue += caseItem.actualValue;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      percentage: Math.round((item.count / cases.length) * 100),
      avgValue: item.count > 0 ? item.totalValue / item.count : 0,
    }));
  }

  /**
   * Update case stage
   */
  async updateCaseStage(caseId: string, stage: string): Promise<any> {
    return prisma.case.update({
      where: { id: caseId },
      data: { stage },
    });
  }

  /**
   * Close a case
   */
  async closeCase(caseId: string, reason?: string): Promise<any> {
    return prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'closed',
        closedDate: new Date(),
        closedReason: reason,
      },
    });
  }

  /**
   * Get case win rate statistics
   */
  async getCaseWinRate(storeId: string, practiceAreaId?: string): Promise<{
    winRate: number;
    won: number;
    settled: number;
    lost: number;
    total: number;
  }> {
    const where: any = {
      storeId,
      winLoss: { not: null },
    };

    if (practiceAreaId) {
      where.practiceAreaId = practiceAreaId;
    }

    const cases = await prisma.case.findMany({
      where,
      select: { winLoss: true },
    });

    const won = cases.filter((c) => c.winLoss === 'won').length;
    const settled = cases.filter((c) => c.winLoss === 'settled').length;
    const lost = cases.filter((c) => c.winLoss === 'lost').length;
    const total = won + settled + lost;

    return {
      winRate: total > 0 ? ((won + settled) / total) * 100 : 0,
      won,
      settled,
      lost,
      total,
    };
  }

  async initialize(): Promise<void> {
    console.log('[MatterManagementService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
