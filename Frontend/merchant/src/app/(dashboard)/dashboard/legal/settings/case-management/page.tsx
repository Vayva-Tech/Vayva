'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Clock, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CaseManagementSettings {
  defaultPracticeAreaId?: string;
  autoGenerateCaseNumber: boolean;
  caseNumberFormat: string;
  defaultStage: string;
  enableConflictChecks: boolean;
  requireEngagementLetter: boolean;
  autoCloseInactiveDays: number;
  statuteLimitationAlerts: boolean;
  malpracticeIncidentReporting: boolean;
  clientConfidentialityWarnings: boolean;
}

export default function CaseManagementSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CaseManagementSettings>({
    autoGenerateCaseNumber: true,
    caseNumberFormat: '{YEAR}-{TYPE}-{SEQ}',
    defaultStage: 'intake',
    enableConflictChecks: true,
    requireEngagementLetter: false,
    autoCloseInactiveDays: 365,
    statuteLimitationAlerts: true,
    malpracticeIncidentReporting: true,
    clientConfidentialityWarnings: true,
  });

  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/legal/settings/case-management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Case management settings saved successfully');
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
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Case Management</h1>
          <p className="text-gray-700 mt-1">Configure matter and case handling preferences</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={20} className="text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="numbering">Case Numbering</TabsTrigger>
          <TabsTrigger value="stages">Stages & Status</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Scale size={20} />
              General Preferences
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultPracticeArea">Default Practice Area</Label>
                <select
                  id="defaultPracticeArea"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={settings.defaultPracticeAreaId || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultPracticeAreaId: e.target.value })
                  }
                >
                  <option value="">None (require selection)</option>
                  <option value="family">Family Law</option>
                  <option value="criminal">Criminal Defense</option>
                  <option value="personal-injury">Personal Injury</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="corporate">Corporate Law</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Conflict Checks</Label>
                  <p className="text-sm text-gray-700">
                    Automatically check for conflicts when opening new matters
                  </p>
                </div>
                <Switch
                  checked={settings.enableConflictChecks}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableConflictChecks: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Engagement Letter</Label>
                  <p className="text-sm text-gray-700">
                    Mandate signed engagement letter before case work begins
                  </p>
                </div>
                <Switch
                  checked={settings.requireEngagementLetter}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireEngagementLetter: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="autoCloseDays">Auto-Close Inactive Cases (Days)</Label>
                <Input
                  id="autoCloseDays"
                  type="number"
                  value={settings.autoCloseInactiveDays.toString()}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoCloseInactiveDays: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-700 mt-1">
                  Automatically close cases with no activity after this many days
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Case Numbering */}
        <TabsContent value="numbering" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Case Number Format
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Generate Case Numbers</Label>
                  <p className="text-sm text-gray-700">
                    Automatically assign unique case numbers to new matters
                  </p>
                </div>
                <Switch
                  checked={settings.autoGenerateCaseNumber}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoGenerateCaseNumber: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="caseNumberFormat">Case Number Format</Label>
                <Input
                  id="caseNumberFormat"
                  value={settings.caseNumberFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, caseNumberFormat: e.target.value })
                  }
                />
                <p className="text-sm text-gray-700 mt-1">
                  Available tokens: {'{YEAR}'}, {'{TYPE}'}, {'{SEQ}'}, {'{PRACTICE}'}
                </p>
                <Badge variant="secondary" className="mt-2">
                  Example: 2025-FAM-001
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Stages & Status */}
        <TabsContent value="stages" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Case Stages & Workflow
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultStage">Default Initial Stage</Label>
                <select
                  id="defaultStage"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  value={settings.defaultStage}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultStage: e.target.value })
                  }
                >
                  <option value="intake">Intake</option>
                  <option value="pleading">Pleading</option>
                  <option value="discovery">Discovery</option>
                  <option value="pre_trial">Pre-Trial</option>
                  <option value="trial">Trial</option>
                  <option value="post_trial">Post-Trial</option>
                  <option value="appeal">Appeal</option>
                </select>
              </div>

              <div>
                <Label>Custom Stage Pipeline</Label>
                <div className="mt-2 space-y-2">
                  {[
                    'Intake',
                    'Pleading',
                    'Discovery',
                    'Pre-Trial',
                    'Trial',
                    'Post-Trial',
                    'Appeal',
                    'Closed',
                  ].map((stage, index) => (
                    <div
                      key={stage}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium w-8">{index + 1}</span>
                      <span className="flex-1">{stage}</span>
                      <Badge variant="outline">Standard</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Compliance & Risk Management
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Statute of Limitations Alerts</Label>
                  <p className="text-sm text-gray-700">
                    Enable automatic tracking and alerts for limitation periods
                  </p>
                </div>
                <Switch
                  checked={settings.statuteLimitationAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, statuteLimitationAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Malpractice Incident Reporting</Label>
                  <p className="text-sm text-gray-700">
                    Allow staff to report potential malpractice incidents
                  </p>
                </div>
                <Switch
                  checked={settings.malpracticeIncidentReporting}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, malpracticeIncidentReporting: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Client Confidentiality Warnings</Label>
                  <p className="text-sm text-gray-700">
                    Display reminders when accessing sensitive case information
                  </p>
                </div>
                <Switch
                  checked={settings.clientConfidentialityWarnings}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, clientConfidentialityWarnings: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
