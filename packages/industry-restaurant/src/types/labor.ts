/**
 * Restaurant Labor Optimization Types
 * Demand-based scheduling, labor cost forecasting, shift swapping, and time clock
 */

// ============================================================================
// Staff & Role Types
// ============================================================================

export type StaffRole =
  | 'executive_chef'
  | 'sous_chef'
  | 'line_cook'
  | 'prep_cook'
  | 'dishwasher'
  | 'server'
  | 'bartender'
  | 'host'
  | 'busser'
  | 'food_runner'
  | 'manager'
  | 'barista';

export type ShiftStatus = 'draft' | 'published' | 'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled';

export type ShiftSwapStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

export type TimeClockEvent = 'clock_in' | 'clock_out' | 'break_start' | 'break_end';

// ============================================================================
// Staff Types
// ============================================================================

/** Roster / scheduling staff row; distinct from live-ops `StaffMember` in `kitchen-types`. */
export interface LaborRosterStaffMember {
  id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  isFullTime: boolean;
  hourlyRate: number;
  overtimeRate: number; // Typically 1.5x
  maxHoursPerWeek: number;
  availability: WeeklyAvailability;
  skills: string[]; // e.g., ['barista', 'expo', 'training']
  hireDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  available: boolean;
  start?: string; // HH:MM format, e.g., "08:00"
  end?: string;   // HH:MM format, e.g., "22:00"
}

// ============================================================================
// Shift Types
// ============================================================================

