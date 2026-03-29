"use client";

import React from 'react';
import { UnifiedDashboard } from '../UnifiedDashboard';
import { MetricCard, TasksModule, RevenueChart, AlertsModule } from '../modules';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { FeatureGate } from '@/components/features/FeatureGate';
import { Stethoscope, Clock, Users, TrendingUp, FileText, Heart } from 'lucide-react';
import cn from 'clsx';

/**
 * Healthcare Dashboard - Industry-specific implementation
 * 
 * Features:
 * - Patient schedule and appointments
 * - EMR (Electronic Medical Records) integration (PRO+)
 * - Insurance claims tracking (PRO)
 * - Prescription management
 * - Telehealth statistics (PRO+)
 * - Wait time optimization
 */
export function HealthcareDashboard() {
  const { isVisible: showEMR, isHiddenByPlan: emrLockedByPlan } = useModuleVisibility(
    'emr-integration',
    { industry: 'healthcare', planTier: 'PRO', enabledFeatures: [] }
  );
  
  const { isVisible: showInsurance, isHiddenByPlan: insuranceLockedByPlan } = useModuleVisibility(
    'insurance-claims',
    { industry: 'healthcare', planTier: 'STARTER', enabledFeatures: [] }
  );
  
  const { isVisible: showTelehealth } = useModuleVisibility(
    'telehealth',
    { industry: 'healthcare', planTier: 'PRO', enabledFeatures: [] }
  );
  
  return (
    <UnifiedDashboard industry="healthcare" planTier="PRO">
      {/* Healthcare-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Patients Today"
          value={28}
          change={12}
          trend="up"
          icon={<Users size={16} />}
        />
        <MetricCard
          label="Avg Wait Time"
          value="18min"
          change={-15}
          trend="up"
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Monthly Revenue"
          value="₦2.4M"
          change={22}
          trend="up"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Active Treatments"
          value={156}
          change={8}
          trend="up"
          icon={<Heart size={16} />}
        />
      </div>
      
      {/* PRO Features: Insurance Claims */}
      <FeatureGate minPlan="PRO">
        {showInsurance && (
          <div className="mb-6">
            <InsuranceClaimsSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Locked Feature Prompt */}
      {insuranceLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Insurance Claims Management
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Track, submit, and manage insurance claims directly from your dashboard
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO
          </a>
        </div>
      )}
      
      {/* Patient Schedule */}
      <div className="mb-6">
        <PatientScheduleSection />
      </div>
      
      {/* PRO+ Features: EMR Integration */}
      <FeatureGate minPlan="PRO_PLUS">
        {showEMR && (
          <div className="mb-6">
            <EMRIntegrationSection />
          </div>
        )}
      </FeatureGate>
      
      {/* EMR Locked Prompt */}
      {emrLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock EMR Integration
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Access complete electronic medical records, patient history, and treatment plans
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO+
          </a>
        </div>
      )}
      
      {/* Healthcare Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          data={[
            { date: 'Week 1', value: 580000 },
            { date: 'Week 2', value: 645000 },
            { date: 'Week 3', value: 712000 },
            { date: 'Week 4', value: 890000 },
          ]}
          title="Monthly Revenue Trend"
          showTrend
        />
        
        <PatientStatusChart />
      </div>
      
      {/* Telehealth Stats (PRO+) */}
      <FeatureGate minPlan="PRO_PLUS">
        {showTelehealth && (
          <div className="mb-6">
            <TelehealthSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Healthcare-Specific Tasks */}
      <TasksModule
        tasks={[
          { id: '1', title: 'Review patient lab results', completed: false, priority: 'high' },
          { id: '2', title: 'Update medical records', completed: false, priority: 'medium' },
          { id: '3', title: 'Sign prescription refills', completed: false, priority: 'high' },
          { id: '4', title: 'Complete insurance forms', completed: true, priority: 'medium' },
          { id: '5', title: 'Call patients with test results', completed: false, priority: 'medium' },
        ]}
      />
      
      {/* Healthcare Alerts */}
      <AlertsModule
        alerts={[
          {
            id: 'critical-1',
            type: 'error',
            title: 'Critical Lab Result',
            message: 'Patient Adebayo Johnson has abnormal glucose levels - requires immediate attention',
            action: { label: 'Review now', onClick: () => console.log('Review lab') },
          },
          {
            id: 'supply-1',
            type: 'warning',
            title: 'Medical Supply Low',
            message: 'Syringes (10ml) running low (15 units remaining)',
            action: { label: 'Order supplies', href: '/dashboard/supplies/order' },
          },
          {
            id: 'appointment-1',
            type: 'info',
            title: 'Emergency Slot Available',
            message: '3:00 PM slot just opened up due to cancellation',
          },
        ]}
      />
    </UnifiedDashboard>
  );
}

