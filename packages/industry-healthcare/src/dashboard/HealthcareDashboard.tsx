// @ts-nocheck
// ============================================================================
// Healthcare Industry Dashboard Main Component
// ============================================================================

'use client';

import React from 'react';
import type { 
  UniversalDashboardProps,
  IndustrySlug 
} from '@vayva/industry-core';
import { 
  useUniversalDashboard,
  UniversalMetricCard,
  UniversalSectionHeader,
  UniversalChartContainer
} from '@vayva/ui';
import { 
  Activity,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Stethoscope,
  UserPlus,
  Phone,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import type {
  AppointmentsTodayProps,
  PatientDemographicsProps,
  WaitTimeTrackerProps,
  AppointmentTypesProps,
  ProviderUtilizationProps,
  TelemedicineMetricsProps,
  RevenueCycleProps,
  PatientSatisfactionProps
} from './components';

import {
  formatCurrency,
  formatPercentage,
  formatDuration,
  getStatusColor,
  getPriorityColor
} from './components';

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export function HealthcareDashboard({
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
          <h1 className="text-3xl font-bold text-blue-800">Healthcare Dashboard</h1>
          <p className="text-blue-600 mt-1">
            Track patient care, appointments, and clinical operations
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isValidating ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Key Metrics Grid */}
      <section>
        <UniversalSectionHeader
          title="Key Performance Indicators"
          subtitle="Track your most important metrics"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <UniversalMetricCard
            title="Appointments Today"
            value="47"
            change={{ value: 12, isPositive: true }}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Total Patients"
            value="2,847"
            change={{ value: 8, isPositive: true }}
            icon={<Users className="h-6 w-6 text-green-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Avg Wait Time"
            value="18 min"
            change={{ value: -5, isPositive: true }}
            icon={<Clock className="h-6 w-6 text-amber-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Fulfillment Rate"
            value="94%"
            change={{ value: 3, isPositive: true }}
            icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
        </div>
      </section>

      {/* Appointments Today & Patient Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AppointmentsTodaySection 
          appointments={[
            { id: '1', patientName: 'John Smith', type: 'Follow-up', time: '09:00 AM', provider: 'Dr. Sarah Chen', status: 'completed' },
            { id: '2', patientName: 'Maria Garcia', type: 'New Patient', time: '09:30 AM', provider: 'Dr. James Wilson', status: 'in_progress' },
            { id: '3', patientName: 'Robert Johnson', type: 'Telemedicine', time: '10:00 AM', provider: 'Dr. Emily Rodriguez', status: 'checked_in' },
            { id: '4', patientName: 'Lisa Wong', type: 'Procedure', time: '10:30 AM', provider: 'Dr. Michael Brown', status: 'scheduled' },
            { id: '5', patientName: 'David Miller', type: 'Consultation', time: '11:00 AM', provider: 'Dr. Sarah Chen', status: 'scheduled' }
          ]}
          totalToday={47}
          completed={23}
          noShows={2}
          loading={loading}
        />
        
        <PatientDemographicsSection 
          data={{
            totalPatients: 2847,
            newThisMonth: 312,
            ageDistribution: { '0-18': 15, '19-35': 28, '36-50': 24, '51-65': 20, '65+': 13 },
            genderDistribution: { male: 48, female: 51, other: 1 },
            topInsuranceProviders: [
              { name: 'Blue Cross Blue Shield', percentage: 35 },
              { name: 'Aetna', percentage: 22 },
              { name: 'UnitedHealth', percentage: 18 },
              { name: 'Medicare', percentage: 15 }
            ]
          }}
          loading={loading}
        />
      </div>

      {/* Wait Time Tracker */}
      <WaitTimeTrackerSection 
        data={{
          currentWait: 18,
          averageWait: 22,
          targetWait: 15,
          trend: 'improving',
          byDepartment: [
            { department: 'Emergency', wait: 45, target: 30 },
            { department: 'Primary Care', wait: 18, target: 15 },
            { department: 'Specialty', wait: 12, target: 10 },
            { department: 'Urgent Care', wait: 25, target: 20 }
          ]
        }}
        loading={loading}
      />

      {/* Appointment Types & Provider Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AppointmentTypesSection 
          data={{
            byType: {
              'in_person': 342,
              'telemedicine': 128,
              'home_visit': 45,
              'emergency': 23
            },
            bySpecialty: [
              { specialty: 'Family Medicine', count: 189 },
              { specialty: 'Pediatrics', count: 142 },
              { specialty: 'Internal Medicine', count: 128 },
              { specialty: 'Cardiology', count: 89 },
              { specialty: 'Orthopedics', count: 67 }
            ],
            telemedicineUtilization: 27
          }}
          loading={loading}
        />
        
        <ProviderUtilizationSection 
          providers={[
            { id: '1', name: 'Dr. Sarah Chen', specialty: 'Family Medicine', patients: 89, utilization: 87, rating: 4.8, nextAvailable: '2:30 PM' },
            { id: '2', name: 'Dr. James Wilson', specialty: 'Pediatrics', patients: 76, utilization: 92, rating: 4.9, nextAvailable: 'Tomorrow' },
            { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Internal Medicine', patients: 82, utilization: 85, rating: 4.7, nextAvailable: '3:00 PM' },
            { id: '4', name: 'Dr. Michael Brown', specialty: 'Cardiology', patients: 64, utilization: 78, rating: 4.8, nextAvailable: '4:15 PM' }
          ]}
          averageUtilization={85}
          loading={loading}
        />
      </div>

      {/* Telemedicine Metrics & Revenue Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TelemedicineMetricsSection 
          data={{
            sessionsToday: 12,
            sessionsThisMonth: 128,
            averageDuration: 24,
            satisfactionScore: 4.6,
            technicalIssues: 2,
            modalities: {
              video: 78,
              phone: 18,
              chat: 4
            }
          }}
          loading={loading}
        />
        
        <RevenueCycleSection 
          data={{
            revenueThisMonth: 285000,
            revenueLastMonth: 268000,
            growth: 6.3,
            claimsPending: 145,
            claimsDenied: 12,
            denialRate: 4.2,
            averageReimbursement: 185
          }}
          loading={loading}
        />
      </div>

      {/* Patient Satisfaction */}
      <PatientSatisfactionSection 
        data={{
          overallSatisfaction: 4.7,
          responseRate: 68,
          totalReviews: 847,
          categories: {
            waitTime: 4.3,
            providerCare: 4.8,
            staffFriendliness: 4.7,
            facilityCleanliness: 4.9,
            easeOfScheduling: 4.6
          },
          recentFeedback: [
            { id: '1', rating: 5, comment: 'Excellent care from Dr. Chen', date: '2026-03-10' },
            { id: '2', rating: 4, comment: 'Short wait, very professional', date: '2026-03-09' },
            { id: '3', rating: 5, comment: 'Best healthcare experience ever', date: '2026-03-08' }
          ]
        }}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Components
// ---------------------------------------------------------------------------

function AppointmentsTodaySection({ appointments, totalToday, completed, noShows, loading }: AppointmentsTodayProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Appointments Today"
        subtitle={`${totalToday} scheduled • ${completed} completed`}
        icon={<Calendar className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment.status)}`} />
              <div>
                <p className="font-medium text-gray-900">{appointment.patientName}</p>
                <p className="text-sm text-gray-500">{appointment.type} • {appointment.provider}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalToday}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900">{completed}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-red-600">No-Shows</p>
          <p className="text-2xl font-bold text-red-900">{noShows}</p>
        </div>
      </div>
    </section>
  );
}

function PatientDemographicsSection({ data, loading }: PatientDemographicsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Patient Demographics"
        subtitle="Population health overview"
        icon={<Users className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">Total Patients</p>
            <p className="text-2xl font-bold text-blue-900">{data.totalPatients.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">New This Month</p>
            <p className="text-2xl font-bold text-green-900">{data.newThisMonth}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Age Distribution</h4>
          <div className="flex h-3 gap-1">
            {Object.entries(data.ageDistribution).map(([ageRange, percentage]) => (
              <div 
                key={ageRange}
                className="bg-blue-500 rounded-full"
                style={{ width: `${percentage}%` }}
                title={`${ageRange}: ${percentage}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {Object.keys(data.ageDistribution).map(range => (
              <span key={range}>{range}</span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Top Insurance Providers</h4>
          <div className="space-y-2">
            {data.topInsuranceProviders.slice(0, 4).map((provider, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{provider.name}</span>
                <span className="text-sm font-medium text-gray-900">{provider.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitTimeTrackerSection({ data, loading }: WaitTimeTrackerProps) {
  return (
    <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
      <UniversalSectionHeader
        title="Wait Time Tracker"
        subtitle="Real-time monitoring across departments"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Current Wait</p>
            <p className={`text-3xl font-bold ${data.currentWait <= data.targetWait ? 'text-green-600' : 'text-amber-600'}`}>
              {data.currentWait} min
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-3xl font-bold text-gray-900">{data.averageWait} min</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Target</p>
            <p className="text-3xl font-bold text-blue-600">{data.targetWait} min</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">By Department</h4>
          <div className="space-y-3">
            {data.byDepartment.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{dept.department}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${dept.wait <= dept.target ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min((dept.wait / dept.target) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{dept.wait}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AppointmentTypesSection({ data, loading }: AppointmentTypesProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Appointment Types & Specialties"
        subtitle="Distribution of visit types and specialties"
        icon={<PieChart className="h-5 w-5 text-purple-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">By Type</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.byType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Top Specialties</h4>
          <div className="space-y-2">
            {data.bySpecialty.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{item.specialty}</span>
                <span className="text-sm font-medium text-gray-900">{item.count} visits</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Telemedicine Utilization</p>
              <p className="text-2xl font-bold text-purple-900">{formatPercentage(data.telemedicineUtilization)}</p>
            </div>
            <Phone className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProviderUtilizationSection({ providers, averageUtilization, loading }: ProviderUtilizationProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Provider Utilization"
        subtitle="Staff performance and availability"
        icon={<Stethoscope className="h-5 w-5 text-indigo-600" />}
      />
      
      <div className="mt-6 space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900">{provider.name}</p>
                <p className="text-sm text-gray-500">{provider.specialty}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{provider.utilization}% utilized</p>
                <p className="text-xs text-gray-500">Next: {provider.nextAvailable}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${provider.utilization >= 90 ? 'bg-red-500' : provider.utilization >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${provider.utilization}%` }}
                />
              </div>
              <div className="flex items-center text-sm">
                ⭐ <span className="ml-1 font-medium">{provider.rating}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">Average Utilization</p>
          <p className="text-2xl font-bold text-gray-900">{formatPercentage(averageUtilization)}</p>
        </div>
      </div>
    </section>
  );
}

function TelemedicineMetricsSection({ data, loading }: TelemedicineMetricsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Telemedicine Metrics"
        subtitle="Virtual care delivery statistics"
        icon={<Phone className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">Sessions Today</p>
            <p className="text-2xl font-bold text-blue-900">{data.sessionsToday}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">This Month</p>
            <p className="text-2xl font-bold text-green-900">{data.sessionsThisMonth}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Duration</p>
            <p className="text-xl font-bold text-gray-900">{formatDuration(data.averageDuration)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Satisfaction</p>
            <p className="text-xl font-bold text-gray-900">⭐ {data.satisfactionScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tech Issues</p>
            <p className="text-xl font-bold text-red-600">{data.technicalIssues}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Modality Distribution</h4>
          <div className="space-y-2">
            {Object.entries(data.modalities).map(([modality, percentage]) => (
              <div key={modality} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{modality}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueCycleSection({ data, loading }: RevenueCycleProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Revenue Cycle"
        subtitle="Financial performance and claims"
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700">Revenue This Month</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(data.revenueThisMonth)}</p>
            <p className="text-xs text-green-600 mt-1">▲ {formatPercentage(data.growth)} vs last month</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">Avg Reimbursement</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(data.averageReimbursement)}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Claims Status</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-amber-600">{data.claimsPending}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-xl font-bold text-green-600">{(data.claimsPending - data.claimsDenied).toLocaleString()}+</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Denied</p>
              <p className="text-xl font-bold text-red-600">{data.claimsDenied}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Denial rate: {formatPercentage(data.denialRate)}</p>
        </div>
      </div>
    </section>
  );
}

function PatientSatisfactionSection({ data, loading }: PatientSatisfactionProps) {
  return (
    <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <UniversalSectionHeader
        title="Patient Satisfaction"
        subtitle="Quality of care feedback"
        icon={<Activity className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="text-center">
          <p className="text-5xl font-bold text-green-900">{data.overallSatisfaction}</p>
          <p className="text-sm text-green-700 mt-1">out of 5.0</p>
          <p className="text-xs text-green-600 mt-2">{data.totalReviews.toLocaleString()} reviews • {formatPercentage(data.responseRate)} response rate</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">By Category</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.categories).map(([category, score]) => (
              <div key={category} className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Feedback</h4>
          <div className="space-y-2">
            {data.recentFeedback.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
