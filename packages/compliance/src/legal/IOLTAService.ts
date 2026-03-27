/**
 * IOLTA Compliance Service - Interest on Lawyers' Trust Accounts
 * Manages state-specific trust accounting requirements for legal practices
 */

import { logger } from '@vayva/shared';

export interface StateIOLTAConfig {
  state: string;
  interestRateMinimum: number; // Minimum required interest rate
  feeWaiverMinimum: number; // Minimum balance for fee waiver
  reportingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  clientLedgerRequired: boolean;
  threeWayReconciliationRequired: boolean;
  overdraftNotificationRequired: boolean;
  eligibleInstitutions: string[]; // List of approved banks
}

export interface TrustAccount {
  id: string;
  accountId: string;
  state: string;
  balance: number;
  clientBalances: Map<string, number>; // Client ID -> Balance
  bankName: string;
  accountNumber: string;
  isActive: boolean;
}

// State-specific IOLTA configurations
export const STATE_IOLTA_CONFIGS: Record<string, StateIOLTAConfig> = {
  CALIFORNIA: {
    state: 'CA',
    interestRateMinimum: 0.50,
    feeWaiverMinimum: 1000,
    reportingFrequency: 'QUARTERLY',
    clientLedgerRequired: true,
    threeWayReconciliationRequired: true,
    overdraftNotificationRequired: true,
    eligibleInstitutions: ['Wells Fargo', 'Bank of America', 'Chase', 'US Bank'],
  },
  NEW_YORK: {
    state: 'NY',
    interestRateMinimum: 0.75,
    feeWaiverMinimum: 2500,
    reportingFrequency: 'MONTHLY',
    clientLedgerRequired: true,
    threeWayReconciliationRequired: true,
    overdraftNotificationRequired: true,
    eligibleInstitutions: ['Chase', 'CitiBank', 'TD Bank', 'Capital One'],
  },
  TEXAS: {
    state: 'TX',
    interestRateMinimum: 0.40,
    feeWaiverMinimum: 500,
    reportingFrequency: 'MONTHLY',
    clientLedgerRequired: true,
    threeWayReconciliationRequired: true,
    overdraftNotificationRequired: true,
    eligibleInstitutions: ['Wells Fargo', 'Chase', 'BBVA', 'Frost Bank'],
  },
  FLORIDA: {
    state: 'FL',
    interestRateMinimum: 0.60,
    feeWaiverMinimum: 1500,
    reportingFrequency: 'QUARTERLY',
    clientLedgerRequired: true,
    threeWayReconciliationRequired: true,
    overdraftNotificationRequired: true,
    eligibleInstitutions: ['Bank of America', 'Wells Fargo', 'SunTrust', 'TD Bank'],
  },
  ILLINOIS: {
    state: 'IL',
    interestRateMinimum: 0.50,
    feeWaiverMinimum: 2000,
    reportingFrequency: 'MONTHLY',
    clientLedgerRequired: true,
    threeWayReconciliationRequired: true,
    overdraftNotificationRequired: true,
    eligibleInstitutions: ['Chase', 'Bank of America', 'BMO Harris', 'PNC'],
  },
};

export class IOLTAComplianceService {
  private configCache: Map<string, StateIOLTAConfig> = new Map();

  constructor() {
    // Initialize with default state configs
    Object.entries(STATE_IOLTA_CONFIGS).forEach(([key, config]) => {
      this.configCache.set(key, config);
    });
  }

  /**
   * Get IOLTA configuration for a specific state
   */
  getStateConfig(stateCode: string): StateIOLTAConfig | null {
    const config = this.configCache.get(stateCode.toUpperCase());
    
    if (!config) {
      logger.warn('[IOLTA] No configuration found for state', { stateCode });
      return null;
    }

    return config;
  }

  /**
   * Validate trust account against state requirements
   */
  validateTrustAccount(account: TrustAccount): { valid: boolean; errors: string[] } {
    const config = this.getStateConfig(account.state);
    
    if (!config) {
      return {
        valid: false,
        errors: [`No IOLTA configuration found for state: ${account.state}`],
      };
    }

    const errors: string[] = [];

    // Check if bank is eligible
    if (!config.eligibleInstitutions.includes(account.bankName)) {
      errors.push(
        `Bank "${account.bankName}" is not an eligible institution in ${account.state}`
      );
    }

    // Check minimum balance for fee waiver
    if (account.balance < config.feeWaiverMinimum) {
      errors.push(
        `Balance $${account.balance.toFixed(2)} is below fee waiver minimum $${config.feeWaiverMinimum.toFixed(2)}`
      );
    }

    // Verify client ledger requirement
    if (config.clientLedgerRequired && account.clientBalances.size === 0) {
      errors.push('Client ledger required but no client balances found');
    }

    // Sum of client balances should equal total balance
    const clientBalanceSum = Array.from(account.clientBalances.values()).reduce(
      (sum, balance) => sum + balance,
      0
    );

    const tolerance = 0.01; // Allow 1 cent tolerance for rounding
    if (Math.abs(clientBalanceSum - account.balance) > tolerance) {
      errors.push(
        `Client balances ($${clientBalanceSum.toFixed(2)}) do not match total balance ($${account.balance.toFixed(2)})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if overdraft notification is required for state
   */
  requiresOverdraftNotification(stateCode: string): boolean {
    const config = this.getStateConfig(stateCode);
    return config?.overdraftNotificationRequired ?? false;
  }

  /**
   * Get reporting frequency for state
   */
  getReportingFrequency(stateCode: string): 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | null {
    const config = this.getStateConfig(stateCode);
    return config?.reportingFrequency ?? null;
  }

  /**
   * Calculate required interest based on state minimums
   */
  calculateRequiredInterest(balance: number, stateCode: string): number {
    const config = this.getStateConfig(stateCode);
    
    if (!config) {
      return 0;
    }

    const annualInterest = balance * (config.interestRateMinimum / 100);
    return annualInterest / 12; // Monthly interest
  }

  /**
   * Generate compliance report for audit
   */
  generateComplianceReport(account: TrustAccount): {
    state: string;
    generatedAt: string;
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const validation = this.validateTrustAccount(account);
    const config = this.getStateConfig(account.state);
    const recommendations: string[] = [];

    if (config) {
      // Add recommendations based on account status
      if (account.balance < config.feeWaiverMinimum * 1.2) {
        recommendations.push(
          `Consider increasing balance to $${(config.feeWaiverMinimum * 1.2).toFixed(2)} to maintain comfortable buffer above fee waiver minimum`
        );
      }

      if (!config.eligibleInstitutions.includes(account.bankName)) {
        recommendations.push(
          `Transfer account to an eligible institution: ${config.eligibleInstitutions.join(', ')}`
        );
      }
    }

    return {
      state: account.state,
      generatedAt: new Date().toISOString(),
      compliant: validation.valid,
      issues: validation.errors,
      recommendations,
    };
  }

  /**
   * Update or add state configuration (for admin use)
   */
  updateStateConfig(stateCode: string, config: Partial<StateIOLTAConfig>): void {
    const existingConfig = this.getStateConfig(stateCode);
    
    if (existingConfig) {
      this.configCache.set(stateCode.toUpperCase(), { ...existingConfig, ...config });
      logger.info('[IOLTA] Updated state configuration', { stateCode });
    } else {
      logger.warn('[IOLTA] Cannot update non-existent configuration', { stateCode });
    }
  }

  /**
   * Get all configured states
   */
  getConfiguredStates(): string[] {
    return Array.from(this.configCache.keys());
  }
}

// Singleton instance
export const ioltaService = new IOLTAComplianceService();
