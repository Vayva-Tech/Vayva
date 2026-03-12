'use client';

import React from 'react';
import { VirtualTable } from './VirtualScroll';
import { Image, Avatar } from './Image';
import { useMetricsWorker, calculateMetricsAsync } from '@/hooks/use-metrics-worker';
import { useServiceWorker, useOnlineStatus, useServiceWorkerUpdate } from '@/hooks/use-service-worker';
import { SkipLink } from '@/lib/accessibility';

// Example data for virtual table
interface TenantData {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  status: 'active' | 'trial' | 'cancelled';
  avatar: string;
}

/**
 * Enhanced SaaS Dashboard demonstrating all performance optimizations
 */
export function EnhancedSaasDashboard() {
  // Service Worker hooks
  const { registration, error: swError, isSupported } = useServiceWorker();
  const isOnline = useOnlineStatus();
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();
  
  // Web Worker for calculations
  const { data: workerData, loading: workerLoading, send } = useMetricsWorker();

  // Sample tenant data (1000+ rows for virtual scrolling demo)
  const tenants: TenantData[] = React.useMemo(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: `tenant-${i}`,
      name: `Tenant ${i + 1}`,
      email: `tenant${i + 1}@example.com`,
      plan: ['Starter', 'Pro', 'Enterprise'][i % 3],
      mrr: Math.round(29 + Math.random() * 470),
      status: ['active', 'trial', 'cancelled'][i % 3] as any,
      avatar: `/avatars/user-${(i % 20) + 1}.jpg`,
    })),
    []
  );

  // Table columns configuration
  const columns = [
    {
      key: 'avatar',
      label: 'User',
      width: '80px',
      render: (tenant: TenantData) => (
        <Avatar src={tenant.avatar} alt={tenant.name} size="sm" />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      width: '200px',
      render: (tenant: TenantData) => (
        <div>
          <p className="font-medium text-text-primary">{tenant.name}</p>
          <p className="text-xs text-text-tertiary">{tenant.email}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      width: '120px',
    },
    {
      key: 'mrr',
      label: 'MRR',
      width: '100px',
      render: (tenant: TenantData) => `$${tenant.mrr}/mo`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (tenant: TenantData) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          tenant.status === 'active' ? 'bg-success/10 text-success' :
          tenant.status === 'trial' ? 'bg-accent-primary/10 text-accent-primary' :
          'bg-error/10 text-error'
        }`}>
          {tenant.status}
        </span>
      ),
    },
  ];

  // Example: Calculate metrics using Web Worker
  const handleCalculateMetrics = async () => {
    try {
      const result = await calculateMetricsAsync(
        84200, // current MRR
        75000, // previous month MRR
        tenants.map(t => ({ amount: t.mrr, status: t.status }))
      );
      console.log('Calculated metrics:', result);
    } catch (error) {
      console.error('Failed to calculate metrics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Skip Link for Accessibility */}
      <SkipLink />
      
      {/* Online Status Indicator */}
      {!isOnline && (
        <div className="bg-warning/10 border border-warning/20 px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="text-warning">⚠️</span>
          <p className="text-sm text-text-secondary">
            You're offline. Some features may be limited.
          </p>
        </div>
      )}

      {/* Service Worker Update Prompt */}
      {updateAvailable && (
        <div className="bg-accent-primary/10 border border-accent-primary/20 px-4 py-3 rounded-lg flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            🎉 New version available! Refresh to update.
          </p>
          <button
            onClick={updateServiceWorker}
            className="px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background-secondary rounded-xl p-4 border border-border/40">
          <p className="text-xs text-text-tertiary mb-1">Service Worker</p>
          <p className={`text-lg font-semibold ${registration ? 'text-success' : 'text-error'}`}>
            {registration ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="bg-background-secondary rounded-xl p-4 border border-border/40">
          <p className="text-xs text-text-tertiary mb-1">Online Status</p>
          <p className={`text-lg font-semibold ${isOnline ? 'text-success' : 'text-warning'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="bg-background-secondary rounded-xl p-4 border border-border/40">
          <p className="text-xs text-text-tertiary mb-1">Tenants Loaded</p>
          <p className="text-lg font-semibold text-text-primary">
            {tenants.length}
          </p>
        </div>
        <div className="bg-background-secondary rounded-xl p-4 border border-border/40">
          <p className="text-xs text-text-tertiary mb-1">Web Worker</p>
          <p className={`text-lg font-semibold ${workerLoading ? 'text-accent-primary' : 'text-text-primary'}`}>
            {workerLoading ? 'Calculating...' : workerData ? 'Ready' : 'Idle'}
          </p>
        </div>
      </div>

      {/* Virtual Table with 1000 rows - only renders visible rows */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Tenants (Virtual Scrolling - 1000 rows)
        </h2>
        <VirtualTable<TenantData>
          data={tenants}
          columns={columns}
          containerHeight={500}
          rowHeight={64}
        />
      </div>

      {/* Optimized Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Image
            key={i}
            src={`/images/dashboard-${i}.jpg`}
            alt={`Dashboard preview ${i}`}
            width={300}
            height={200}
            quality={80}
            placeholder="blur"
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCalculateMetrics}
          disabled={workerLoading}
          className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {workerLoading ? 'Calculating...' : 'Calculate Metrics (Web Worker)'}
        </button>
        
        <button
          onClick={() => send({ type: 'ANALYZE_TRENDS', payload: { data: [10, 20, 30, 40, 50], periods: 3 } })}
          className="px-6 py-3 bg-background-tertiary text-text-primary rounded-lg font-medium hover:bg-border/20 transition-colors"
        >
          Analyze Trends
        </button>
      </div>

      {/* Error Display */}
      {(swError || workerLoading === false && !workerData) && (
        <div className="bg-error/10 border border-error/20 px-4 py-3 rounded-lg">
          <p className="text-sm text-error">{swError || 'Worker error'}</p>
        </div>
      )}
    </div>
  );
}
