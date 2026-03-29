/**
 * Grocery Industry UI Components
 */

// KPI Cards
export { GroceryKPICards } from './GroceryKPICards';
export type { GroceryKPICardsProps } from './GroceryKPICards';

export { FreshnessTracker } from './FreshnessTracker';
export type { FreshnessTrackerProps, FreshnessRecord as FreshnessTrackerRecord, FreshnessStats } from './FreshnessTracker';

export { DeliveryRouteOptimizer } from './DeliveryRouteOptimizer';
export type { DeliveryRouteOptimizerProps, DeliveryRoute as DeliveryRouteType, DeliveryStop as DeliveryStopType, RouteStats } from './DeliveryRouteOptimizer';

export { ExpirationAlerts } from './ExpirationAlerts';
export type { ExpirationAlertsProps, ExpirationAlert as ExpirationAlertType, AlertStats as ExpirationAlertStats } from './ExpirationAlerts';

// Additional grocery dashboard components
export { PromotionPerformance } from './PromotionPerformance';
export type { PromotionPerformanceProps, Promotion, PromotionROI } from './PromotionPerformance';

export { PriceOptimization } from './PriceOptimization';
export type { PriceOptimizationProps, CompetitorPrice, PriceOptimizationSuggestion } from './PriceOptimization';

export { ExpirationTracking } from './ExpirationTracking';
export type { ExpirationTrackingProps, ExpiringProduct } from './ExpirationTracking';

export { SupplierDeliveries } from './GroceryAdditionalComponents';
export type { SupplierDelivery, SupplierDeliveriesProps } from './GroceryAdditionalComponents';

export { StockLevels } from './GroceryAdditionalComponents';
export type { InventoryHealth, StockLevelsProps } from './GroceryAdditionalComponents';

export { ActionRequired } from './GroceryAdditionalComponents';
export type { Task, ActionRequiredProps } from './GroceryAdditionalComponents';
