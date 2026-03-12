'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function CLETrackingSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-serif">CLE Tracking</h1>
          <p className="text-text-secondary mt-1">Continuing Legal Education credit requirements</p>
        </div>
        <Button>Save Settings</Button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap size={20} />
          Credit Requirements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Total Credits Required</Label>
            <Input type="number" defaultValue="24" />
            <p className="text-sm text-text-secondary mt-1">Per reporting period</p>
          </div>
          <div>
            <Label>Ethics Credits Required</Label>
            <Input type="number" defaultValue="4" />
            <p className="text-sm text-text-secondary mt-1">Minimum ethics hours</p>
          </div>
          <div>
            <Label>Reporting Period</Label>
            <select className="w-full mt-1 p-2 border rounded">
              <option>Annual</option>
              <option>Biennial (2 years)</option>
              <option>Triennial (3 years)</option>
            </select>
          </div>
          <div>
            <Label>Compliance Deadline</Label>
            <Input type="date" defaultValue="2025-12-31" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Approved Providers
        </h3>
        <p className="text-sm text-text-secondary mb-4">Automatically track credits from approved CLE providers</p>
        <div className="space-y-2">
          {['State Bar Association', 'ABA Center', 'LawEd Institute'].map((provider) => (
            <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>{provider}</span>
              <span className="text-green-600 text-sm">✓ Approved</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
