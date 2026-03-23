// @ts-nocheck
/**
 * Conflict Check Service
 * 
 * Handles ethics checks and conflict of interest detection
 * for law firms.
 */

import { PrismaClient } from '@vayva/prisma';

const prisma = new PrismaClient();

export interface ConflictCheckData {
  storeId: string;
  prospectiveClientName: string;
  matterDescription: string;
  partiesChecked: string[];
  checkedBy: string;
}

export interface ConflictSearchResult {
  conflictFound: boolean;
  existingMatters: any[];
  details: string;
}

export class ConflictCheckService {
  /**
   * Run conflicts check
   */
  async runConflictsCheck(data: ConflictCheckData): Promise<ConflictSearchResult> {
    // Search existing matters for conflicts
    const existingCases = await prisma.case.findMany({
      where: {
        storeId: data.storeId,
        OR: [
          { clientNames: { hasSome: data.partiesChecked } },
          { opposingParties: { path: ['name'], string_contains: data.partiesChecked[0] } },
        ],
      },
    });

    const conflictsFound = existingCases.length > 0;

    // Create conflict check record
    const conflictCheck = await prisma.conflictCheck.create({
      data: {
        ...data,
        conflictsFound,
        conflictDetails: conflictsFound
          ? `Found ${existingCases.length} potential conflicts in existing matters`
          : null,
        status: conflictsFound ? 'blocked' : 'cleared',
        clearedDate: conflictsFound ? null : new Date(),
      },
    });

    return {
      conflictFound: conflictsFound,
      existingMatters: existingCases,
      details: conflictCheck.conflictDetails || 'No conflicts found',
    };
  }

  /**
   * Get pending conflicts checks
   */
  async getPendingConflictsChecks(storeId: string): Promise<any[]> {
    return prisma.conflictCheck.findMany({
      where: {
        storeId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clear conflicts check with waiver
   */
  async clearConflictsCheck(
    checkId: string,
    clearedBy: string,
    waiverReason?: string
  ): Promise<void> {
    await prisma.conflictCheck.update({
      where: { id: checkId },
      data: {
        status: 'cleared',
        clearedBy,
        clearedDate: new Date(),
        waiverReason,
      },
    });
  }

  /**
   * Get conflict check history
   */
  async getConflictHistory(
    storeId: string,
    months: number = 12
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return prisma.conflictCheck.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Search for potential conflicts across all matters
   */
  async searchConflicts(
    storeId: string,
    searchTerm: string
  ): Promise<any[]> {
    const cases = await prisma.case.findMany({
      where: {
        storeId,
        OR: [
          { clientNames: { hasSome: [searchTerm] } },
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    });

    return cases;
  }

  /**
   * Generate conflicts report
   */
  async generateConflictsReport(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalChecks: number;
    cleared: number;
    blocked: number;
    waived: number;
    checks: any[];
  }> {
    const checks = await prisma.conflictCheck.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      totalChecks: checks.length,
      cleared: checks.filter(c => c.status === 'cleared').length,
      blocked: checks.filter(c => c.status === 'blocked').length,
      waived: checks.filter(c => c.waiverReason).length,
      checks,
    };
  }

  async initialize(): Promise<void> {
    console.log('[ConflictCheckService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
