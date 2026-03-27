/**
 * Legal Compliance Services Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IOLTAComplianceService, STATE_IOLTA_CONFIGS } from '../src/legal/IOLTAService';
import { ConflictChecker, checkConflicts } from '../src/legal/ConflictChecker';
import { ThreeWayReconciliationService } from '../src/legal/ReconciliationService';

describe('Legal Compliance Services', () => {
  describe('IOLTAComplianceService', () => {
    let service: IOLTAComplianceService;

    beforeEach(() => {
      service = new IOLTAComplianceService();
    });

    it('returns state configuration for California', () => {
      const config = service.getStateConfig('CA');
      
      expect(config).not.toBeNull();
      expect(config?.state).toBe('CA');
      expect(config?.interestRateMinimum).toBe(0.50);
      expect(config?.feeWaiverMinimum).toBe(1000);
    });

    it('returns null for unconfigured state', () => {
      const config = service.getStateConfig('XX');
      expect(config).toBeNull();
    });

    it('validates trust account successfully', () => {
      const account = {
        id: '1',
        accountId: 'acc-123',
        state: 'CA',
        balance: 5000,
        clientBalances: new Map([['client-1', 2000], ['client-2', 3000]]),
        bankName: 'Wells Fargo',
        accountNumber: '****1234',
        isActive: true,
      };

      const result = service.validateTrustAccount(account);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects ineligible bank', () => {
      const account = {
        id: '1',
        accountId: 'acc-123',
        state: 'CA',
        balance: 5000,
        clientBalances: new Map([['client-1', 5000]]),
        bankName: 'Invalid Bank',
        accountNumber: '****1234',
        isActive: true,
      };

      const result = service.validateTrustAccount(account);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not an eligible institution'))).toBe(true);
    });

    it('detects balance mismatch', () => {
      const account = {
        id: '1',
        accountId: 'acc-123',
        state: 'CA',
        balance: 5000,
        clientBalances: new Map([['client-1', 2000], ['client-2', 2000]]), // Should be 5000
        bankName: 'Wells Fargo',
        accountNumber: '****1234',
        isActive: true,
      };

      const result = service.validateTrustAccount(account);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('do not match total balance'))).toBe(true);
    });

    it('calculates required interest correctly', () => {
      const balance = 10000;
      const monthlyInterest = service.calculateRequiredInterest(balance, 'CA');
      
      // CA minimum rate is 0.50% annually
      const expectedMonthly = (10000 * 0.005) / 12;
      expect(monthlyInterest).toBeCloseTo(expectedMonthly, 2);
    });

    it('generates compliance report', () => {
      const account = {
        id: '1',
        accountId: 'acc-123',
        state: 'CA',
        balance: 5000,
        clientBalances: new Map([['client-1', 5000]]),
        bankName: 'Wells Fargo',
        accountNumber: '****1234',
        isActive: true,
      };

      const report = service.generateComplianceReport(account);
      
      expect(report.state).toBe('CA');
      expect(report.compliant).toBe(true);
      expect(report.generatedAt).toBeDefined();
    });
  });

  describe('ConflictChecker', () => {
    let checker: ConflictChecker;

    beforeEach(() => {
      checker = new ConflictChecker();
    });

    const existingParties = [
      { id: '1', name: 'Acme Corporation', type: 'CLIENT' as const, relatedMatters: ['matter-1'] },
      { id: '2', name: 'John Smith', type: 'OPPOSING' as const, relatedMatters: ['matter-2'] },
      { id: '3', name: 'TechStart Inc', type: 'CLIENT' as const, relatedMatters: ['matter-3'], aliases: ['TechStart LLC'] },
    ];

    it('detects exact match conflict', () => {
      const result = checker.checkConflicts('Acme Corporation', existingParties);
      
      expect(result.hasConflict).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].matchType).toBe('EXACT');
      expect(result.matches[0].similarity).toBe(1.0);
    });

    it('detects alias match conflict', () => {
      const result = checker.checkConflicts('TechStart LLC', existingParties);
      
      expect(result.hasConflict).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.matches[0].matchType).toBe('ALIAS');
      expect(result.matches[0].similarity).toBe(0.95);
    });

    it('detects fuzzy match with high similarity', () => {
      const result = checker.checkConflicts('Acme Corp', existingParties);
      
      expect(result.hasConflict).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.matches[0].matchType).toBe('FUZZY');
      expect(result.matches[0].similarity).toBeGreaterThan(0.85);
    });

    it('allows non-conflicting name', () => {
      const result = checker.checkConflicts('New Client LLC', existingParties);
      
      expect(result.hasConflict).toBe(false);
      expect(result.severity).toBe('NONE');
      expect(result.matches).toHaveLength(0);
    });

    it('skips same matter unless opposing party', () => {
      const result = checker.checkConflicts('Acme Corporation', existingParties, 'matter-1');
      
      // Should skip because it's the same matter and client (not opposing)
      expect(result.hasConflict).toBe(false);
    });

    it('flags opposing party even in same matter', () => {
      const result = checker.checkConflicts('John Smith', existingParties, 'matter-2');
      
      expect(result.hasConflict).toBe(true);
      expect(result.matches[0].partyName).toBe('John Smith');
    });

    it('calculates Levenshtein distance correctly', () => {
      const result = checker.checkConflicts('Jon Smith', existingParties);
      
      expect(result.hasConflict).toBe(true);
      expect(result.matches.some(m => m.partyName === 'John Smith')).toBe(true);
    });

    it('generates conflict report', () => {
      const results = [
        checker.checkConflicts('Acme Corporation', existingParties),
        checker.checkConflicts('New Client', existingParties),
      ];

      const report = checker.generateConflictReport(results, 'matter-new');
      
      expect(report.matterId).toBe('matter-new');
      expect(report.totalChecks).toBe(2);
      expect(report.conflictsFound).toBe(1);
      expect(report.highSeverityCount).toBe(1);
      expect(report.summary).toContain('CRITICAL');
    });
  });

  describe('ThreeWayReconciliationService', () => {
    let service: ThreeWayReconciliationService;

    beforeEach(() => {
      service = new ThreeWayReconciliationService();
    });

    const bankStatement = [
      { date: '2024-01-01', description: 'Opening Balance', amount: 10000, balance: 10000, transactionType: 'DEPOSIT' as const },
      { date: '2024-01-15', description: 'Deposit - Client A', amount: 5000, balance: 15000, transactionType: 'DEPOSIT' as const },
      { date: '2024-01-20', description: 'Check #1001', amount: -2000, balance: 13000, transactionType: 'WITHDRAWAL' as const },
    ];

    const trustLedger = [
      { id: '1', date: '2024-01-15', description: 'Deposit - Client A', amount: 5000, clientId: 'client-a', matterId: 'matter-1', transactionType: 'DEPOSIT' as const, cleared: false },
      { id: '2', date: '2024-01-20', description: 'Check #1001', amount: 2000, clientId: 'client-a', matterId: 'matter-1', transactionType: 'DISBURSEMENT' as const, cleared: false },
    ];

    const clientLedgers = [
      {
        clientId: 'client-a',
        clientName: 'Client A',
        balance: 3000,
        transactions: [],
      },
    ];

    it('reconciles when all three ledgers balance', () => {
      const result = service.reconcile(bankStatement, trustLedger, clientLedgers, '2024-01-31');
      
      expect(result.reconciled).toBe(true);
      expect(result.status).toBe('BALANCED');
      expect(result.bankBalance).toBe(13000);
      expect(result.clientLedgersTotal).toBe(3000);
    });

    it('detects client ledger mismatch', () => {
      const badClientLedgers = [
        {
          clientId: 'client-a',
          clientName: 'Client A',
          balance: 5000, // Wrong - should be 3000
          transactions: [],
        },
      ];

      const result = service.reconcile(bankStatement, trustLedger, badClientLedgers, '2024-01-31');
      
      expect(result.reconciled).toBe(false);
      expect(result.discrepancies.some(d => d.severity === 'CRITICAL')).toBe(true);
    });

    it('identifies outstanding deposits', () => {
      const depositNotInBank = [
        ...trustLedger,
        { id: '3', date: '2024-01-30', description: 'Deposit - Client B', amount: 1000, clientId: 'client-b', matterId: 'matter-2', transactionType: 'DEPOSIT' as const, cleared: false },
      ];

      const result = service.reconcile(bankStatement, depositNotInBank, clientLedgers, '2024-01-31');
      
      expect(result.outstandingItems.deposits.length).toBeGreaterThan(0);
    });

    it('calculates days outstanding', () => {
      const oldDeposit = [
        ...trustLedger,
        { id: '3', date: '2023-12-01', description: 'Old Deposit', amount: 500, clientId: 'client-a', matterId: 'matter-1', transactionType: 'DEPOSIT' as const, cleared: false },
      ];

      const result = service.reconcile(bankStatement, oldDeposit, clientLedgers, '2024-01-31');
      
      const oldItem = result.outstandingItems.deposits.find(d => d.id === '3');
      expect(oldItem?.daysOutstanding).toBeGreaterThan(30);
    });

    it('generates reconciliation report', () => {
      const result = service.reconcile(bankStatement, trustLedger, clientLedgers, '2024-01-31');
      const report = service.generateReconciliationReport(result, '2024-01');

      expect(report.period).toBe('2024-01');
      expect(report.status).toBe('RECONCILED');
      expect(report.summary).toContain('successfully reconciled');
    });

    it('validates IOLTA compliance', () => {
      const result = service.reconcile(bankStatement, trustLedger, clientLedgers, '2024-01-31');
      const compliance = service.validateIOLTACompliance(result);

      expect(compliance.compliant).toBe(true);
      expect(compliance.violations).toHaveLength(0);
    });

    it('detects IOLTA violations', () => {
      const badClientLedgers = [
        {
          clientId: 'client-a',
          clientName: 'Client A',
          balance: 9999, // Way off
          transactions: [],
        },
      ];

      const result = service.reconcile(bankStatement, trustLedger, badClientLedgers, '2024-01-31');
      const compliance = service.validateIOLTACompliance(result);

      expect(compliance.compliant).toBe(false);
      expect(compliance.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Integration: Full Legal Compliance Workflow', () => {
    it('completes full conflict check and IOLTA setup', () => {
      const checker = new ConflictChecker();
      const ioltaService = new IOLTAComplianceService();

      // Check for conflicts
      const conflictResult = checker.checkConflicts('New Client Corp', [
        { id: '1', name: 'Old Client LLC', type: 'CLIENT', relatedMatters: ['matter-1'] },
      ]);

      expect(conflictResult.hasConflict).toBe(false);

      // Set up IOLTA account
      const account = {
        id: '1',
        accountId: 'iola-123',
        state: 'CA',
        balance: 10000,
        clientBalances: new Map([['client-1', 6000], ['client-2', 4000]]),
        bankName: 'Wells Fargo',
        accountNumber: '****5678',
        isActive: true,
      };

      const validation = ioltaService.validateTrustAccount(account);
      expect(validation.valid).toBe(true);
    });
  });
});
