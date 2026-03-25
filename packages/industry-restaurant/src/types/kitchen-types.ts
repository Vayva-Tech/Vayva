/**
 * Restaurant Industry Types
 * 
 * Comprehensive type definitions for restaurant operations including:
 * - KDS (Kitchen Display System)
 * - Table Management
 * - Reservations
 * - Menu & 86 Board
 * - Staff Management
 * - Delivery Integration
 * - Finance & Analytics
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  COOKING: 'cooking',
  READY: 'ready',
  PLATED: 'plated',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  SEATED: 'seated',
  ORDERING: 'ordering',
  COOKING: 'cooking',
  RESERVED: 'reserved',
  OFFLINE: 'offline',
} as const;

export const TICKET_STATUS = {
  FRESH: 'fresh',
  COOKING: 'cooking',
  READY: 'ready',
  URGENT: 'urgent',
  OVERDUE: 'overdue',
} as const;

export const SERVICE_PERIOD = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  LATE_NIGHT: 'late_night',
  BRUNCH: 'brunch',
  HAPPY_HOUR: 'happy_hour',
} as const;

export const REVENUE_STREAM = {
  DINE_IN: 'dine-in',
  TAKEOUT: 'takeout',
  DELIVERY: 'delivery',
  CATERING: 'catering',
  BAR: 'bar',
} as const;

export const DELIVERY_PLATFORM = {
  UBER_EATS: 'uber_eats',
  DOOR_DASH: 'door_dash',
  GRUBHUB: 'grubhub',
  POSTMATES: 'postmates',
  DELIVEROO: 'deliveroo',
  LOCAL: 'local',
} as const;

export const ALLERGENS = {
  DAIRY: 'dairy',
  EGGS: 'eggs',
  FISH: 'fish',
  SHELLFISH: 'shellfish',
  TREE_NUTS: 'tree_nuts',
  PEANUTS: 'peanuts',
  WHEAT: 'wheat',
  SOYBEANS: 'soybeans',
  SESAME: 'sesame',
  SULFITES: 'sulfites',
} as const;

export const DIETARY_PREFERENCES = {
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  DAIRY_FREE: 'dairy_free',
  NUT_FREE: 'nut_free',
  HALAL: 'halal',
  KOSHER: 'kosher',
  LOW_CARB: 'low_carb',
  KETO: 'keto',
  PALEO: 'paleo',
} as const;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

const MoneySchema = z.number().min(0);
const PercentageSchema = z.number().min(0).max(100);
const TimestampSchema = z.date().or(z.string());

// ============================================================================
// MENU & ITEMS
// ============================================================================

export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: MoneySchema,
  cost: MoneySchema,
  category: z.string(),
  imageUrl: z.string().optional(),
  calories: z.number().optional(),
  prepTime: z.number(), // minutes
  cookTime: z.number(), // minutes
  station: z.string(), // kitchen station
  allergens: z.array(z.enum(Object.keys(ALLERGENS) as [string])).optional(),
  dietaryTags: z.array(z.enum(Object.keys(DIETARY_PREFERENCES) as [string])).optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })),
  modifiers: z.array(z.object({
    name: z.string(),
    price: MoneySchema,
    options: z.array(z.string()),
  })).optional(),
  isAvailable: z.boolean(),
  popularity: z.number().optional(), // 0-100
  isSeasonal: z.boolean().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  items: z.array(MenuItemSchema),
});

export const EightySixItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  reason: z.enum(['low_stock', 'out_of_stock', 'quality_issue', 'seasonal_unavailable']),
  quantityRemaining: z.number().optional(),
  estimatedRestock: TimestampSchema.optional(),
  reportedBy: z.string(),
  reportedAt: TimestampSchema,
  status: z.enum(['active', 'resolved', 'expired']),
});

// ============================================================================
// ORDERS & TICKETS
// ============================================================================

export const OrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  name: z.string(),
  quantity: z.number(),
  status: z.enum(Object.values(ORDER_STATUS) as [string]),
  station: z.string(),
  modifiers: z.array(z.object({
    name: z.string(),
    value: z.string(),
    price: MoneySchema.optional(),
  })).optional(),
  specialInstructions: z.string().optional(),
  startedAt: TimestampSchema.optional(),
  completedAt: TimestampSchema.optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  type: z.enum(['dine-in', 'takeout', 'delivery', 'catering']),
  status: z.enum(Object.values(ORDER_STATUS) as [string]),
  tableId: z.string().optional(),
  serverId: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(OrderItemSchema),
  subtotal: MoneySchema,
  tax: MoneySchema,
  tip: MoneySchema.optional(),
  total: MoneySchema,
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']),
  paymentMethod: z.enum(['cash', 'card', 'digital', 'split']).optional(),
  deliveryInfo: z.object({
    platform: z.enum(Object.keys(DELIVERY_PLATFORM) as [string]).optional(),
    driverName: z.string().optional(),
    pickupTime: TimestampSchema.optional(),
    deliveryAddress: z.string().optional(),
    distance: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const TicketSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  orderId: z.string(),
  type: z.enum(['dine-in', 'takeout', 'delivery']),
  tableNumber: z.string().optional(),
  serverName: z.string(),
  status: z.enum(Object.values(TICKET_STATUS) as [string]),
  items: z.array(OrderItemSchema),
  station: z.string(),
  timerSeconds: z.number(),
  targetTime: TimestampSchema,
  startTime: TimestampSchema.optional(),
  bumpTime: TimestampSchema.optional(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  allergies: z.array(z.string()).optional(),
  modifiers: z.array(z.object({
    itemId: z.string(),
    modifications: z.array(z.string()),
  })).optional(),
});

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

export const TableSchema = z.object({
  id: z.string(),
  tableNumber: z.string(),
  section: z.string(),
  capacity: z.number(),
  status: z.enum(Object.values(TABLE_STATUS) as [string]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  shape: z.enum(['square', 'round', 'rectangle', 'booth']).default('square'),
  isCombined: z.boolean().optional(),
  combinedTableIds: z.array(z.string()).optional(),
  currentParty: z.object({
    size: z.number(),
    seatedAt: TimestampSchema,
    serverId: z.string(),
    orderId: z.string().optional(),
  }).optional(),
  turnoverGoalMinutes: z.number(),
  actualTurnoverMinutes: z.number().optional(),
});

export const FloorPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tables: z.array(TableSchema),
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    tableIds: z.array(z.string()),
  })),
  imageUrl: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const ReservationSchema = z.object({
  id: z.string(),
  confirmationNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string(),
  partySize: z.number(),
  date: z.string(), // ISO date string
  time: z.string(), // HH:mm format
  tableId: z.string().optional(),
  duration: z.number(), // minutes
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']),
  source: z.enum(['phone', 'online', 'walk_in', 'third_party']),
  specialRequests: z.string().optional(),
  occasion: z.string().optional(),
  depositAmount: MoneySchema.optional(),
  depositPaid: z.boolean().default(false),
  remindersSent: z.boolean().default(false),
  notes: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// ============================================================================
// STAFF MANAGEMENT
// ============================================================================

export const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['server', 'bartender', 'host', 'runner', 'cook', 'dishwasher', 'manager', 'expo']),
  station: z.string().optional(),
  isOnShift: z.boolean(),
  shiftStart: TimestampSchema.optional(),
  shiftEnd: TimestampSchema.optional(),
  hourlyRate: MoneySchema,
  tipSharePercentage: PercentageSchema.optional(),
  permissions: z.array(z.string()),
  performance: z.object({
    avgTicketTime: z.number().optional(),
    salesPerHour: MoneySchema.optional(),
    customerRating: z.number().min(0).max(5).optional(),
    tablesServed: z.number().optional(),
  }).optional(),
});

export const ShiftSchema = z.object({
  id: z.string(),
  date: z.string(),
  period: z.enum(Object.values(SERVICE_PERIOD) as [string]),
  staffMembers: z.array(StaffMemberSchema),
  scheduledHours: z.number(),
  actualHours: z.number().optional(),
  salesTarget: MoneySchema,
  actualSales: MoneySchema.optional(),
  laborCostPercentage: PercentageSchema.optional(),
});

// ============================================================================
// DELIVERY INTEGRATION
// ============================================================================

export const DeliveryPlatformConfigSchema = z.object({
  platform: z.enum(Object.keys(DELIVERY_PLATFORM) as [string]),
  isEnabled: z.boolean(),
  apiKey: z.string(),
  merchantId: z.string(),
  commissionRate: PercentageSchema,
  deliveryRadius: z.number(), // miles
  deliveryFee: MoneySchema,
  minimumOrder: MoneySchema,
  estimatedDeliveryTime: z.number(), // minutes
  syncEnabled: z.boolean(),
  lastSync: TimestampSchema.optional(),
});

export const DeliveryOrderSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  platform: z.enum(Object.keys(DELIVERY_PLATFORM) as [string]),
  platformOrderId: z.string(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  pickupTime: TimestampSchema.optional(),
  deliveredTime: TimestampSchema.optional(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    instructions: z.string().optional(),
  }),
  distance: z.number(), // miles
  deliveryFee: MoneySchema,
  platformCommission: MoneySchema,
  netRevenue: MoneySchema,
});

// ============================================================================
// FINANCE & ANALYTICS
// ============================================================================

export const RevenueBreakdownSchema = z.object({
  total: MoneySchema,
  byStream: z.object({
    dineIn: MoneySchema,
    takeout: MoneySchema,
    delivery: MoneySchema,
    catering: MoneySchema,
    bar: MoneySchema,
  }),
  byMealPeriod: z.object({
    breakfast: MoneySchema,
    lunch: MoneySchema,
    dinner: MoneySchema,
    lateNight: MoneySchema,
    brunch: MoneySchema,
  }),
  percentageChange: z.number(),
  comparison: z.enum(['yesterday', 'last_week', 'last_month', 'last_year']),
});

export const CostAnalysisSchema = z.object({
  foodCost: MoneySchema,
  foodCostPercentage: PercentageSchema,
  foodCostTarget: PercentageSchema,
  laborCost: MoneySchema,
  laborCostPercentage: PercentageSchema,
  laborCostTarget: PercentageSchema,
  primeCost: MoneySchema,
  primeCostPercentage: PercentageSchema,
  primeCostTarget: PercentageSchema,
  topCostItems: z.array(z.object({
    category: z.string(),
    amount: MoneySchema,
    percentage: PercentageSchema,
  })),
});

export const TipDistributionSchema = z.object({
  totalTips: MoneySchema,
  distribution: z.object({
    servers: z.object({
      percentage: PercentageSchema,
      amount: MoneySchema,
      count: z.number(),
      perPerson: MoneySchema,
    }),
    bartenders: z.object({
      percentage: PercentageSchema,
      amount: MoneySchema,
      count: z.number(),
      perPerson: MoneySchema,
    }),
    runners: z.object({
      percentage: PercentageSchema,
      amount: MoneySchema,
      count: z.number(),
      perPerson: MoneySchema,
    }),
    kitchen: z.object({
      percentage: PercentageSchema,
      amount: MoneySchema,
      count: z.number(),
      perPerson: MoneySchema,
    }),
  }),
});

export const DashboardMetricsSchema = z.object({
  revenue: MoneySchema,
  orders: z.number(),
  guests: z.number(),
  averageTicket: MoneySchema,
  tableTurn: z.number(),
  revenueChange: z.number(),
  ordersChange: z.number(),
  guestsChange: z.number(),
  averageTicketChange: MoneySchema,
  tableTurnChange: z.number(),
  isLive: z.boolean(),
  lastUpdated: TimestampSchema,
});

export const KPIMetricSchema = z.object({
  label: z.string(),
  value: z.union([MoneySchema, z.number(), z.string()]),
  change: z.union([MoneySchema, z.number(), z.string()]),
  trend: z.enum(['up', 'down', 'neutral']),
  isPositive: z.boolean(),
  isLive: z.boolean(),
  tooltip: z.string().optional(),
});

// ============================================================================
// KITCHEN OPERATIONS
// ============================================================================

export const KitchenStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['grill', 'fryer', 'saute', 'cold', 'expo', 'bar', 'pizza', 'sushi', 'dessert', 'prep']),
  isActive: z.boolean(),
  tickets: z.array(TicketSchema),
  avgCookTime: z.number(), // minutes
  efficiency: z.number(), // 0-100
  queueLength: z.number(),
});

export const PrepItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  targetQuantity: z.number(),
  currentQuantity: z.number(),
  unit: z.string(),
  prepTime: z.number(), // minutes
  shelfLife: z.number(), // hours
  isDone: z.boolean(),
  needsAttention: z.boolean(),
  lastPrepped: TimestampSchema.optional(),
  nextBatch: TimestampSchema.optional(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  yield: z.number(),
  yieldUnit: z.string(),
  ingredients: z.array(z.object({
    itemId: z.string(),
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    cost: MoneySchema,
  })),
  instructions: z.array(z.string()),
  prepTime: z.number(),
  cookTime: z.number(),
  totalCost: MoneySchema,
  costPerPortion: MoneySchema,
  targetFoodCostPercentage: PercentageSchema,
  suggestedPrice: MoneySchema,
  nutritionalInfo: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }).optional(),
});

// ============================================================================
// AI INSIGHTS
// ============================================================================

export const AIInsightSchema = z.object({
  id: z.string(),
  type: z.enum(['prediction', 'recommendation', 'alert', 'optimization']),
  title: z.string(),
  description: z.string(),
  confidence: PercentageSchema,
  impact: z.enum(['low', 'medium', 'high']),
  data: z.record(z.string(), z.any()),
  actionRequired: z.boolean(),
  actionTaken: z.boolean().optional(),
  expiresAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
});

export const DemandPredictionSchema = z.object({
  date: z.string(),
  period: z.enum(Object.values(SERVICE_PERIOD) as [string]),
  predictedCovers: z.number(),
  predictedRevenue: MoneySchema,
  confidence: PercentageSchema,
  factors: z.array(z.string()),
  recommendations: z.array(z.string()),
  staffingSuggestions: z.object({
    servers: z.number(),
    cooks: z.number(),
    support: z.number(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategory = z.infer<typeof MenuCategorySchema>;
export type EightySixItem = z.infer<typeof EightySixItemSchema>;

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Ticket = z.infer<typeof TicketSchema>;

export type Table = z.infer<typeof TableSchema>;
export type FloorPlan = z.infer<typeof FloorPlanSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;

export type StaffMember = z.infer<typeof StaffMemberSchema>;
export type Shift = z.infer<typeof ShiftSchema>;

export type DeliveryPlatformConfig = z.infer<typeof DeliveryPlatformConfigSchema>;
export type DeliveryOrder = z.infer<typeof DeliveryOrderSchema>;

export type RevenueBreakdown = z.infer<typeof RevenueBreakdownSchema>;
export type CostAnalysis = z.infer<typeof CostAnalysisSchema>;
export type TipDistribution = z.infer<typeof TipDistributionSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type KPIMetric = z.infer<typeof KPIMetricSchema>;

export type KitchenStation = z.infer<typeof KitchenStationSchema>;
export type PrepItem = z.infer<typeof PrepItemSchema>;
/** Menu / kitchen recipe record (Zod); distinct from costing `Recipe` in `./recipe`. */
export type MenuRecipe = z.infer<typeof RecipeSchema>;

export type AIInsight = z.infer<typeof AIInsightSchema>;
export type DemandPrediction = z.infer<typeof DemandPredictionSchema>;
