/**
 * VAYVA UI - Industry-Specific Design System
 * 
 * Premium dashboard components for all 22 industries
 * Built with React, Tailwind CSS, and Vayva branding
 */

// ============================================
// CORE COMPONENTS (Shared across all industries)
// ============================================

export { VayvaCard, VayvaCardHeader, VayvaCardTitle, VayvaCardDescription, VayvaCardContent, VayvaCardFooter } from './VayvaCard';
export { VayvaButton, VayvaIconButton } from './VayvaButton';
export { VayvaThemeProvider, useVayvaTheme } from './VayvaThemeProvider';

// Type exports
export type { DesignCategory, ThemePreset } from './VayvaThemeProvider';

// ============================================
// FASHION INDUSTRY COMPONENTS
// Design Category: Premium Glass
// ============================================

export { SizeCurveChart } from './fashion/SizeCurveChart';
export { VisualMerchandisingBoard } from './fashion/VisualMerchandisingBoard';
export { FashionKPICard, GradientOrbs } from './fashion/KPICards';
export { default as FashionDashboardPage } from './fashion/FashionDashboardPage';

// Fashion types
export type { SizeCurveData } from './fashion/SizeCurveChart';
export type { CollectionItem } from './fashion/VisualMerchandisingBoard';

// ============================================
// COMING SOON - Other Industries
// ============================================

// Restaurant (Bold Energy + Modern Dark KDS)
// export { RestaurantDashboardPage } from './restaurant/RestaurantDashboardPage';
// export { KDSOrderQueue } from './restaurant/KDSOrderQueue';
// export { TableTurnTracker } from './restaurant/TableTurnTracker';
// export { EightySixBoard } from './restaurant/EightySixBoard';

// Retail (Signature Clean)
// export { RetailDashboardPage } from './retail/RetailDashboardPage';
// export { ProductGrid } from './retail/ProductGrid';
// export { SalesTrendChart } from './retail/SalesTrendChart';
// export { InventoryAlert } from './retail/InventoryAlert';

// Real Estate (Premium Glass)
// export { RealEstateDashboardPage } from './realestate/RealEstateDashboardPage';
// export { PropertyShowcase } from './realestate/PropertyShowcase';
// export { CMACalculator } from './realestate/CMACalculator';
// export { TransactionTimeline } from './realestate/TransactionTimeline';

// Healthcare (Signature Clean)
// export { HealthcareDashboardPage } from './healthcare/HealthcareDashboardPage';
// export { PatientQueue } from './healthcare/PatientQueue';
// export { WaitTimeTracker } from './healthcare/WaitTimeTracker';
// export { ProviderUtilizationChart } from './healthcare/ProviderUtilizationChart';

// ... and 17 more industries