// ============================================================================
// Healthcare-Specific Sub-Components
// ============================================================================

function PatientScheduleSection() {
  const patients = [
    { time: '9:00 AM', name: 'Chidinma Okafor', type: 'Follow-up', duration: '30min', doctor: 'Dr. Adeleke' },
    { time: '9:45 AM', name: 'Emeka Obi', type: 'New Patient', duration: '45min', doctor: 'Dr. Bello' },
    { time: '10:30 AM', name: 'Fatima Hassan', type: 'Consultation', duration: '30min', doctor: 'Dr. Adeleke' },
    { time: '11:15 AM', name: 'Godwin Eze', type: 'Lab Review', duration: '20min', doctor: 'Dr. Coker' },
    { time: '12:00 PM', name: 'Halima Yusuf', type: 'Vaccination', duration: '15min', doctor: 'Dr. Bello' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" />
          Patient Schedule
        </h3>
        <div className="flex items-center gap-2">
          <a href="/dashboard/schedule" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View full schedule
          </a>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium">
            <span>+ Add Patient</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {patients.map((patient, idx) => (
          <PatientRow key={idx} {...patient} />
        ))}
      </div>
    </div>
  );
}

function PatientRow({
  time,
  name,
  type,
  duration,
  doctor,
}: {
  time: string;
  name: string;
  type: string;
  duration: string;
  doctor: string;
}) {
  const typeColors: Record<string, string> = {
    'Follow-up': 'bg-blue-50 text-blue-700',
    'New Patient': 'bg-green-50 text-green-700',
    'Consultation': 'bg-purple-50 text-purple-700',
    'Lab Review': 'bg-amber-50 text-amber-700',
    'Vaccination': 'bg-red-50 text-red-700',
  };
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="text-center min-w-[70px]">
        <div className="text-sm font-bold text-gray-900">{time}</div>
        <div className="text-xs text-gray-500">{duration}</div>
      </div>
      
      <div className="w-1 h-12 bg-blue-500 rounded-full" />
      
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">Dr. {doctor}</div>
      </div>
      
      <div className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium',
        typeColors[type] || 'bg-gray-100 text-gray-700'
      )}>
        {type}
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-white transition-colors" title="View Record">
          <FileText size={16} className="text-gray-400" />
        </button>
        <button className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Check-in">
          <Stethoscope size={16} className="text-green-600" />
        </button>
      </div>
    </div>
  );
}

