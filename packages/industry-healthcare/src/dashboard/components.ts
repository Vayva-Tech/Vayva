// ============================================================================
// Healthcare Industry Dashboard Components
// ============================================================================

// Component Props Interfaces for Healthcare Dashboard Sections
// Import base types from types module where applicable

import type { 
  Appointment,
  Doctor,
  Patient,
  MedicalRecord,
  TelemedicineSession,
  HealthcareAnalytics
} from '../types';

// Local interfaces for component props

export interface AppointmentToday {
  id: string;
  patientName: string;
  type: string;
  time: string;
  provider: string;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
}

export interface PatientDemographicsData {
  totalPatients: number;
  newThisMonth: number;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  topInsuranceProviders: Array<{ name: string; percentage: number }>;
}

export interface WaitTimeData {
  currentWait: number;
  averageWait: number;
  targetWait: number;
  trend: 'improving' | 'stable' | 'worsening';
  byDepartment: Array<{ department: string; wait: number; target: number }>;
}

export interface AppointmentTypeData {
  byType: Record<string, number>;
  bySpecialty: Array<{ specialty: string; count: number }>;
  telemedicineUtilization: number;
}

export interface ProviderData {
  id: string;
  name: string;
  specialty: string;
  patients: number;
  utilization: number;
  rating: number;
  nextAvailable: string;
}

export interface TelemedicineData {
  sessionsToday: number;
  sessionsThisMonth: number;
  averageDuration: number; // minutes
  satisfactionScore: number;
  technicalIssues: number;
  modalities: {
    video: number;
    phone: number;
    chat: number;
  };
}

export interface RevenueData {
  revenueThisMonth: number;
  revenueLastMonth: number;
  growth: number;
  claimsPending: number;
  claimsDenied: number;
  denialRate: number;
  averageReimbursement: number;
}

export interface SatisfactionData {
  overallSatisfaction: number;
  responseRate: number;
  totalReviews: number;
  categories: Record<string, number>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

// ---------------------------------------------------------------------------
// Component Props Interfaces
// ---------------------------------------------------------------------------

export interface AppointmentsTodayProps {
  appointments: AppointmentToday[];
  totalToday: number;
  completed: number;
  noShows: number;
  loading?: boolean;
  className?: string;
}

export interface PatientDemographicsProps {
  data: PatientDemographicsData;
  loading?: boolean;
  className?: string;
}

export interface WaitTimeTrackerProps {
  data: WaitTimeData;
  loading?: boolean;
  className?: string;
}

export interface AppointmentTypesProps {
  data: AppointmentTypeData;
  loading?: boolean;
  className?: string;
}

export interface ProviderUtilizationProps {
  providers: ProviderData[];
  averageUtilization: number;
  loading?: boolean;
  className?: string;
}

export interface TelemedicineMetricsProps {
  data: TelemedicineData;
  loading?: boolean;
  className?: string;
}

export interface RevenueCycleProps {
  data: RevenueData;
  loading?: boolean;
  className?: string;
}

export interface PatientSatisfactionProps {
  data: SatisfactionData;
  loading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'in_progress':
      return 'text-blue-600 bg-blue-50';
    case 'checked_in':
      return 'text-purple-600 bg-purple-50';
    case 'scheduled':
      return 'text-gray-600 bg-gray-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    case 'no_show':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'emergency':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'urgent':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'routine':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
