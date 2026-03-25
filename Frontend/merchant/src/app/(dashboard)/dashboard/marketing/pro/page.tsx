/**
 * Marketing Pro Dashboard
 * Industry-adaptive marketing hub (shared Pro shell)
 */

'use client';

import { useStore } from '@/providers/store-provider';
import { UniversalProDashboardV2 } from '@/components/dashboard-v2/UniversalProDashboardV2';
import type { IndustrySlug } from '@vayva/industry-core';

const FALLBACK: IndustrySlug = 'retail';

export default function MarketingProPage() {
  const { store } = useStore();
  const raw = store?.industrySlug?.trim().toLowerCase().replace(/-/g, '_') || FALLBACK;
  const industry = raw as IndustrySlug;

  return <UniversalProDashboardV2 industry={industry} />;
}
