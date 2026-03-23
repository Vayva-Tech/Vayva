// @ts-nocheck
'use client';

// ============================================================================
// Nonprofit Industry Dashboard Main Component
// ============================================================================

import React, { useState, useCallback } from 'react';
import type { IndustrySlug } from '@vayva/industry-core';
import {
  Heart,
  Users,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Flag,
  Briefcase,
  Award,
  Mail
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Local types & components (not exported by @vayva/industry-core)
// ---------------------------------------------------------------------------

interface UniversalDashboardProps {
  industry: IndustrySlug;
  variant?: string;
  userId?: string;
  businessId?: string;
  className?: string;
  onConfigChange?: (config: Record<string, unknown>) => void;
  onError?: (err: { code: string; message: string; retryable: boolean }) => void;
}

function useUniversalDashboard(_opts: {
  industry: IndustrySlug;
  variant?: string;
  userId?: string;
  businessId?: string;
}) {
  const [isValidating, setIsValidating] = useState(false);
  const refresh = useCallback(() => { setIsValidating(true); setTimeout(() => setIsValidating(false), 1000); }, []);
  return { data: null, config: null, loading: false, error: null as Error | null, lastUpdated: new Date(), refresh, isValidating };
}

function UniversalMetricCard({ title, value, change, icon, loading }: {
  title: string;
  value: string;
  change?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '▲' : '▼'} {change.value}%
            </p>
          )}
        </div>
        {icon && <div className="p-2 rounded-lg bg-gray-50">{icon}</div>}
      </div>
    </div>
  );
}

