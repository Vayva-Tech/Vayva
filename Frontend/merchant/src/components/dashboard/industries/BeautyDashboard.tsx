"use client";

import React from 'react';
import { UnifiedDashboard } from '../UnifiedDashboard';
import { MetricCard, TasksModule, RevenueChart, OrderStatusChart, AlertsModule } from '../modules';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { FeatureGate } from '@/components/features/FeatureGate';
import { Scissors, Clock, Users, TrendingUp, Star, Calendar } from 'lucide-react';
import cn from 'clsx';

/**
 * Beauty & Wellness Dashboard - Industry-specific implementation
 * 
 * Features:
 * - Appointment calendar and scheduling
 * - Client history and preferences
 * - Service menu management
 * - Product retail tracking
 * - Commission tracking for staff (PRO+)
 * - Client retention analytics (PRO+)
 */
export function BeautyDashboard() {
  const { isVisible: showCommission, isHiddenByPlan: commissionLockedByPlan } = useModuleVisibility(
    'commission-tracking',
    { industry: 'beauty-wellness', planTier: 'PRO', enabledFeatures: [] }
  );
  
  const { isVisible: showAdvancedAnalytics } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'beauty-wellness', planTier: 'PRO', enabledFeatures: [] }
  );
  
  return (
    <UnifiedDashboard industry="beauty-wellness" planTier="PRO">
      {/* Beauty-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Today's Appointments"
          value={12}
          change={5}
          trend="up"
          icon={<Calendar size={16} />}
        />
        <MetricCard
          label="Client Retention"
          value="78%"
          change={3}
          trend="up"
          icon={<Users size={16} />}
        />
        <MetricCard
          label="Avg Service Value"
          value="₦8,500"
          change={-5}
          trend="down"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Retail Sales"
          value="₦145,000"
          change={18}
          trend="up"
          icon={<Star size={16} />}
        />
      </div>
      
      {/* PRO+ Features: Commission Tracking */}
      <FeatureGate minPlan="PRO_PLUS">
        {showCommission && (
          <div className="mb-6">
            <CommissionTrackingSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Locked Feature Prompt */}
      {commissionLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Commission Tracking
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Track staff commissions, performance bonuses, and automated payout calculations
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO+
          </a>
        </div>
      )}
      
      {/* Appointment Calendar */}
      <div className="mb-6">
        <AppointmentCalendarSection />
      </div>
      
      {/* Beauty Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          data={[
            { date: 'Mon', value: 185000 },
            { date: 'Tue', value: 234000 },
            { date: 'Wed', value: 198000 },
            { date: 'Thu', value: 276000 },
            { date: 'Fri', value: 389000 },
            { date: 'Sat', value: 445000 },
            { date: 'Sun', value: 298000 },
          ]}
          title="Weekly Revenue"
          showTrend
        />
        
        <ServiceBreakdownChart />
      </div>
      
      {/* Client Retention (PRO+ Analytics) */}
      <FeatureGate minPlan="PRO_PLUS">
        {showAdvancedAnalytics && (
          <div className="mb-6">
            <ClientRetentionSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Beauty-Specific Tasks */}
      <TasksModule
        tasks={[
          { id: '1', title: 'Confirm today\'s appointments', completed: false, priority: 'high' },
          { id: '2', title: 'Prepare treatment rooms', completed: false, priority: 'medium' },
          { id: '3', title: 'Review client notes', completed: false, priority: 'low' },
          { id: '4', title: 'Restock product inventory', completed: true, priority: 'medium' },
          { id: '5', title: 'Update service menu', completed: false, priority: 'low' },
        ]}
      />
      
      {/* Beauty Alerts */}
      <AlertsModule
        alerts={[
          {
            id: 'appointment-1',
            type: 'info',
            title: 'VIP Client Arriving Soon',
            message: 'Chioma Okonkwo has a reservation in 30 minutes (Hair Treatment)',
          },
          {
            id: 'product-1',
            type: 'warning',
            title: 'Low Product Stock',
            message: 'Argan Oil running low (2 bottles remaining)',
            action: { label: 'Reorder now', href: '/dashboard/products/restock' },
          },
          {
            id: 'review-1',
            type: 'success',
            title: 'New 5-Star Review! 🌟',
            message: '"Best salon experience ever! The staff was amazing!" - Adaora N.',
          },
        ]}
      />
    </UnifiedDashboard>
  );
}

// ============================================================================
// Beauty-Specific Sub-Components
// ============================================================================

