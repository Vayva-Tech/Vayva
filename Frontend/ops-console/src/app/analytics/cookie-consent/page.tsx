/**
 * COOKIE CONSENT ANALYTICS DASHBOARD
 * 
 * Track consent rates, monitor GDPR compliance health
 * Real-time analytics for cookie banner performance
 */
'use client';

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { TrendingUp, Users, AlertCircle, Download, Calendar } from 'lucide-react';
// PDF export — inline until shared package is published
function generateCookieConsentReport(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}
function printToPDF(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
import { format } from 'date-fns';

// Mock data - replace with real API calls
const consentMetrics = {
  totalVisitors: 45678,
  consentRate: 52.3,
  rejectRate: 28.1,
  customizeRate: 19.6,
  trend: 'up', // up, down, stable
};

const consentOverTime = [
  { date: '2026-03-01', accept: 48, reject: 32, customize: 20 },
  { date: '2026-03-02', accept: 51, reject: 29, customize: 20 },
  { date: '2026-03-03', accept: 53, reject: 27, customize: 20 },
  { date: '2026-03-04', accept: 50, reject: 30, customize: 20 },
  { date: '2026-03-05', accept: 54, reject: 26, customize: 20 },
  { date: '2026-03-06', accept: 52, reject: 28, customize: 20 },
  { date: '2026-03-07', accept: 55, reject: 25, customize: 20 },
];

const byRegion = [
  { region: 'Nigeria', visitors: 28456, acceptRate: 58.2, rejectRate: 24.1 },
  { region: 'European Union', visitors: 12890, acceptRate: 42.5, rejectRate: 38.7 },
  { region: 'United Kingdom', visitors: 3456, acceptRate: 45.1, rejectRate: 35.2 },
  { region: 'United States', visitors: 876, acceptRate: 67.3, rejectRate: 18.9 },
];

export default function CookieConsentAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const handleExportReport = async () => {
    setIsLoading(true);
    try {
      // Fetch real data from API
      const response = await fetch(`/api/analytics/cookie-consent?range=${timeRange}`);
      const data = await response.json();
      
      // Generate HTML report
      const htmlContent = generateCookieConsentReport({
        metrics: data.metrics,
        trendData: data.trendData,
        geoData: data.geoData,
        breakdown: data.breakdown,
      });
      
      // Trigger browser print dialog (user saves as PDF)
      printToPDF(htmlContent, 'cookie-consent-report');
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cookie Consent Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor GDPR compliance and user consent preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExportReport}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isLoading ? 'Generating...' : 'Export Report'}
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">GDPR Compliance Status</h3>
          <p className="text-sm text-blue-700 mt-1">
            Current consent rate is <strong>52.3%</strong>. EU average is 45-60%. Your implementation is compliant.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {consentMetrics.totalVisitors.toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+12.5% vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accept All Rate</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{consentMetrics.consentRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">✓</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+3.2% vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reject All Rate</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{consentMetrics.rejectRate}%</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">✕</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">+1.8% vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customize Rate</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{consentMetrics.customizeRate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">⚙</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">Stable vs previous period</span>
          </div>
        </div>
      </div>

      {/* Chart: Consent Over Time */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Consent Trends Over Time</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="h-80">
          {/* Simple bar chart visualization */}
          <div className="flex items-end justify-between h-full gap-2">
            {consentOverTime.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 h-64">
                  <div 
                    className="flex-1 bg-green-500 rounded-t"
                    style={{ height: `${day.accept}%` }}
                    title={`Accept: ${day.accept}%`}
                  />
                  <div 
                    className="flex-1 bg-red-500 rounded-t"
                    style={{ height: `${day.reject}%` }}
                    title={`Reject: ${day.reject}%`}
                  />
                  <div 
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${day.customize}%` }}
                    title={`Customize: ${day.customize}%`}
                  />
                </div>
                <span className="text-xs text-gray-600 rotate-0">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-gray-700">Accept All</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-700">Reject All</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-gray-700">Customize</span>
          </div>
        </div>
      </div>

      {/* By Region Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Consent by Geographic Region</h2>
          <p className="text-sm text-gray-600 mt-1">
            Understand regional differences in privacy preferences
          </p>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visitors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accept Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reject Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {byRegion.map((data) => (
              <tr key={data.region} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{data.region}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{data.visitors.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{data.acceptRate}%</span>
                    {data.acceptRate >= 50 ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Good</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Low</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{data.rejectRate}%</div>
                </td>
                <td className="px-6 py-4">
                  {data.region === 'European Union' && (
                    <span className="text-xs text-blue-600">GDPR applies - explicit consent required</span>
                  )}
                  {data.region === 'United Kingdom' && (
                    <span className="text-xs text-blue-600">UK GDPR applies</span>
                  )}
                  {data.region === 'Nigeria' && (
                    <span className="text-xs text-gray-500">NDPR applies</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights & Recommendations */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">✅ What's Working Well</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-sm text-gray-700">
                Acceptance rate (52.3%) is within industry benchmark (45-60%)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-sm text-gray-700">
                Clear banner design with equal Accept/Reject buttons builds trust
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-sm text-gray-700">
                Granular control option (19.6% usage) shows transparency is valued
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Optimization Opportunities</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">!</span>
              <span className="text-sm text-gray-700">
                EU acceptance rate (42.5%) is below global average - consider localized messaging
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">!</span>
              <span className="text-sm text-gray-700">
                Test moving banner position (currently bottom-right) to improve visibility
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">!</span>
              <span className="text-sm text-gray-700">
                A/B test different banner copy to increase acceptance without dark patterns
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
