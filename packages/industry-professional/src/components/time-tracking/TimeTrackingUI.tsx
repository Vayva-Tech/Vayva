'use client';

import React, { useState } from 'react';

export interface TimeTrackingUIProps {
  businessId: string;
  attorneyId?: string;
  onLogTime?: (entry: TimeEntry) => Promise<void>;
}

interface TimeEntry {
  id: string;
  matterId: string;
  matterName: string;
  date: Date;
  hours: number;
  rate: number;
  description: string;
  billable: boolean;
}

export function TimeTrackingUI({ businessId, attorneyId, onLogTime }: TimeTrackingUIProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedMatter, setSelectedMatter] = useState('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setTimerRunning(false);
    const hours = elapsedTime / 3600;
    if (hours > 0 && selectedMatter) {
      onLogTime?.({
        id: `entry-${Date.now()}`,
        matterId: selectedMatter,
        matterName: 'Selected Matter',
        date: new Date(),
        hours,
        rate: 250,
        description,
        billable: true,
      });
    }
    setElapsedTime(0);
    setDescription('');
  };

  return (
    <div className="time-tracking-ui max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Time Tracking</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Timer</h3>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="text-4xl font-mono font-bold text-gray-900">
            {formatTime(elapsedTime)}
          </div>
          
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              timerRunning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          
          {timerRunning && (
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              Stop & Log
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matter</label>
            <select
              value={selectedMatter}
              onChange={(e) => setSelectedMatter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select matter...</option>
              <option value="1">2024-001 - Smith v. Johnson Corp</option>
              <option value="2">2024-002 - TechStart Incorporation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Legal research, document review..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Entries</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase">Matter</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 text-sm">2024-001</td>
              <td className="py-3 text-sm">Document review and analysis</td>
              <td className="py-3 text-sm">2.5h</td>
              <td className="py-3 text-sm">$625.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
