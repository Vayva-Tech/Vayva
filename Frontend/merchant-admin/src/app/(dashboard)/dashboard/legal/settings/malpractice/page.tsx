'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileWarning } from 'lucide-react';

export default function MalpracticeSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-serif">Malpractice & Risk</h1>
          <p className="text-text-secondary mt-1">Incident reporting and insurance information</p>
        </div>
        <Button>Save Settings</Button>
      </div>

      <Card className="p-6 border-l-4 border-red-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          Incident Reporting
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Anonymous Reporting</Label>
              <p className="text-sm text-text-secondary">Allow staff to report incidents anonymously</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Notify Managing Partner</Label>
              <p className="text-sm text-text-secondary">Immediate notification for serious incidents</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileWarning size={20} />
          Insurance Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Insurance Carrier</Label>
            <Input defaultValue=" Lawyers Mutual Insurance Co." />
          </div>
          <div>
            <Label>Policy Number</Label>
            <Input defaultValue="MLP-2024-123456" />
          </div>
          <div>
            <Label>Coverage Amount (Per Claim)</Label>
            <Input defaultValue="$1,000,000" />
          </div>
          <div>
            <Label>Aggregate Limit</Label>
            <Input defaultValue="$3,000,000" />
          </div>
          <div>
            <Label>Policy Effective Date</Label>
            <Input type="date" defaultValue="2024-01-01" />
          </div>
          <div>
            <Label>Policy Expiration Date</Label>
            <Input type="date" defaultValue="2025-12-31" />
          </div>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Risk Management Best Practices</h4>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• Document all client communications promptly</li>
          <li>• Maintain detailed time records for all matters</li>
          <li>• Follow up on all deadlines and court dates</li>
          <li>• Obtain written consent for conflicts waivers</li>
          <li>• Report potential issues immediately</li>
        </ul>
      </div>
    </div>
  );
}
