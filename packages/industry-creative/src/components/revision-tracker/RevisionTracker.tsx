// @ts-nocheck
'use client';

import React from 'react';

export interface RevisionTrackerProps {
  businessId: string;
  projectId: string;
}

interface Revision {
  id: string;
  version: string;
  date: Date;
  author: string;
  changes: string[];
  status: 'current' | 'previous' | 'draft';
  feedback?: string;
}

export function RevisionTracker({ businessId, projectId }: RevisionTrackerProps) {
  const revisions: Revision[] = [
    {
      id: '1',
      version: 'v3.0',
      date: new Date('2024-01-15'),
      author: 'Designer A',
      changes: ['Updated color scheme', 'Revised typography', 'Fixed spacing issues'],
      status: 'current',
    },
    {
      id: '2',
      version: 'v2.0',
      date: new Date('2024-01-10'),
      author: 'Designer A',
      changes: ['Initial redesign', 'Added new sections'],
      status: 'previous',
      feedback: 'Good progress, but needs color adjustments',
    },
  ];

  return (
    <div className="revision-tracker max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Revision History</h2>

      <div className="space-y-4">
        {revisions.map((revision) => (
          <div
            key={revision.id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              revision.status === 'current' ? 'border-green-500' : 'border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{revision.version}</h3>
                <p className="text-sm text-gray-500">
                  {revision.date.toLocaleDateString()} • {revision.author}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  revision.status === 'current'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {revision.status}
              </span>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Changes:</h4>
              <ul className="list-disc list-inside space-y-1">
                {revision.changes.map((change, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {revision.feedback && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Feedback:</strong> {revision.feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
