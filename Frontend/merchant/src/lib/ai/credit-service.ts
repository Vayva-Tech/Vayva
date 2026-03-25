/**
 * AI Credit Service Stub
 * Placeholder implementation for AI credit management
 */

export class AICreditService {
  static async getCreditSummary(_storeId: string) {
    void _storeId;
    return {
      totalCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      resetDate: null,
      plan: 'free',
    };
  }

  static async checkLowCreditAlert(_storeId: string) {
    void _storeId;
    return {
      isLow: false,
      threshold: 100,
      remaining: 0,
    };
  }

  static async addCredits(_storeId: string, amount: number, _reason: string) {
    void _storeId;
    void _reason;
    return {
      success: true,
      newBalance: amount,
    };
  }

  static async getAllSubscriptionsWithCredits() {
    return [];
  }
}
