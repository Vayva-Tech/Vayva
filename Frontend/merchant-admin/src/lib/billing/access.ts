export const checkFeatureAccess = async (storeId: string, feature: string): Promise<{ allowed: boolean; reason?: string }> => {
  return { allowed: true };
};
export const BillingAccess = {
  check: async () => true,
};