function AppointmentCalendarSection() {
  const appointments = [
    { time: '9:00 AM', client: 'Blessing A.', service: 'Hair Braiding', duration: '2h', staff: 'Ngozi' },
    { time: '10:30 AM', client: 'Chidinma O.', service: 'Facial Treatment', duration: '1h', staff: 'Amara' },
    { time: '12:00 PM', client: 'Funmilayo R.', service: 'Manicure + Pedicure', duration: '1.5h', staff: 'Bose' },
    { time: '2:00 PM', client: 'Ijeoma K.', service: 'Full Hair Styling', duration: '2.5h', staff: 'Ngozi' },
    { time: '4:30 PM', client: 'Kemi S.', service: 'Makeup Application', duration: '1h', staff: 'Amara' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-purple-500" />
          Today's Appointments
        </h3>
        <div className="flex items-center gap-2">
          <a href="/dashboard/appointments" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View calendar
          </a>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium">
            <span>+ Book Now</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {appointments.map((apt, idx) => (
          <AppointmentRow key={idx} {...apt} />
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({
  time,
  client,
  service,
  duration,
  staff,
}: {
  time: string;
  client: string;
  service: string;
  duration: string;
  staff: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
      <div className="text-center min-w-[70px]">
        <div className="text-sm font-bold text-gray-900">{time}</div>
        <div className="text-xs text-gray-500">{duration}</div>
      </div>
      
      <div className="w-1 h-12 bg-purple-500 rounded-full" />
      
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{client}</div>
        <div className="text-sm text-gray-600">{service}</div>
      </div>
      
      <div className="text-right">
        <div className="text-xs text-gray-500">Staff</div>
        <div className="text-sm font-medium text-gray-700">{staff}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-white transition-colors" title="Edit">
          <Scissors size={16} className="text-gray-400" />
        </button>
        <button className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Check-in">
          <Clock size={16} className="text-green-600" />
        </button>
      </div>
    </div>
  );
}

function ServiceBreakdownChart() {
  const services = [
    { label: 'Hair Services', value: 45, color: '#a855f7', count: 28 },
    { label: 'Skin Care', value: 25, color: '#ec4899', count: 15 },
    { label: 'Nail Services', value: 20, color: '#f59e0b', count: 12 },
    { label: 'Makeup', value: 10, color: '#3b82f6', count: 6 },
  ];
  
  let cumulativePercent = 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Services Breakdown</h3>
      
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${services.map(seg => {
                const start = cumulativePercent;
                cumulativePercent += seg.value;
                return `${seg.color} ${start}% ${cumulativePercent}%`;
              }).join(', ')})`,
            }}
          />
          <div className="absolute inset-2 bg-white rounded-full" />
        </div>
        
        <div className="flex-1 space-y-2">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: service.color }}
              />
              <span className="text-xs text-gray-600">{service.label}</span>
              <span className="text-xs font-semibold text-gray-900 ml-auto">
                {service.count}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">Total Services This Week</span>
        <p className="text-lg font-bold text-gray-900">61</p>
      </div>
    </div>
  );
}

function CommissionTrackingSection() {
  const staffMembers = [
    { name: 'Ngozi O.', services: 18, revenue: '₦245,000', commission: '₦36,750', target: 85 },
    { name: 'Amara K.', services: 15, revenue: '₦198,000', commission: '₦29,700', target: 78 },
    { name: 'Bose A.', services: 12, revenue: '₦156,000', commission: '₦23,400', target: 65 },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star size={20} className="text-purple-500" />
          Staff Commission Tracker
        </h3>
        <a href="/dashboard/commissions" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          Manage commissions
        </a>
      </div>
      
      <div className="space-y-4">
        {staffMembers.map((staff, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-900">{staff.name}</div>
              <div className="text-sm font-bold text-purple-600">{staff.commission}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500">Services</div>
                <div className="text-sm font-semibold text-gray-900">{staff.services}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Revenue</div>
                <div className="text-sm font-semibold text-gray-900">{staff.revenue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Target</div>
                <div className="text-sm font-semibold text-gray-900">{staff.target}%</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${staff.target}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientRetentionSection() {
  const retentionMetrics = {
    overall: 78,
    newClients: 45,
    returningClients: 89,
    atRisk: 12,
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} className="text-purple-500" />
          Client Retention Analytics
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-50 text-purple-700">
          PRO+ Feature
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <RetentionMetricCard label="Overall Retention" value={`${retentionMetrics.overall}%`} change={3} />
        <RetentionMetricCard label="New Clients" value={`${retentionMetrics.newClients}%`} change={-5} trend="down" />
        <RetentionMetricCard label="Returning Clients" value={`${retentionMetrics.returningClients}%`} change={8} />
        <RetentionMetricCard label="At Risk" value={retentionMetrics.atRisk} change={-2} trend="down" suffix="clients" />
      </div>
      
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Star size={16} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">AI Insight</h4>
            <p className="text-sm text-gray-700">
              Clients who book within 4 weeks have 92% retention rate. Consider sending automated reminders at 3-week mark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RetentionMetricCard({
  label,
  value,
  change,
  trend = 'up',
  suffix = '',
}: {
  label: string;
  value: string | number;
  change: number;
  trend?: 'up' | 'down';
  suffix?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value}{suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
      </div>
      <div className={cn(
        'text-xs font-medium mt-1 flex items-center gap-1',
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      )}>
        <TrendingUp size={10} className={cn('transform', trend === 'down' && 'rotate-180')} />
        {Math.abs(change)}%
      </div>
    </div>
  );
}
