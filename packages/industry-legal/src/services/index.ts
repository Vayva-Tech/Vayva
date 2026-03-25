/**
 * @vayva/industry-legal - Service Layer
 *
 * Business logic and operations for Legal & Law Firm Platform
 * Phase 3: Class-based service wrappers
 */

// Export class-based services
export { MatterManagementService } from './matter-management.service';
export type { MatterData } from './matter-management.service';

export { ClientService } from './client-service';

export { DocumentAutomationService } from './document-automation.service';

export { DeadlineCalendarService } from './deadline-calendar.service';
export type { DeadlineData, CourtRule } from './deadline-calendar.service';

export { ConflictCheckService } from './conflict-check.service';
export type { ConflictCheckData, ConflictSearchResult } from './conflict-check.service';

export { TrustAccountingService } from './trust-accounting.service';
export type { TrustTransactionData } from './trust-accounting.service';

export { BillingInvoicingService } from './billing-invoicing.service';
export type { TimeEntryData, InvoiceData } from './billing-invoicing.service';

// Phase 4: AI-Powered Services
export { ContractAnalysisService } from './contract-analysis.service';
export type { ContractAnalysisInput } from './contract-analysis.service';

export { LegalResearchService } from './legal-research.service';
export type { LegalResearchInput } from './legal-research.service';

export { DocumentAutomationService as AIDocumentAutomationService } from './document-automation.service';
export type { DocumentGenerationInput } from './document-automation.service';
