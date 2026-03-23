// @ts-nocheck
/**
 * Table Management and Turn Optimization types
 */

export type TableStatus = 'available' | 'seated' | 'ordered' | 'eating' | 'dessert' | 'check_dropped' | 'paid' | 'cleaning' | 'reserved';
export type TableShape = 'round' | 'square' | 'rectangle' | 'booth' | 'bar' | 'outdoor';
export type PredictionModel = 'ml' | 'rule_based';
export type NotificationChannel = 'sms' | 'app' | 'pager' | 'push';

export interface TableTurnConfig {
  predictionModel: PredictionModel;
  seatingOptimization: boolean;
  waitlistIntegration: boolean;
  notificationChannels: NotificationChannel[];
  autoNotifyWhenReady: boolean;
  readyNotificationLeadTime: number; // minutes before predicted ready
  tableResetTimeMinutes: number;
}

export interface Table {
  id: string;
  number: string;
  name?: string;
  shape: TableShape;
  capacity: number;
  minCapacity: number;
  maxCapacity: number;
  section: string;
  position: { x: number; y: number };
  status: TableStatus;
  currentReservation?: TableReservation;
  avgTurnTimeMinutes: number;
  isActive: boolean;
  features: ('window' | 'outdoor' | 'quiet' | 'high_chair' | 'wheelchair')[];
}

export interface TableReservation {
  id: string;
  tableId: string;
  partyName: string;
  partySize: number;
  phone?: string;
  email?: string;
  status: TableStatus;
  seatedAt?: Date;
  orderStartedAt?: Date;
  foodServedAt?: Date;
  checkDroppedAt?: Date;
  paidAt?: Date;
  clearedAt?: Date;
  predictedReadyAt?: Date;
  specialRequests?: string;
  serverId?: string;
  serverName?: string;
  courseProgress: CourseProgress;
}

export interface CourseProgress {
  currentCourse: 'appetizer' | 'entree' | 'dessert' | 'complete';
  appetizerStarted?: Date;
  appetizerCompleted?: Date;
  entreeStarted?: Date;
  entreeCompleted?: Date;
  dessertStarted?: Date;
  dessertCompleted?: Date;
  percentComplete: number;
}

export interface PartyInfo {
  reservationId: string;
  partyName: string;
  partySize: number;
  specialOccasion?: string;
  isVip: boolean;
  visitCount: number;
  avgSpend?: number;
}

export interface TableTurnPrediction {
  tableId: string;
  currentParty?: PartyInfo;
  predictedReadyTime: Date;
  confidence: number; // 0-1
  factors: TurnPredictionFactors;
  suggestedAction?: 'start_check' | 'offer_dessert' | 'prepare_table' | 'none';
}

export interface TurnPredictionFactors {
  courseProgress: number; // 0-100
  avgCourseTime: number; // minutes
  paymentStatus: 'pending' | 'processing' | 'complete';
  tableResetTime: number; // minutes
  partySize: number;
  historicalTurnTime: number; // minutes
  currentDuration: number; // minutes seated
}

export interface WaitlistEntry {
  id: string;
  partyName: string;
  partySize: number;
  phone: string;
  quotedWaitMinutes: number;
  actualWaitMinutes?: number;
  status: 'waiting' | 'notified' | 'seated' | 'no_show' | 'cancelled';
  joinedAt: Date;
  notifiedAt?: Date;
  seatedAt?: Date;
  preferences: TablePreference[];
  quotedTime: Date;
}

export interface TablePreference {
  type: 'section' | 'feature' | 'size';
  value: string;
  priority: number; // 1-10
}

export interface TableTurnStats {
  totalTurns: number;
  avgTurnTimeMinutes: number;
  avgTableUtilization: number; // percentage
  totalCovers: number;
  avgPartySize: number;
  peakHours: Array<{
    hour: number;
    avgTurnTime: number;
    tableCount: number;
  }>;
}

export interface TableNotification {
  id: string;
  tableId: string;
  type: 'table_ready' | 'turn_predicted' | 'waitlist_available';
  channel: NotificationChannel;
  recipient: string;
  message: string;
  sent: boolean;
  sentAt?: Date;
}

// Widget Props
export interface TableWidgetProps {
  config: TableTurnConfig;
  tables: Table[];
  reservations: TableReservation[];
  waitlist: WaitlistEntry[];
  predictions: TableTurnPrediction[];
  stats: TableTurnStats;
  onTableAction: (tableId: string, action: string) => void;
  onSeatParty: (request: { tableId: string; partyName: string; partySize: number }) => void;
}
