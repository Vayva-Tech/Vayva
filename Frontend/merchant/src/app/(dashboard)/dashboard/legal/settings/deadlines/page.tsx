'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

export default function DeadlineRulesSettingsPage() {
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeCourtHolidays, setExcludeCourtHolidays] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Deadline Rules</h1>
          <p className="text-gray-700 mt-1">Court rules and holiday calendars</p>
        </div>
        <Button>Save Settings</Button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Business Day Calculation
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Exclude Weekends</Label>
              <p className="text-sm text-gray-700">Skip Saturday and Sunday in deadline calculations</p>
            </div>
            <Switch
              checked={excludeWeekends}
              onCheckedChange={setExcludeWeekends}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Exclude Court Holidays</Label>
              <p className="text-sm text-gray-700">Skip federal and state court holidays</p>
            </div>
            <Switch
              checked={excludeCourtHolidays}
              onCheckedChange={setExcludeCourtHolidays}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Default Deadlines by Case Type
        </h3>
        <div className="space-y-3">
          {[
            { type: 'Criminal - Discovery', days: 30 },
            { type: 'Civil - Answer Due', days: 21 },
            { type: 'Family - Response', days: 30 },
            { type: 'Personal Injury - Statute of Limitations', days: 730 },
          ].map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{rule.type}</span>
              <span className="text-sm text-gray-700">{rule.days} days</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
