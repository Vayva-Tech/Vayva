/**
 * Matter Management Service
 *
 * Case/matter tracking for law firms. In-process store until legal Prisma models exist.
 */

export interface MatterData {
  storeId: string;
  caseNumber: string;
  clientName: string;
  practiceAreaId: string;
  description: string;
  stage?: string;
  status?: 'active' | 'pending' | 'closed';
  opposingParties?: unknown[];
}

export interface CaseRecord {
  id: string;
  storeId: string;
  caseNumber: string;
  clientName: string;
  practiceAreaId: string;
  practiceArea: { code: string; name: string };
  description: string;
  stage?: string;
  status: string;
  actualValue?: number;
  winLoss?: 'won' | 'settled' | 'lost' | null;
}

export class MatterManagementService {
  private readonly cases = new Map<string, CaseRecord>();

  /**
   * Get cases grouped by practice area
   */
  async getCasesByPracticeArea(storeId: string): Promise<
    Array<{
      practiceArea: string;
      code: string;
      count: number;
      totalValue: number;
      percentage: number;
      avgValue: number;
    }>
  > {
    const cases = Array.from(this.cases.values()).filter(
      (c) => c.storeId === storeId && c.status === 'active',
    );

    const grouped = cases.reduce(
      (acc, caseItem) => {
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
      },
      {} as Record<string, { practiceArea: string; code: string; count: number; totalValue: number }>,
    );

    return Object.values(grouped).map((item) => ({
      ...item,
      percentage: cases.length ? Math.round((item.count / cases.length) * 100) : 0,
      avgValue: item.count > 0 ? item.totalValue / item.count : 0,
    }));
  }

  /**
   * Update case stage
   */
  async updateCaseStage(caseId: string, stage: string): Promise<CaseRecord | undefined> {
    const c = this.cases.get(caseId);
    if (!c) return undefined;
    c.stage = stage;
    this.cases.set(caseId, c);
    return c;
  }

  /**
   * Close a case
   */
  async closeCase(caseId: string, reason?: string): Promise<CaseRecord | undefined> {
    const c = this.cases.get(caseId);
    if (!c) return undefined;
    c.status = 'closed';
    (c as CaseRecord & { closedDate?: Date; closedReason?: string }).closedDate = new Date();
    (c as CaseRecord & { closedReason?: string }).closedReason = reason;
    this.cases.set(caseId, c);
    return c;
  }

  /**
   * Get case win rate statistics
   */
  async getCaseWinRate(
    storeId: string,
    practiceAreaId?: string,
  ): Promise<{
    winRate: number;
    won: number;
    settled: number;
    lost: number;
    total: number;
  }> {
    let list = Array.from(this.cases.values()).filter((c) => c.storeId === storeId && c.winLoss != null);
    if (practiceAreaId) {
      list = list.filter((c) => c.practiceAreaId === practiceAreaId);
    }

    const won = list.filter((c) => c.winLoss === 'won').length;
    const settled = list.filter((c) => c.winLoss === 'settled').length;
    const lost = list.filter((c) => c.winLoss === 'lost').length;
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

  async dispose(): Promise<void> {}
}
