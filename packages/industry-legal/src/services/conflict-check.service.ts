/**
 * Conflict Check Service (in-process stub)
 */

export interface ConflictCheckData {
  storeId: string;
  prospectiveClientName: string;
  matterDescription: string;
  partiesChecked: string[];
  checkedBy: string;
}

export interface ConflictSearchResult {
  id: string;
  conflictsFound: boolean;
  status: string;
}

export class ConflictCheckService {
  async runConflictsCheck(data: ConflictCheckData): Promise<ConflictSearchResult> {
    return this.checkConflicts(data);
  }

  async getPendingConflictsChecks(storeId: string): Promise<ConflictSearchResult[]> {
    return this.getPendingChecks(storeId);
  }

  async clearConflictsCheck(
    checkId: string,
    _clearedBy: string,
    _waiverReason?: string,
  ): Promise<void> {
    void checkId;
  }

  async generateConflictsReport(
    _storeId: string,
    _startDate: Date,
    _endDate: Date,
  ): Promise<{ totalChecks: number; cleared: number; blocked: number }> {
    return { totalChecks: 0, cleared: 0, blocked: 0 };
  }

  async checkConflicts(data: ConflictCheckData): Promise<ConflictSearchResult> {
    return {
      id: `cc_${Date.now()}`,
      conflictsFound: false,
      status: 'cleared',
    };
  }

  async getPendingChecks(_storeId: string): Promise<ConflictSearchResult[]> {
    return [];
  }

  async clearCheck(_id: string, _clearedBy: string, _waiverReason?: string): Promise<void> {}

  async searchPartyConflicts(
    _storeId: string,
    _partyNames: string[],
  ): Promise<{ hasConflict: boolean; details: string[] }> {
    return { hasConflict: false, details: [] };
  }

  async initialize(): Promise<void> {
    console.log('[ConflictCheckService] Initialized');
  }

  async dispose(): Promise<void> {}
}
