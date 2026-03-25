/**
 * Control Center Pro Dashboard
 * Industry-adaptive dashboard for all business operations and settings
 */

'use client';

import { useStore } from '@/providers/store-provider';
import { UniversalProDashboardV2 } from '@/components/dashboard-v2/UniversalProDashboardV2';
import type { IndustrySlug } from '@vayva/industry-core';

const FALLBACK: IndustrySlug = 'retail';

export default function ControlCenterProPage() {
  const { store } = useStore();
  const raw = store?.industrySlug?.trim().toLowerCase().replace(/-/g, '_') || FALLBACK;
  const industry = raw as IndustrySlug;

  return <UniversalProDashboardV2 industry={industry} />;
}
