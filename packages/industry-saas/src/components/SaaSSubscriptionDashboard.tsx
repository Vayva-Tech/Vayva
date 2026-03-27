/**
 * SaaS Subscription Dashboard Component
 */

import React, { useMemo, useCallback, memo } from 'react';
import { Subscription, UsageRecord } from '../services/saas-subscription.service';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export interface SaaSSubscriptionDashboardProps {
  subscriptions: Subscription[];
  upcomingRenewals: Subscription[];
  revenueByPlan: Record<string, number>;
  onCreateSubscription?: (subscription: Partial<Subscription>) => void;
  onUpdateStatus?: (subscriptionId: string, status: Subscription['status']) => void;
}

export const SaaSSubscriptionDashboard: React.FC<SaaSSubscriptionDashboardProps> = ({
  subscriptions,
  upcomingRenewals,
  revenueByPlan,
  onCreateSubscription,
  onUpdateStatus,
}) => {
  // Memoize expensive calculations
  const activeSubscriptions = useMemo(
    () => subscriptions.filter(s => s.status === 'active'),
    [subscriptions]
  );

  const mrr = useMemo(
    () => activeSubscriptions.reduce((sum, s) => sum + (s.amount * s.quantity), 0),
    [activeSubscriptions]
  );

  const upcomingRenewalsCount = useMemo(
    () => upcomingRenewals.length,
    [upcomingRenewals]
  );

  // Memoize event handlers
  const handleCreateSubscription = useCallback(
    (subscription: Partial<Subscription>) => {
      onCreateSubscription?.(subscription);
    },
    [onCreateSubscription]
  );

  const handleUpdateStatus = useCallback(
    (subscriptionId: string, status: Subscription['status']) => {
      onUpdateStatus?.(subscriptionId, status);
    },
    [onUpdateStatus]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <DashboardErrorBoundary serviceName="SaaSHeader">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💳 SaaS Subscriptions</h2>
          <p className="text-gray-600">Manage recurring revenue and billing</p>
        </div>
      </DashboardErrorBoundary>

      {/* Quick Stats */}
      <DashboardErrorBoundary serviceName="SaaSStats">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Subs</div>
            <div className="text-2xl font-bold text-blue-600">{subscriptions.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">MRR</div>
            <div className="text-xl font-bold text-purple-600">
              ${mrr.toLocaleString()}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Renewing Soon</div>
            <div className="text-2xl font-bold text-yellow-600">{upcomingRenewalsCount}</div>
          </div>
        </div>
      </DashboardErrorBoundary>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Subscriptions */}
        <DashboardErrorBoundary serviceName="SAASSubscriptionsList">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Active Subscriptions</h3>
            {subscriptions.slice(0, 6).map(subscription => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        subscription.status === 'active' ? 'bg-green-500' :
                        subscription.status === 'trialing' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-gray-900 capitalize">{subscription.planId}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Qty: {subscription.quantity} • ${subscription.amount.toLocaleString()}/{subscription.currency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${(subscription.amount * subscription.quantity).toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {subscription.status}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                  <span>📅 Period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="text-red-600 font-medium">Cancels soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DashboardErrorBoundary>

        {/* Revenue by Plan & Upcoming Renewals */}
        <DashboardErrorBoundary serviceName="SaaSRevenue">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Revenue by Plan</h3>
            {Object.entries(revenueByPlan).map(([plan, revenue]) => (
              <div key={plan} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{plan.replace('-', ' ')}</div>
                    <div className="text-xs text-gray-500">Monthly revenue</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">${revenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((revenue / Math.max(...Object.values(revenueByPlan))) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            <h3 className="font-semibold text-gray-700 mt-6 mb-3">Upcoming Renewals</h3>
            {upcomingRenewals.length === 0 ? (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                No renewals this week
              </div>
            ) : (
              upcomingRenewals.map(sub => (
                <div key={sub.id} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-900 capitalize">{sub.planId}</div>
                    <div className="text-xs text-yellow-700">
                      Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    ${(sub.amount * sub.quantity).toLocaleString()} • {sub.quantity} seats
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardErrorBoundary>
      </div>
    </div>
  );
};