function UniversalSectionHeader({ title, subtitle, icon }: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

import type {
  ImpactOverviewProps,
  DonationTrendsProps,
  DonorSegmentsProps,
  ActiveCampaignsProps,
  GrantPipelineProps,
  ProgramImpactProps,
  EngagementMetricsProps,
  MajorDonorsProps,
  ActionRequiredProps
} from './components';

import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getDonorSegmentColor
} from './components';

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export function NonprofitDashboard({
  industry,
  variant,
  userId,
  businessId,
  className = '',
  onConfigChange,
  onError
}: UniversalDashboardProps) {
  const {
    data: dashboardData,
    config,
    loading,
    error,
    lastUpdated,
    refresh,
    isValidating
  } = useUniversalDashboard({
    industry: industry as IndustrySlug,
    variant,
    userId,
    businessId
  });

  if (error) {
    onError?.({
      code: 'DASHBOARD_ERROR',
      message: error.message,
      retryable: true
    });
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Nonprofit Impact Dashboard</h1>
          <p className="text-emerald-600 mt-1">
            Track donations, campaigns, and community impact
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isValidating}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isValidating ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Impact Overview */}
      <ImpactOverviewSection 
        data={{
          totalRaisedYTD: 2400000,
          activeDonors: 1847,
          campaignsLive: 12,
          yoyGrowth: 23,
          newDonors: 312,
          campaignsLaunching: 3
        }}
        loading={loading}
      />

      {/* Key Metrics Grid */}
      <section>
        <UniversalSectionHeader
          title="Key Performance Indicators"
          subtitle="Track your most important metrics"
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <UniversalMetricCard
            title="Total Raised YTD"
            value="$2.4M"
            change={{ value: 23, isPositive: true }}
            icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Active Donors"
            value="1,847"
            change={{ value: 17, isPositive: true }}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Active Campaigns"
            value="12"
            change={{ value: 3, isPositive: true }}
            icon={<Flag className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Donor Retention"
            value="76%"
            change={{ value: 5, isPositive: true }}
            icon={<Heart className="h-6 w-6 text-rose-600" />}
            loading={loading}
          />
        </div>
      </section>

      {/* Donation Trends & Donor Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DonationTrendsSection 
          data={{
            monthlyRevenue: [160000, 180000, 220000, 280000, 240000],
            averageGift: 1298,
            recurringPercentage: 42,
            majorDonors: [
              { name: 'Johnson Family', amount: 125000 },
              { name: 'Smith Foundation', amount: 85000 },
              { name: 'Corporate Give', amount: 67500 }
            ]
          }}
          loading={loading}
        />
        
        <DonorSegmentsSection 
          data={[
            { type: 'individual', percentage: 68, count: 1256 },
            { type: 'foundation', percentage: 18, count: 332 },
            { type: 'corporate', percentage: 10, count: 185 },
            { type: 'government', percentage: 4, count: 74 }
          ]}
          retentionRate={76}
          loading={loading}
        />
      </div>

      {/* Active Campaigns */}
      <ActiveCampaignsSection 
        campaigns={[
          {
            id: '1',
            name: 'Annual Fund 2026',
            goal: 500000,
            raised: 387000,
            percentage: 77,
            daysLeft: 45,
            status: 'on_track'
          },
          {
            id: '2',
            name: 'Building Renovation',
            goal: 250000,
            raised: 142000,
            percentage: 57,
            daysLeft: 89,
            status: 'needs_push'
          },
          {
            id: '3',
            name: 'Scholarship Program',
            goal: 100000,
            raised: 94000,
            percentage: 94,
            daysLeft: 12,
            status: 'almost_there'
          }
        ]}
        loading={loading}
      />

      {/* Grant Pipeline & Program Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GrantPipelineSection 
          pipeline={[
            { id: '1', funder: 'Gates Foundation', amount: 150000, deadline: '2026-04-30', status: 'submitted' },
            { id: '2', funder: 'Ford Foundation', amount: 75000, deadline: '2026-05-15', status: 'in_progress' },
            { id: '3', funder: 'MacArthur Foundation', amount: 200000, deadline: '2026-06-01', status: 'planning' }
          ]}
          awarded={890000}
          pending={340000}
          loading={loading}
        />
        
        <ProgramImpactSection 
          programs={[
            { program: 'Education', percentage: 45, amount: 1080000 },
            { program: 'Healthcare', percentage: 28, amount: 672000 },
            { program: 'Community', percentage: 18, amount: 432000 },
            { program: 'Research', percentage: 9, amount: 216000 }
          ]}
          impact={{
            peopleServed: 12847,
            communities: 34,
            volunteerHours: 8234,
            outcomesAchieved: 156,
            programsActive: 23,
            partnershipsFormed: 45,
            mediaMentions: 12,
            socialMediaReach: 28500
          }}
          loading={loading}
        />
      </div>

      {/* Engagement Metrics & Major Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementMetricsSection 
          data={{
            emailOpenRate: 28.4,
            socialFollowers: 45200,
            websiteVisitors: 12500,
            eventAttendance: 89
          }}
          loading={loading}
        />
        
        <MajorDonorsSection 
          donors={[
            { name: 'Johnson Family', amount: 125000, lastDonation: '2026-03-01' },
            { name: 'Smith Foundation', amount: 85000, lastDonation: '2026-02-28' },
            { name: 'Corporate Give', amount: 67500, lastDonation: '2026-03-05' },
            { name: 'Anonymous', amount: 50000, lastDonation: '2026-03-03' },
            { name: 'Williams Trust', amount: 45000, lastDonation: '2026-02-25' }
          ]}
          loading={loading}
        />
      </div>

      {/* Action Required */}
      <ActionRequiredSection 
        tasks={[
          {
            id: '1',
            title: 'Process matching gifts',
            description: '12 pending matching gift requests',
            priority: 'high',
            icon: 'Gift'
          },
          {
            id: '2',
            title: 'Review grant reports',
            description: 'Due April 25th',
            priority: 'medium',
            icon: 'FileText'
          }
        ]}
        alerts={[
          {
            id: '1',
            type: 'warning',
            title: 'Campaign needs attention',
            message: 'Building Renovation campaign at 57% - consider additional outreach',
          }
        ]}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Components
// ---------------------------------------------------------------------------

function ImpactOverviewSection({ data, loading }: ImpactOverviewProps) {
  return (
    <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-sm text-emerald-700 font-medium">Total Raised YTD</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {formatCurrency(data.totalRaisedYTD)}
          </p>
          <p className="text-sm text-emerald-600 mt-1">
            ▲ {data.yoyGrowth}% vs last year
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium">Active Donors</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {data.activeDonors.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            ▲ {data.newDonors} new this month
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-purple-700 font-medium">Campaigns Live</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {data.campaignsLive}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            ▲ {data.campaignsLaunching} launching soon
          </p>
        </div>
      </div>
    </section>
  );
}

function DonationTrendsSection({ data, loading }: DonationTrendsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Donation Trends"
        subtitle="Monthly revenue and donor metrics"
        icon={<BarChart3 className="h-5 w-5 text-emerald-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Monthly Donation Revenue</h3>
            <span className="text-sm text-gray-500">Last 5 months</span>
          </div>
          <div className="h-32 flex items-end space-x-2">
            {data.monthlyRevenue.map((amount, index) => (
              <div 
                key={index}
                className="flex-1 bg-emerald-200 rounded-t hover:bg-emerald-300 transition-colors"
                style={{ height: `${(amount / Math.max(...data.monthlyRevenue)) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg Gift</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(data.averageGift)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Recurring</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatPercentage(data.recurringPercentage)}
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Major Donors (&gt;$10K)</h4>
          <div className="space-y-2">
            {data.majorDonors.map((donor, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{donor.name}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(donor.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DonorSegmentsSection({ data, retentionRate, loading }: DonorSegmentsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Donor Segments"
        subtitle="Donor type distribution and retention"
        icon={<PieChart className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Donor Type Distribution</h3>
          <div className="space-y-3">
            {data.map((segment, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: getDonorSegmentColor(segment.type) }}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{segment.type}s</span>
                    <span>{formatPercentage(segment.percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${segment.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-700">Donor Retention Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatPercentage(retentionRate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveCampaignsSection({ campaigns, loading, onCampaignClick }: ActiveCampaignsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Active Campaigns"
        subtitle="Current fundraising initiatives"
        icon={<Target className="h-5 w-5 text-purple-600" />}
      />
      
      <div className="mt-6 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raised
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Left
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr 
                key={campaign.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onCampaignClick?.(campaign.id)}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {campaign.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatCurrency(campaign.goal)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatCurrency(campaign.raised)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatPercentage(campaign.percentage)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {campaign.daysLeft}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GrantPipelineSection({ pipeline, awarded, pending, loading }: GrantPipelineProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Grant Pipeline"
        subtitle="Funding opportunities and applications"
        icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">Awarded</p>
            <p className="text-xl font-bold text-green-900">
              {formatCurrency(awarded)}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="text-xl font-bold text-yellow-900">
              {formatCurrency(pending)}
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Upcoming Deadlines</h4>
          <div className="space-y-2">
            {pipeline.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.funder}</p>
                  <p className="text-sm text-gray-500">{item.deadline}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramImpactSection({ programs, impact, loading }: ProgramImpactProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Program Impact"
        subtitle="Funding allocation and outcomes"
        icon={<Award className="h-5 w-5 text-amber-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Programs Funded</h4>
          <div className="space-y-3">
            {programs.map((program, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{program.program}</span>
                    <span>{formatPercentage(program.percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${program.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-700">People Served</p>
            <p className="text-lg font-bold text-amber-900">
              {impact.peopleServed.toLocaleString()}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-700">Communities</p>
            <p className="text-lg font-bold text-amber-900">{impact.communities}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-700">Volunteer Hours</p>
            <p className="text-lg font-bold text-amber-900">
              {impact.volunteerHours.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EngagementMetricsSection({ data, loading }: EngagementMetricsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Engagement Metrics"
        subtitle="Communication and outreach performance"
        icon={<Mail className="h-5 w-5 text-rose-600" />}
      />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-rose-50 rounded-lg p-4 text-center">
          <p className="text-sm text-rose-700">Email Open Rate</p>
          <p className="text-2xl font-bold text-rose-900">
            {formatPercentage(data.emailOpenRate)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">Social Followers</p>
          <p className="text-2xl font-bold text-blue-900">
            {(data.socialFollowers / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-700">Website Visitors</p>
          <p className="text-2xl font-bold text-purple-900">
            {(data.websiteVisitors / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700">Event Attendance</p>
          <p className="text-2xl font-bold text-green-900">
            {formatPercentage(data.eventAttendance)}
          </p>
        </div>
      </div>
    </section>
  );
}

function MajorDonorsSection({ donors, loading }: MajorDonorsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Major Donors"
        subtitle="Top contributors this quarter"
        icon={<Users className="h-5 w-5 text-indigo-600" />}
      />
      
      <div className="mt-6 space-y-3">
        {donors.map((donor, index) => (
          <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{donor.name}</p>
              <p className="text-sm text-gray-500">{donor.lastDonation}</p>
            </div>
            <span className="font-semibold text-gray-900">
              {formatCurrency(donor.amount)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionRequiredSection({ tasks, alerts, loading }: ActionRequiredProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Action Required"
        subtitle="Tasks and alerts needing attention"
        icon={<Calendar className="h-5 w-5 text-orange-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Pending Tasks</h4>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-orange-900">{task.title}</p>
                  <p className="text-sm text-orange-700">{task.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Alerts</h4>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg ${
                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`font-medium ${
                  alert.type === 'error' ? 'text-red-900' :
                  alert.type === 'warning' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {alert.title}
                </p>
                <p className={`text-sm ${
                  alert.type === 'error' ? 'text-red-700' :
                  alert.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}