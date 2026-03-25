/**
 * Merchant hosts UniversalProDashboard; this package typechecks in isolation.
 */
declare module '@/components/dashboard/UniversalProDashboard' {
  import type { FC } from 'react';

  export const UniversalProDashboard: FC<{
    industry: string;
    variant?: string;
    userId: string;
    businessId: string;
    designCategory?: string;
    planTier?: string;
    className?: string;
  }>;
}
