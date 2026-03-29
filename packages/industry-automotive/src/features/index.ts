/**
 * Automotive Industry Features
 */

export { VehicleShowcaseFeature } from './vehicle-showcase.feature';
export type { VehicleShowcaseConfig } from './vehicle-showcase.feature';

export { TestDriveCoordinatorFeature } from './test-drive-coordinator.feature';
export type { TestDriveCoordinatorConfig } from './test-drive-coordinator.feature';

export { CRMIntegrationFeature } from './crm-integration.feature';
export type { CRMIntegrationConfig } from './crm-integration.feature';

// Phase 3: Enhanced Features
export { TestDriveScheduler, createTestDriveScheduler, FinancingCalculatorService, createFinancingCalculatorService, TradeInValuationService, createTradeInValuationService } from './automotive-features';
export type { TestDrive, FinancingCalculation, TradeInValuation } from './automotive-features';
