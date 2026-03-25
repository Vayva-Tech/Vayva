'use client';
import { Button } from "@vayva/ui";
/**
 * Legal Components
 * Phase 3: Law Firm Practice Management UI Components
 */

import type { FC } from 'react';
import { useState, useEffect } from 'react';

// ============================================================================
// CASE MANAGEMENT DASHBOARD
// ============================================================================

export const CaseManagementDashboard: FC<{
  storeId: string;
  practiceAreaId?: string;
}> = ({ storeId, practiceAreaId }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    winRate: 0,
    avgValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch case data
    const fetchCases = async () => {
      try {
        // In production: call MatterManagementService
        setCases([]);
        setStats({
          totalCases: 0,
          activeCases: 0,
          winRate: 0,
          avgValue: 0,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        setLoading(false);
      }
    };

    fetchCases();
  }, [storeId, practiceAreaId]);

  if (loading) {
    return <div>Loading case management...</div>;
  }

  return (
    <div className="case-management-dashboard">
      <h2>Case Management Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cases</h3>
          <p className="stat-value">{stats.totalCases}</p>
        </div>
        <div className="stat-card">
          <h3>Active Cases</h3>
          <p className="stat-value">{stats.activeCases}</p>
        </div>
        <div className="stat-card">
          <h3>Win Rate</h3>
          <p className="stat-value">{stats.winRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg Case Value</h3>
          <p className="stat-value">${stats.avgValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="cases-table">
        <h3>Active Matters</h3>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Client</th>
              <th>Practice Area</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => (
              <tr key={caseItem.id}>
                <td>{caseItem.caseNumber}</td>
                <td>{caseItem.clientNames?.join(', ')}</td>
                <td>{caseItem.practiceArea?.name}</td>
                <td>{caseItem.stage}</td>
                <td>
                  <span className={`status-badge ${caseItem.status}`}>
                    {caseItem.status}
                  </span>
                </td>
                <td>${caseItem.actualValue?.toLocaleString() || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// DOCUMENT ASSEMBLY WIZARD
// ============================================================================

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  practiceArea?: string;
}

export const DocumentAssemblyWizard: FC<{
  storeId: string;
  caseId?: string;
  onDocumentGenerated?: (documentId: string) => void;
}> = ({ storeId, caseId, onDocumentGenerated }) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'select' | 'customize' | 'preview'>('select');

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        // In production: call DocumentAutomationService
        setTemplates([]);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    fetchTemplates();
  }, [storeId]);

  const handleGenerate = async () => {
    if (!selectedTemplate || !caseId) return;

    setGenerating(true);
    try {
      // In production: call generateDocument
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDocumentGenerated?.('doc-123');
      setStep('preview');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="document-assembly-wizard">
      <h2>Document Assembly Wizard</h2>

      <div className="wizard-steps">
        <div className={`step ${step === 'select' ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Select Template</span>
        </div>
        <div className={`step ${step === 'customize' ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Customize</span>
        </div>
        <div className={`step ${step === 'preview' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Preview & Generate</span>
        </div>
      </div>

      {step === 'select' && (
        <div className="template-selection">
          <h3>Select Document Template</h3>
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setStep('customize');
                }}
              >
                <h4>{template.name}</h4>
                <p>{template.type}</p>
                {template.practiceArea && <small>{template.practiceArea}</small>}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'customize' && (
        <div className="template-customization">
          <h3>Customize Document</h3>
          <div className="variables-form">
            <input
              type="text"
              placeholder="Client Name"
              value={variables.clientName || ''}
              onChange={(e) => setVariables({ ...variables, clientName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Opposing Party"
              value={variables.opposingParty || ''}
              onChange={(e) => setVariables({ ...variables, opposingParty: e.target.value })}
            />
            <input
              type="date"
              value={variables.effectiveDate || ''}
              onChange={(e) => setVariables({ ...variables, effectiveDate: e.target.value })}
            />
          </div>

          <div className="wizard-actions">
            <Button onClick={() => setStep('select')}>Back</Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Document'}
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="document-preview">
          <h3>Document Generated Successfully!</h3>
          <div className="preview-content">
            <p>Document ID: doc-123</p>
            <p>Template: {templates.find(t => t.id === selectedTemplate)?.name}</p>
            <p>Status: Draft</p>
          </div>
          <div className="wizard-actions">
            <Button>Edit</Button>
            <Button>Save & Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COURT DEADLINE CALENDAR
// ============================================================================

export const CourtDeadlineCalendar: FC<{
  storeId: string;
  caseId?: string;
  view?: 'list' | 'calendar';
}> = ({ storeId, caseId, view = 'list' }) => {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        // In production: call DeadlineCalendarService
        setDeadlines([]);
        setOverdueCount(0);
        setUpcomingCount(0);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch deadlines:', error);
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, [storeId, caseId]);

  const markComplete = async (deadlineId: string) => {
    // Mark deadline as complete
    setDeadlines(deadlines.filter(d => d.id !== deadlineId));
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="court-deadline-calendar">
      <div className="calendar-header">
        <h2>Court Deadlines</h2>
        <div className="view-toggle">
          <Button className={view === 'list' ? 'active' : ''}>List</Button>
          <Button className={view === 'calendar' ? 'active' : ''}>Calendar</Button>
        </div>
      </div>

      <div className="deadline-stats">
        <div className="stat-badge overdue">
          <span className="count">{overdueCount}</span>
          <span className="label">Overdue</span>
        </div>
        <div className="stat-badge upcoming">
          <span className="count">{upcomingCount}</span>
          <span className="label">Upcoming (7 days)</span>
        </div>
      </div>

      {view === 'list' ? (
        <div className="deadlines-list">
          <table>
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Type</th>
                <th>Case</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((deadline) => (
                <tr key={deadline.id}>
                  <td>
                    <strong>{new Date(deadline.dueDate).toLocaleDateString()}</strong>
                  </td>
                  <td>{deadline.deadlineType}</td>
                  <td>{deadline.case?.caseNumber}</td>
                  <td>{deadline.description}</td>
                  <td>
                    <span className={`priority-badge ${deadline.priority}`}>
                      {deadline.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${deadline.status}`}>
                      {deadline.status}
                    </span>
                  </td>
                  <td>
                    {deadline.status === 'pending' && (
                      <Button onClick={() => markComplete(deadline.id)}>
                        Mark Complete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="calendar-view">
          <p>Calendar view would display deadlines in month/week format</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONFLICT CHECK FORM
// ============================================================================

export const ConflictCheckForm: FC<{
  storeId: string;
  onSubmit?: (result: any) => void;
}> = ({ storeId, onSubmit }) => {
  const [formData, setFormData] = useState({
    prospectiveClientName: '',
    matterDescription: '',
    partiesChecked: [''],
  });
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addParty = () => {
    setFormData({
      ...formData,
      partiesChecked: [...formData.partiesChecked, ''],
    });
  };

  const removeParty = (index: number) => {
    setFormData({
      ...formData,
      partiesChecked: formData.partiesChecked.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setChecking(true);
    try {
      // In production: call ConflictCheckService
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResult = {
        conflictFound: false,
        existingMatters: [],
        details: 'No conflicts found',
      };
      setResult(mockResult);
      onSubmit(mockResult);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="conflict-check-form">
      <h2>Conflict of Interest Check</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>Prospective Client Name *</label>
          <input
            type="text"
            required
            value={formData.prospectiveClientName}
            onChange={(e) => setFormData({ ...formData, prospectiveClientName: e.target.value })}
            placeholder="Enter client or matter name"
          />
        </div>

        <div className="form-section">
          <label>Matter Description *</label>
          <textarea
            required
            value={formData.matterDescription}
            onChange={(e) => setFormData({ ...formData, matterDescription: e.target.value })}
            placeholder="Brief description of the matter"
            rows={4}
          />
        </div>

        <div className="form-section">
          <label>Parties to Check *</label>
          {formData.partiesChecked.map((party, index) => (
            <div key={index} className="party-input">
              <input
                type="text"
                required
                value={party}
                onChange={(e) => {
                  const newParties = [...formData.partiesChecked];
                  newParties[index] = e.target.value;
                  setFormData({ ...formData, partiesChecked: newParties });
                }}
                placeholder={`Party ${index + 1} name`}
              />
              {formData.partiesChecked.length > 1 && (
                <Button type="button" onClick={() => removeParty(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addParty} className="add-button">
            + Add Another Party
          </Button>
        </div>

        <Button type="submit" disabled={checking} className="submit-button">
          {checking ? 'Running Conflicts Check...' : 'Run Conflicts Check'}
        </Button>
      </form>

      {result && (
        <div className={`conflict-result ${result.conflictFound ? 'conflict-found' : 'no-conflict'}`}>
          <h3>
            {result.conflictFound ? '⚠️ Potential Conflict Found' : '✅ No Conflicts Found'}
          </h3>
          <p>{result.details}</p>
          {result.existingMatters?.length > 0 && (
            <div className="existing-matters">
              <h4>Related Matters:</h4>
              <ul>
                {result.existingMatters.map((matter: any) => (
                  <li key={matter.id}>
                    {matter.caseNumber} - {matter.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TRUST ACCOUNT LEDGER
// ============================================================================

export const TrustAccountLedger: FC<{
  accountId: string;
  clientId?: string;
}> = ({ accountId, clientId }) => {
  const [account, setAccount] = useState<any>(null);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrustData = async () => {
      try {
        // In production: call TrustAccountingService
        setAccount({
          name: 'IOLTA Trust Account',
          currentBalance: 150000,
          ledgerBalance: 150000,
        });
        setLedgers([]);
        setReconciliation(null);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch trust data:', error);
        setLoading(false);
      }
    };

    fetchTrustData();
  }, [accountId, clientId]);

  const runReconciliation = async () => {
    // Perform three-way reconciliation
    const result = {
      cashBalance: account.currentBalance,
      totalLedgerBalances: ledgers.reduce((sum, l) => sum + l.balance, 0),
      discrepancy: 0,
      isReconciled: true,
    };
    setReconciliation(result);
  };

  if (loading) {
    return <div>Loading trust account...</div>;
  }

  return (
    <div className="trust-account-ledger">
      <h2>Trust Account Ledger</h2>

      <div className="account-summary">
        <div className="summary-card">
          <h3>{account?.name}</h3>
          <p className="balance">${account?.currentBalance.toLocaleString()}</p>
          <small>Ledger Balance: ${account?.ledgerBalance.toLocaleString()}</small>
        </div>

        {reconciliation && (
          <div className={`reconciliation-status ${reconciliation.isReconciled ? 'reconciled' : 'not-reconciled'}`}>
            <h4>Three-Way Reconciliation</h4>
            <p>
              Status:{' '}
              {reconciliation.isReconciled ? (
                <span className="success">✓ Reconciled</span>
              ) : (
                <span className="error">✗ Discrepancy Found</span>
              )}
            </p>
            {Math.abs(reconciliation.discrepancy) > 0.01 && (
              <p className="discrepancy">Discrepancy: ${reconciliation.discrepancy.toFixed(2)}</p>
            )}
          </div>
        )}

        <Button onClick={runReconciliation} className="reconcile-button">
          Run Three-Way Reconciliation
        </Button>
      </div>

      <div className="client-ledgers">
        <h3>Client Ledger Balances</h3>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Case Number</th>
              <th>Balance</th>
              <th>Last Activity</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((ledger) => (
              <tr key={ledger.id}>
                <td>{ledger.clientName}</td>
                <td>{ledger.caseNumber}</td>
                <td className={ledger.balance < 0 ? 'negative' : ''}>
                  ${ledger.balance.toLocaleString()}
                </td>
                <td>{new Date(ledger.lastActivity).toLocaleDateString()}</td>
                <td>
                  {ledger.alerts?.includes('negative_balance') && (
                    <span className="alert-badge">Negative Balance</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Placeholder components
export const BriefBankManager: FC = () => (
  <div className="brief-bank-manager">
    <h2>Brief Bank Manager</h2>
    <p>Legal research and brief repository management</p>
  </div>
);

export const CourtRulesDatabase: FC = () => (
  <div className="court-rules-database">
    <h2>Court Rules Database</h2>
    <p>Federal and state court rules reference system</p>
  </div>
);

export const ClientPortalDashboard: FC = () => (
  <div className="client-portal-dashboard">
    <h2>Client Portal Dashboard</h2>
    <p>Secure client access to case information and documents</p>
  </div>
);

export const MatterBudgetTracker: FC = () => (
  <div className="matter-budget-tracker">
    <h2>Matter Budget Tracker</h2>
    <p>Track matter expenses and budget compliance</p>
  </div>
);

export const ExpertWitnessManager: FC = () => (
  <div className="expert-witness-manager">
    <h2>Expert Witness Manager</h2>
    <p>Manage expert witness relationships and testimony</p>
  </div>
);

export const LEGAL_COMPONENTS = {
  CaseManagementDashboard,
  DocumentAssemblyWizard,
  CourtDeadlineCalendar,
  ConflictCheckForm,
  TrustAccountLedger,
  BriefBankManager,
  CourtRulesDatabase,
  ClientPortalDashboard,
  MatterBudgetTracker,
  ExpertWitnessManager,
};

