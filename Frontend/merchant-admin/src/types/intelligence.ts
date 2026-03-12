export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface ForecastFactors {
  seasonality: number;
  trend: number;
  events: string[];
}

export interface SalesForecast {
  id: string;
  storeId: string;
  period: Date;
  periodType: PeriodType;
  predictedRevenue: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  factors: ForecastFactors;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashFlowAlert {
  lowBalance: boolean;
  shortfallRisk: number;
}

export interface CashFlowForecast {
  id: string;
  storeId: string;
  date: Date;
  predictedInflow: number;
  predictedOutflow: number;
  netFlow: number;
  runwayDays: number | null;
  alerts: CashFlowAlert;
  createdAt: Date;
}

export interface InventoryForecast {
  id: string;
  storeId: string;
  productId: string;
  predictedDemand: number;
  stockoutRisk: number;
  suggestedReorder: number;
  optimalReorderDate: Date;
  confidence: number;
  createdAt: Date;
}

export interface RFMScores {
  recency: number;
  frequency: number;
  monetary: number;
}

export interface SegmentCriteria {
  rfm: RFMScores;
  behaviors: string[];
}

export interface CustomerSegment {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  criteria: SegmentCriteria;
  color: string;
  icon: string;
  customerCount: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSegmentMembership {
  id: string;
  customerId: string;
  segmentId: string;
  score: number;
  joinedAt: Date;
}

export interface RFMCustomer {
  customerId: string;
  recency: number;
  frequency: number;
  monetary: number;
  lastOrderDate: Date;
  totalOrders: number;
}

export interface ForecastingOverview {
  sales: SalesForecast[];
  cashFlow: CashFlowForecast[];
  inventory: InventoryForecast[];
}

export interface SegmentOverview {
  segments: CustomerSegment[];
  totalCustomers: number;
  segmentDistribution: Record<string, number>;
}
