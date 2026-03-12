'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Building, FileCheck, Calculator } from 'lucide-react';

interface TrustSettings {
  enableIolta: boolean;
  ioltaAccountNumber: string;
  enableThreeWayReconciliation: boolean;
  reconciliationFrequency: 'monthly' | 'quarterly';
  lowBalanceThreshold: number;
  requireDualApproval: boolean;
  autoDisburseFees: boolean;
}

export default function TrustAccountSettingsPage() {
  const [settings, setSettings] = useState<TrustSettings>({
    enableIolta: true,
    ioltaAccountNumber: '',
    enableThreeWayReconciliation: true,
    reconciliationFrequency: 'monthly',
    lowBalanceThreshold: 1000,
    requireDualApproval: true,
    autoDisburseFees: false,
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
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-serif">Trust Accounting</h1>
          <p className="text-text-secondary mt-1">IOLTA compliance and trust fund management</p>
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
                <p className="text-sm text-text-secondary">
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
              <p className="text-sm text-text-secondary mt-1">
                Last 4 digits only for security
              </p>
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
                <p className="text-sm text-text-secondary">
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
              <p className="text-sm text-text-secondary mt-1">
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
                <p className="text-sm text-text-secondary">
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
                <p className="text-sm text-text-secondary">
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
              <p className="text-sm text-text-secondary mt-1">
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
                <p className="text-xs text-text-secondary">
                  Maintain strict separation between operating and trust accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
              <div>
                <p className="text-sm font-medium">Maintain detailed transaction records</p>
                <p className="text-xs text-text-secondary">
                  All deposits and disbursements must be documented with supporting documentation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
              <div>
                <p className="text-sm font-medium">Prompt notification of insufficient funds</p>
                <p className="text-xs text-text-secondary">
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
