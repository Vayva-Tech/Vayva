/**
 * Ops Console - AI Credit & Revenue Monitoring Dashboard
 * =======================================================
 * Admin view to monitor merchant AI credit usage, revenue, costs, and profitability
 */

'use client';

import React, { useState, useEffect } from 'react';

interface MerchantSubscription {
  storeId: string;
  storeName: string;
  planKey: string;
  totalCreditsPurchased: number;
  creditsRemaining: number;
  creditsUsed: number;
  percentageUsed: number;
  isLowCredit: boolean;
  lastTopupAt: Date | null;
  status: string;
}

interface AIAnalytics {
  revenue: {
    totalKobo: number;
    totalNaira: string;
    creditsSold: number;
    transactions: number;
  };
  costs: {
    totalKobo: number;
    totalNaira: string;
    requests: number;
    tokens: number;
  };
  profit: {
    grossKobo: number;
    grossNaira: string;
    marginPercent: number;
    roi: string;
  };
  insights: string[];
}

export default function OpsAICreditsDashboard() {
  const [subscriptions, setSubscriptions] = useState<MerchantSubscription[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lowCreditOnly, setLowCreditOnly] = useState(false);
  const [sort, setSort] = useState('percentageUsed');
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchData();
  }, [filter, lowCreditOnly, sort, period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both subscriptions and analytics in parallel
      const [subsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/ops/ai-credits?filter=${filter}&lowCreditOnly=${lowCreditOnly}&sort=${sort}`),
        fetch(`/api/ops/ai-analytics?period=${period}`),
      ]);

      if (!subsResponse.ok) throw new Error('Failed to fetch subscriptions');
      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');

      const subsResult = await subsResponse.json();
      const analyticsResult = await analyticsResponse.json();

      setSubscriptions(subsResult.data);
      setAnalytics(analyticsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Business Analytics</h1>
        <p className="text-gray-600">Monitor AI credit usage, revenue, costs, and profitability</p>
      </div>

      {/* Revenue & Profit Analytics */}
      {analytics && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Performance</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Total Revenue (Period)</p>
                <p className="text-3xl font-bold text-green-600">₦{analytics.revenue.totalNaira}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.revenue.transactions} transactions</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Infrastructure Costs</p>
                <p className="text-3xl font-bold text-red-600">₦{analytics.costs.totalNaira}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.costs.requests.toLocaleString()} requests</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Gross Profit</p>
                <p className={`text-3xl font-bold ${
                  parseFloat(analytics.profit.grossNaira) > 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  ₦{analytics.profit.grossNaira}
                </p>
                <p className="text-xs text-gray-500 mt-1">ROI: {analytics.profit.roi}%</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
                <p className={`text-3xl font-bold ${
                  analytics.profit.marginPercent > 50 ? 'text-green-600' :
                  analytics.profit.marginPercent > 20 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analytics.profit.marginPercent}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Target: 60%+</p>
              </div>
            </div>
          </div>

          {/* Business Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Business Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-lg">{insight.charAt(0)}</span>
                  <p className="text-sm text-blue-800">{insight.substring(3)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Period Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Merchants</option>
              <option value="low">Low Credit (&lt;200)</option>
              <option value="high_usage">High Usage (&gt;80%)</option>
              <option value="recent_topup">Recent Top-up (7 days)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowCreditOnly}
              onChange={(e) => setLowCreditOnly(e.target.checked)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm font-medium text-gray-700">Low Credit Only</span>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Merchants</option>
              <option value="low">Low Credit (&lt;200)</option>
              <option value="high_usage">High Usage (&gt;80%)</option>
              <option value="recent_topup">Recent Top-up (7 days)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="percentageUsed">% Used (High to Low)</option>
              <option value="creditsRemaining">Credits Remaining</option>
              <option value="totalCreditsPurchased">Total Purchased</option>
              <option value="storeName">Store Name</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowCreditOnly}
              onChange={(e) => setLowCreditOnly(e.target.checked)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm font-medium text-gray-700">Low Credit Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue (Est.)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Top-up
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.storeId} className={sub.isLowCredit ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sub.storeName}</div>
                    <div className="text-xs text-gray-500">{sub.storeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {sub.planKey}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sub.creditsRemaining.toLocaleString()} / {sub.totalCreditsPurchased.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            sub.percentageUsed > 90 ? 'bg-red-500' :
                            sub.percentageUsed > 70 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${sub.percentageUsed}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{sub.percentageUsed}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ₦{((sub.creditsUsed * 3) / 1000).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sub.creditsUsed.toLocaleString()} credits used
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.isLowCredit ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded animate-pulse">
                        LOW CREDIT
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.lastTopupAt ? new Date(sub.lastTopupAt).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Platform Economics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Average Revenue per Merchant</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{analytics ? (parseFloat(analytics.revenue.totalNaira) / (subscriptions.length || 1)).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Avg Cost to Serve</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{analytics ? (parseFloat(analytics.costs.totalNaira) / (analytics.costs.requests || 1)).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500">per request</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Credits in Circulation</p>
            <p className="text-2xl font-bold text-blue-600">
              {subscriptions.reduce((sum, s) => sum + s.creditsRemaining, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">unconsumed liability</p>
          </div>
        </div>
      </div>
    </div>
  );
}
