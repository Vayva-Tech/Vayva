/**
 * Healthcare Dashboard Main Page
 * HIPAA-compliant medical practice management interface
 */

'use client';

import React from 'react';
import { useHealthcareDashboard } from './hooks/useHealthcareDashboard';
import { HealthcareSkeleton } from './components/HealthcareSkeleton';
import { ErrorBoundary } from '@vayva/ui';
import { ComponentErrorState } from '@/components/error-boundary/ComponentErrorState';
import { TodayStats } from './components/TodayStats';
import { AppointmentSchedule } from './components/AppointmentSchedule';
import { PatientQueue } from './components/PatientQueue';
import { CriticalAlerts } from './components/CriticalAlerts';
import { BillingOverview } from './components/BillingOverview';
import { TaskList } from './components/TaskList';

export default function HealthcareDashboardPage() {
  const { data, isLoading, error, refetch } = useHealthcareDashboard();

  if (isLoading) {
    return <HealthcareSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ComponentErrorState 
          message="Failed to load healthcare dashboard" 
          onRetry={() => refetch()} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Practice Dashboard
          </h1>
          <p className="text-gray-600">
            Manage appointments, patients, and clinical workflows
          </p>
        </div>

        {/* Today's Stats */}
        <ErrorBoundary
          serviceName="TodayStats"
          fallback={<ComponentErrorState onRetry={() => refetch()} />}
        >
          <TodayStats stats={data.todayStats} />
        </ErrorBoundary>

        {/* Main Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Schedule */}
          <ErrorBoundary
            serviceName="AppointmentSchedule"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <AppointmentSchedule appointments={data.appointments} />
          </ErrorBoundary>

          {/* Patient Queue */}
          <ErrorBoundary
            serviceName="PatientQueue"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <PatientQueue queue={data.patientQueue} />
          </ErrorBoundary>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <ErrorBoundary
            serviceName="CriticalAlerts"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <CriticalAlerts alerts={data.criticalAlerts} />
          </ErrorBoundary>

          {/* Billing Overview */}
          <ErrorBoundary
            serviceName="BillingOverview"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
          >
            <BillingOverview billing={data.billingOverview} />
          </ErrorBoundary>
        </div>

        {/* Task List - Full Width */}
        <ErrorBoundary
          serviceName="TaskList"
          fallback={<ComponentErrorState onRetry={() => refetch()} />}
        >
          <TaskList tasks={data.tasks} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
