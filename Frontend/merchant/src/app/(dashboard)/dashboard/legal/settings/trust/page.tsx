'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Building, FileCheck, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@vayva/shared';

interface TrustSettings {
  enableIolta: boolean;
  ioltaAccountNumber: string;
  jurisdiction: string; // State bar association
  enableThreeWayReconciliation: boolean;
  reconciliationFrequency: 'monthly' | 'quarterly';
  lowBalanceThreshold: number;
  requireDualApproval: boolean;
  autoDisburseFees: boolean;
  clientLedgerRequired: boolean;
  overdraftNotification: boolean;
  annualReporting: boolean;
}

export default function TrustAccountSettingsPage() {
  const [settings, setSettings] = useState<TrustSettings>({
    enableIolta: true,
    ioltaAccountNumber: '',
    jurisdiction: 'CA', // Default to California
    enableThreeWayReconciliation: true,
    reconciliationFrequency: 'monthly',
    lowBalanceThreshold: 1000,
    requireDualApproval: true,
    autoDisburseFees: false,
    clientLedgerRequired: true,
    overdraftNotification: true,
    annualReporting: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/legal/settings/trust', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Trust account settings saved successfully');
        toast.success('Trust account settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save trust account settings';
      logger.error('[TRUST_ACCOUNT_ERROR]', { error });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Trust Accounting</h1>
          <p className="text-gray-700 mt-1">IOLTA compliance and trust fund management</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        {/* Jurisdiction Selection - State-Specific Rules */}
        <Card className="p-6 border-l-4 border-red-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Jurisdiction & Compliance Rules
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="jurisdiction">State Bar Association</Label>
              <select
                id="jurisdiction"
                className="w-full mt-1 p-2 border rounded"
                value={settings.jurisdiction}
                onChange={(e) =>
                  setSettings({ ...settings, jurisdiction: e.target.value })
                }
              >
                <option value="CA">California - State Bar of California</option>
                <option value="NY">New York - New York State Bar Association</option>
                <option value="TX">Texas - State Bar of Texas</option>
                <option value="FL">Florida - The Florida Bar</option>
                <option value="IL">Illinois - Illinois Attorney Registration & Disciplinary Commission</option>
                <option value="PA">Pennsylvania - Pennsylvania Bar Association</option>
                <option value="OH">Ohio - Supreme Court of Ohio</option>
                <option value="GA">Georgia - State Bar of Georgia</option>
                <option value="NC">North Carolina - North Carolina State Bar</option>
                <option value="MI">Michigan - State Bar of Michigan</option>
              </select>
              <p className="text-sm text-gray-700 mt-1">
                Select your primary jurisdiction for state-specific IOLTA compliance rules
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Selected Jurisdiction: {settings.jurisdiction}
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                {settings.jurisdiction === 'CA' && (
                  <>
                    <li>• Monthly reconciliation required (Rule 1.15)</li>
                    <li>• Overdraft notification mandatory</li>
                    <li>• Annual IOLTA certification required</li>
                    <li>• Client ledger cards must be maintained</li>
                  </>
                )}
                {settings.jurisdiction === 'NY' && (
                  <>
                    <li>• Monthly reconciliation required (Part 1300)</li>
                    <li>• Approved depositories only</li>
                    <li>• Bounced check reporting mandatory</li>
                    <li>• Retain records for 7 years</li>
                  </>
                )}
                {settings.jurisdiction === 'TX' && (
                  <>
                  <li>• Monthly reconciliation required (Rule 1.14)</li>
                  <li>• IOLTA account must be interest-bearing</li>
                  <li>• Annual compliance certificate</li>
                  <li>• Dual signature requirement for checks over $2,500</li>
                </>
                )}
                {!['CA', 'NY', 'TX'].includes(settings.jurisdiction) && (
                  <li>• Check your state bar's specific IOLTA rules</li>
                )}
              </ul>
            </div>
          </div>
        </Card>

        {/* IOLTA Configuration */}
        <Card className="p-6 border-l-4 border-blue-900">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building size={20} />
            IOLTA Account Configuration
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable IOLTA Tracking</Label>
                <p className="text-sm text-gray-700">
                  Track Interest on Lawyers' Trust Accounts for client funds
                </p>
              </div>
              <Switch
                checked={settings.enableIolta}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableIolta: checked })
                }
              />
            </div>

            <div>
              <Label htmlFor="ioltaAccount">IOLTA Account Number</Label>
              <Input
                id="ioltaAccount"
                value={settings.ioltaAccountNumber}
                onChange={(e) =>
                  setSettings({ ...settings, ioltaAccountNumber: e.target.value })
                }
                placeholder="XXXX-XXXX-1234"
              />
              <p className="text-sm text-gray-700 mt-1">
                Last 4 digits only for security
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Client Ledger Cards Required</Label>
                <p className="text-sm text-gray-700">
                  Maintain individual ledger for each client (required in most states)
                </p>
              </div>
              <Switch
                checked={settings.clientLedgerRequired}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, clientLedgerRequired: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Overdraft Notification</Label>
                <p className="text-sm text-gray-700">
                  Automatic reporting to bar association if trust account overdrafts
                </p>
              </div>
              <Switch
                checked={settings.overdraftNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, overdraftNotification: checked })
                }
              />
            </div>

            <AlertCircle className="text-yellow-600" size={20} />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Compliance Notice:</strong> IOLTA accounts must be maintained at approved
                financial institutions. Ensure proper tracking of all client funds to maintain
                bar association compliance.
              </p>
            </div>
          </div>
        </Card>

        {/* Three-Way Reconciliation */}
        <Card className="p-6 border-l-4 border-green-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator size={20} />
            Three-Way Reconciliation
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Three-Way Reconciliation</Label>
                <p className="text-sm text-gray-700">
                  Verify: Cash + Ledgers = Total Liability (required for compliance)
                </p>
              </div>
              <Switch
                checked={settings.enableThreeWayReconciliation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableThreeWayReconciliation: checked })
                }
              />
            </div>

            <div>
              <Label>Reconciliation Frequency</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={settings.reconciliationFrequency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reconciliationFrequency: e.target.value as 'monthly' | 'quarterly',
                  })
                }
              >
                <option value="monthly">Monthly (Recommended)</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <p className="text-sm text-gray-700 mt-1">
                Most jurisdictions require monthly reconciliation
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Three-Way Match:</strong> The sum of all client ledger balances must equal
                the total trust liability, which must equal the bank statement balance.
              </p>
            </div>
          </div>
        </Card>

        {/* Approval & Security */}
        <Card className="p-6 border-l-4 border-purple-900">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCheck size={20} />
            Approval & Security
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Dual Approval for Disbursements</Label>
                <p className="text-sm text-gray-700">
                  Two signatures required for trust fund withdrawals
                </p>
              </div>
              <Switch
                checked={settings.requireDualApproval}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireDualApproval: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Disburse Earned Fees</Label>
                <p className="text-sm text-gray-700">
                  Automatically transfer earned fees from trust to operating
                </p>
              </div>
              <Switch
                checked={settings.autoDisburseFees}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoDisburseFees: checked })
                }
              />
            </div>

            <div>
              <Label htmlFor="lowBalance">Low Balance Alert Threshold ($)</Label>
              <Input
                id="lowBalance"
                type="number"
                value={settings.lowBalanceThreshold.toString()}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lowBalanceThreshold: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Alert when client ledger balance falls below this amount
              </p>
            </div>
          </div>
        </Card>

        {/* Compliance Warnings */}
        <Card className="p-6 border-l-4 border-red-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Important Compliance Requirements
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
              <div>
                <p className="text-sm font-medium">Never commingle personal funds with trust</p>
                <p className="text-xs text-gray-700">
                  Maintain strict separation between operating and trust accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
              <div>
                <p className="text-sm font-medium">Maintain detailed transaction records</p>
                <p className="text-xs text-gray-700">
                  All deposits and disbursements must be documented with supporting documentation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
              <div>
                <p className="text-sm font-medium">Prompt notification of insufficient funds</p>
                <p className="text-xs text-gray-700">
                  Immediately notify clients if their ledger balance becomes negative
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
