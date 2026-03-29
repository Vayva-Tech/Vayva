'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DollarSign, FileText, Clock, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@vayva/shared';

interface BillingSettings {
  defaultHourlyRate: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  lateFeePercentage: number;
  enableWipTracking: boolean;
  autoGenerateInvoices: boolean;
  requirePrepayment: boolean;
  minimumBillingIncrement: number;
}

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings>({
    defaultHourlyRate: 250,
    invoicePrefix: 'INV',
    paymentTermsDays: 30,
    lateFeePercentage: 1.5,
    enableWipTracking: true,
    autoGenerateInvoices: false,
    requirePrepayment: false,
    minimumBillingIncrement: 6, // minutes (0.1 hours)
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/legal/settings/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Billing settings saved successfully');
        toast.success('Billing settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save billing settings';
      logger.error('[BILLING_SETTINGS_ERROR]', { error });
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
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Billing & Invoicing</h1>
          <p className="text-gray-700 mt-1">Configure billing rates, invoicing, and payment terms</p>
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
        {/* Default Rates */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Default Billing Rates
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
              <Input
                id="defaultHourlyRate"
                type="number"
                value={settings.defaultHourlyRate.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, defaultHourlyRate: parseFloat(e.target.value) })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Standard hourly rate for time entries (can be overridden per attorney)
              </p>
            </div>

            <div>
              <Label htmlFor="minIncrement">Minimum Billing Increment (minutes)</Label>
              <Input
                id="minIncrement"
                type="number"
                value={settings.minimumBillingIncrement.toString()}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minimumBillingIncrement: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Round time entries to nearest increment (6 min = 0.1 hours, 15 min = 0.25 hours)
              </p>
            </div>
          </div>
        </Card>

        {/* Invoice Configuration */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} />
            Invoice Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={(e) =>
                  setSettings({ ...settings, invoicePrefix: e.target.value })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Example: INV-2025-001
              </p>
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={settings.paymentTermsDays.toString()}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentTermsDays: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Net payment terms (e.g., Net 30, Net 15)
              </p>
            </div>

            <div>
              <Label htmlFor="lateFee">Late Fee Percentage (%)</Label>
              <Input
                id="lateFee"
                type="number"
                step="0.1"
                value={settings.lateFeePercentage.toString()}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lateFeePercentage: parseFloat(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-700 mt-1">
                Monthly late fee applied to overdue invoices
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Generate Monthly Invoices</Label>
                <p className="text-sm text-gray-700">
                  Automatically create recurring invoices for retainer clients
                </p>
              </div>
              <Switch
                checked={settings.autoGenerateInvoices}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoGenerateInvoices: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* WIP Tracking */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator size={20} />
            Work-in-Progress (WIP) Tracking
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable WIP Tracking</Label>
                <p className="text-sm text-gray-700">
                  Track unbilled time and expenses as work-in-progress
                </p>
              </div>
              <Switch
                checked={settings.enableWipTracking}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableWipTracking: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Prepayment</Label>
                <p className="text-sm text-gray-700">
                  Require payment before work begins on new matters
                </p>
              </div>
              <Switch
                checked={settings.requirePrepayment}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requirePrepayment: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Write-Off Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} />
            Write-Off Approval Limits
          </h3>

          <div className="space-y-4">
            <div>
              <Label>Associate Write-Off Limit ($)</Label>
              <Input type="number" defaultValue="100" />
              <p className="text-sm text-gray-700 mt-1">
                Maximum amount associates can write off without approval
              </p>
            </div>

            <div>
              <Label>Partner Write-Off Limit ($)</Label>
              <Input type="number" defaultValue="500" />
              <p className="text-sm text-gray-700 mt-1">
                Maximum amount partners can write off without approval
              </p>
            </div>

            <div>
              <Label>Managing Partner Limit ($)</Label>
              <Input type="number" defaultValue="5000" />
              <p className="text-sm text-gray-700 mt-1">
                Maximum amount managing partners can write off
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
