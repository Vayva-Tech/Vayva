/* eslint-disable @typescript-eslint/no-explicit-any */
export const RevenueService = {
  predictRevenue: async (storeId: string) => ({ predicted: 0, confidence: 0 }),
  checkTrialEligibility: async (args: unknown) => ({ allowed: true, reason: null }),
};
