/**
 * Ambient types for the merchant-shell dashboard. Keeps this package's `tsc`
 * self-contained without pulling in Frontend/merchant (and transitive industry UI).
 */
declare module '@/components/dashboard/UniversalProDashboard' {
  import type { FC } from 'react';

  export interface UniversalProDashboardProps {
    industry: string;
    variant?: string;
    userId: string;
    businessId: string;
    designCategory?: string;
    planTier?: string;
    className?: string;
  }

  export const UniversalProDashboard: FC<UniversalProDashboardProps>;
}