export interface LaborRosterShift {
  id: string;
  storeId: string;
  date: string; // ISO date string
  staffId?: string; // null = open shift
  staff?: Pick<LaborRosterStaffMember, 'id' | 'firstName' | 'lastName' | 'role' | 'hourlyRate'>;
  role: StaffRole;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationHours: number;
  status: ShiftStatus;
  section?: string; // E.g., "Bar", "Floor", "Kitchen"
  notes?: string;
  laborCost: number;
  isOvertime: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftTemplate {
  id: string;
  storeId: string;
  name: string; // E.g., "Weekend Dinner Service"
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  positions: Array<{
    role: StaffRole;
    startTime: string;
    endTime: string;
    count: number; // How many staff needed
    section?: string;
  }>;
  isActive: boolean;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface WeeklySchedule {
  id: string;
  storeId: string;
  weekStartDate: string; // ISO Monday date
  weekEndDate: string;
  status: 'draft' | 'published' | 'archived';
  shifts: LaborRosterShift[];
  laborMetrics: LaborMetrics;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaborMetrics {
  totalHours: number;
  totalLaborCost: number;
  overtimeHours: number;
  overtimeCost: number;
  laborCostPercent: number; // Labor / Revenue %
  forecastedRevenue: number;
  budgetedLaborPercent: number;
  variance: number; // actual - budget
  staffingByDay: DayStaffing[];
}

export interface DayStaffing {
  date: string;
  dayOfWeek: string;
  totalStaff: number;
  totalHours: number;
  totalCost: number;
  forecastedCovers: number;
  laborPerCover: number;
}

// ============================================================================
// Demand Forecasting for Labor
// ============================================================================

export interface LaborDemandForecast {
  storeId: string;
  date: string;
  dayOfWeek: string;
  forecastedCovers: number; // Expected number of guests
  forecastedRevenue: number;
  peakHours: PeakHour[];
  recommendedStaffing: RecommendedStaffing[];
  confidence: number;
  weatherImpact?: WeatherImpact;
  eventImpact?: EventImpact[];
}

export interface PeakHour {
  hour: number; // 0-23
  forecastedCovers: number;
  forecastedRevenue: number;
  recommendedFOHCount: number; // Front of house
  recommendedBOHCount: number; // Back of house
}

export interface RecommendedStaffing {
  role: StaffRole;
  count: number;
  startTime: string;
  endTime: string;
  estimatedCost: number;
}

export interface WeatherImpact {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'extreme';
  temperatureF: number;
  coverImpactPercent: number; // E.g., -15 means 15% fewer covers expected
}

export interface EventImpact {
  eventName: string;
  eventType: 'local_event' | 'holiday' | 'sports' | 'concert' | 'festival';
  coverImpactPercent: number; // E.g., +40 means 40% more covers
  distance?: number; // Miles from restaurant
}

// ============================================================================
// Labor Cost Forecasting
// ============================================================================

export interface LaborCostForecast {
  storeId: string;
  period: { start: string; end: string };
  forecastedRevenue: number;
  targetLaborPercent: number; // E.g., 30%
  targetLaborCost: number;
  scheduledLaborCost: number;
  scheduledLaborPercent: number;
  variance: number;
  recommendations: LaborCostRecommendation[];
  byDay: DayLaborForecast[];
}

export interface DayLaborForecast {
  date: string;
  forecastedRevenue: number;
  scheduledLaborCost: number;
  scheduledLaborPercent: number;
  targetLaborPercent: number;
  status: 'on_budget' | 'over_budget' | 'under_scheduled';
  scheduledHours: number;
  scheduledStaff: number;
}

export interface LaborCostRecommendation {
  type: 'cut_shift' | 'add_shift' | 'reduce_hours' | 'rebalance' | 'overtime_alert';
  date: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  estimatedSavings?: number;
  affectedStaffId?: string;
  affectedShiftId?: string;
}

// ============================================================================
// Shift Swap Types
// ============================================================================

export interface ShiftSwapRequest {
  id: string;
  storeId: string;
  requestingStaffId: string;
  requestingStaff?: Pick<LaborRosterStaffMember, 'id' | 'firstName' | 'lastName' | 'role'>;
  coveringStaffId?: string; // The person taking the shift
  coveringStaff?: Pick<LaborRosterStaffMember, 'id' | 'firstName' | 'lastName' | 'role'>;
  shiftId: string;
  shift?: Pick<LaborRosterShift, 'id' | 'date' | 'startTime' | 'endTime' | 'role'>;
  reason: string;
  status: ShiftSwapStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  requestedAt: string;
  expiresAt: string;
}

export interface OpenShift extends Omit<LaborRosterShift, 'staffId' | 'staff'> {
  eligibleStaff: string[]; // Staff IDs who can take this shift
  claimedBy?: string;
  claimedAt?: string;
}

// ============================================================================
// Time Clock Types
// ============================================================================

export interface TimeClockEntry {
  id: string;
  storeId: string;
  staffId: string;
  staff?: Pick<LaborRosterStaffMember, 'id' | 'firstName' | 'lastName' | 'role'>;
  shiftId?: string;
  event: TimeClockEvent;
  timestamp: string;
  method: 'pin' | 'card' | 'biometric' | 'manager';
  location?: string; // For multi-location
  notes?: string;
  isLate?: boolean; // Was clock-in late?
  minutesLate?: number;
}

export interface TimecardSummary {
  staffId: string;
  staff?: Pick<LaborRosterStaffMember, 'id' | 'firstName' | 'lastName' | 'role' | 'hourlyRate'>;
  weekStartDate: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  lateArrivals: number;
  absentDays: number;
  shifts: Array<{
    date: string;
    clockIn?: string;
    clockOut?: string;
    breakMinutes: number;
    workedHours: number;
    pay: number;
    isOvertime: boolean;
  }>;
}

// ============================================================================
// Schedule Optimization Types
// ============================================================================

export interface ScheduleOptimizationInput {
  storeId: string;
  weekStartDate: string;
  targetLaborPercent: number;
  demandForecasts: LaborDemandForecast[];
  staffAvailability: Array<{
    staffId: string;
    availability: WeeklyAvailability;
    preferredHours?: number;
    maxHours?: number;
  }>;
  shiftTemplates?: ShiftTemplate[];
  constraints?: ScheduleConstraints;
}

export interface ScheduleConstraints {
  minRestBetweenShifts: number; // Hours
  maxConsecutiveDays: number;
  minShiftLength: number; // Hours
  maxShiftLength: number; // Hours
  requireBreakAfterHours: number; // E.g., 5 = break required after 5 hours
  breakDurationMinutes: number;
}

export interface ScheduleOptimizationResult {
  schedule: WeeklySchedule;
  metrics: LaborMetrics;
  optimizationScore: number; // 0-100
  issuesFound: string[];
  unfilledShifts: number;
  suggestions: string[];
}
