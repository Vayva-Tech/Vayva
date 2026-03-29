'use client';

import React from 'react';
import { useIndustryDashboard } from '@vayva/industry-core';
import { BEAUTY_DASHBOARD_CONFIG } from './beauty-dashboard.config';
import type { Business, User } from '@vayva/db';

export interface BeautyDashboardProps {
  businessId: string;
  userId: string;
  business?: Business;
  user?: User;
  className?: string;
}

export function BeautyDashboard({
  businessId,
  userId,
  business,
  user,
  className,
}: BeautyDashboardProps) {
  const { DashboardContainer, DashboardGrid, KPIWidget } = useIndustryDashboard();

  return (
    <DashboardContainer
      industry="beauty"
      title={BEAUTY_DASHBOARD_CONFIG.title}
      subtitle={BEAUTY_DASHBOARD_CONFIG.subtitle}
      className={className}
    >
      <DashboardGrid
        kpis={BEAUTY_DASHBOARD_CONFIG.kpis}
        widgets={BEAUTY_DASHBOARD_CONFIG.widgets}
        quickActions={BEAUTY_DASHBOARD_CONFIG.quickActions}
        alerts={BEAUTY_DASHBOARD_CONFIG.alerts}
        businessId={businessId}
        userId={userId}
      />
    </DashboardContainer>
  );
}

export default BeautyDashboard;