function InsuranceClaimsSection() {
  const claims = [
    { id: 'CLM-2024-001', patient: 'Adebayo Johnson', amount: '₦125,000', status: 'pending', submitted: '2 days ago' },
    { id: 'CLM-2024-002', patient: 'Blessing Okon', amount: '₦89,000', status: 'approved', submitted: '5 days ago' },
    { id: 'CLM-2024-003', patient: 'Chidi Okafor', amount: '₦234,000', status: 'review', submitted: '1 week ago' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" />
          Insurance Claims Tracker
        </h3>
        <a href="/dashboard/insurance" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Manage claims
        </a>
      </div>
      
      <div className="space-y-3">
        {claims.map((claim) => (
          <ClaimRow key={claim.id} {...claim} />
        ))}
      </div>
    </div>
  );
}

function ClaimRow({
  id,
  patient,
  amount,
  status,
  submitted,
}: {
  id: string;
  patient: string;
  amount: string;
  status: string;
  submitted: string;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    review: 'bg-blue-50 text-blue-700',
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div>
        <div className="font-semibold text-gray-900">{id}</div>
        <div className="text-sm text-gray-600">{patient}</div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-gray-900">{amount}</div>
        <div className="text-xs text-gray-500">{submitted}</div>
      </div>
      
      <div className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium',
        statusColors[status] || 'bg-gray-100 text-gray-700'
      )}>
        {status.toUpperCase()}
      </div>
    </div>
  );
}

function EMRIntegrationSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Stethoscope size={20} className="text-indigo-500" />
          Electronic Medical Records
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">
          Live Sync
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EMRStatCard label="Total Patients" value="1,248" icon={Users} color="blue" />
        <EMRStatCard label="Active Treatments" value="156" icon={Heart} color="red" />
        <EMRStatCard label="Pending Reviews" value="23" icon={FileText} color="amber" />
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Records</h4>
        <div className="space-y-2">
          <EMRRecordRow patient="Adebayo Johnson" condition="Type 2 Diabetes" lastVisit="Today" />
          <EMRRecordRow patient="Blessing Okon" condition="Hypertension" lastVisit="Yesterday" />
          <EMRRecordRow patient="Chidi Okafor" condition="Migraine" lastVisit="2 days ago" />
        </div>
      </div>
    </div>
  );
}

function EMRStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={cn('p-2 rounded-lg', colors[color])}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function EMRRecordRow({
  patient,
  condition,
  lastVisit,
}: {
  patient: string;
  condition: string;
  lastVisit: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div>
        <div className="font-medium text-gray-900">{patient}</div>
        <div className="text-sm text-gray-600">{condition}</div>
      </div>
      <div className="text-sm text-gray-500">{lastVisit}</div>
    </div>
  );
}

function PatientStatusChart() {
  const statuses = [
    { label: 'In Treatment', value: 156, color: '#3b82f6' },
    { label: 'Recovered', value: 89, color: '#10b981' },
    { label: 'Critical', value: 12, color: '#ef4444' },
    { label: 'Under Observation', value: 34, color: '#f59e0b' },
  ];
  
  let cumulativePercent = 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Patient Status Overview</h3>
      
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${statuses.map(seg => {
                const start = cumulativePercent;
                cumulativePercent += (seg.value / 291) * 100;
                return `${seg.color} ${start}% ${cumulativePercent}%`;
              }).join(', ')})`,
            }}
          />
          <div className="absolute inset-2 bg-white rounded-full" />
        </div>
        
        <div className="flex-1 space-y-2">
          {statuses.map((status, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-xs text-gray-600">{status.label}</span>
              <span className="text-xs font-semibold text-gray-900 ml-auto">
                {status.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">Total Patients</span>
        <p className="text-lg font-bold text-gray-900">291</p>
      </div>
    </div>
  );
}

function TelehealthSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-cyan-500" />
          Telehealth Statistics
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-cyan-50 text-cyan-700">
          PRO+ Feature
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TelehealthMetric label="Video Consultations" value={45} change={28} />
        <TelehealthMetric label="Phone Consultations" value={23} change={-5 } />
        <TelehealthMetric label="Avg Session Duration" value="24min" change={12} />
      </div>
    </div>
  );
}

function TelehealthMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: number | string;
  change: number;
}) {
  return (
    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
      <div className="text-sm text-cyan-700 mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={cn(
        'text-xs font-medium mt-1 flex items-center gap-1',
        change >= 0 ? 'text-green-600' : 'text-red-600'
      )}>
        <TrendingUp size={10} className={cn('transform', change < 0 && 'rotate-180')} />
        {Math.abs(change)}%
      </div>
    </div>
  );
}
