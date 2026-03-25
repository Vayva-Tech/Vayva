'use client';
import { Button } from "@vayva/ui";

import React, { useState, useEffect } from 'react';

export interface HIPAAComplianceTrackerProps {
  businessId: string;
  onViewAuditLogs?: () => void;
  onRunComplianceCheck?: () => Promise<void>;
}

interface ComplianceMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  resource: string;
  ipAddress: string;
  status: 'success' | 'failure';
}

export function HIPAAComplianceTracker({ 
  businessId,
  onViewAuditLogs,
  onRunComplianceCheck
}: HIPAAComplianceTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [complianceScore, setComplianceScore] = useState<number>(0);

  const metrics: ComplianceMetric[] = [
    {
      id: 'access-logs',
      label: 'Access Logs Reviewed',
      value: 94,
      target: 100,
      unit: '%',
      status: 'warning',
    },
    {
      id: 'phi-encryption',
      label: 'PHI Encryption',
      value: 100,
      target: 100,
      unit: '%',
      status: 'good',
    },
    {
      id: 'baa-executed',
      label: 'BAAs Executed',
      value: 28,
      target: 30,
      unit: 'of 30',
      status: 'warning',
    },
    {
      id: 'training-complete',
      label: 'Staff Training Complete',
      value: 85,
      target: 100,
      unit: '%',
      status: 'critical',
    },
  ];

  const recentActivity: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-15T10:30:00'),
      action: 'Record Access',
      user: 'Dr. Smith',
      resource: 'Patient #12345',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15T09:15:00'),
      action: 'Export PHI',
      user: 'Nurse Johnson',
      resource: 'Patient #12346',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15T08:45:00'),
      action: 'Login Attempt',
      user: 'Unknown',
      resource: 'System',
      ipAddress: '203.0.113.42',
      status: 'failure',
    },
  ];

  const handleRunCheck = async () => {
    setLoading(true);
    try {
      await onRunComplianceCheck?.();
      setLastCheck(new Date());
      setComplianceScore(92);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="hipaa-compliance-tracker max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">HIPAA Compliance Tracker</h2>
            <p className="text-gray-600 mt-1">Monitor compliance metrics and audit trails</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onViewAuditLogs}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View All Logs
            </Button>
            <Button
              onClick={handleRunCheck}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Compliance Check'}
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Overall Compliance Score</p>
            <p className="text-4xl font-bold">{complianceScore > 0 ? complianceScore : '--'}%</p>
            {lastCheck && (
              <p className="text-blue-100 text-xs mt-2">
                Last checked: {lastCheck.toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-6xl opacity-20">🏥</div>
          </div>
        </div>
      </div>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">{metric.label}</h3>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(metric.status)}`}>
                {metric.status === 'good' ? '✓' : metric.status === 'warning' ? '⚠' : '✗'}
              </span>
            </div>
            
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {metric.value}{metric.unit.includes('%') ? '%' : ''}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                / {metric.target}{metric.unit.includes('%') ? '%' : ''}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressBarColor(metric.status)}`}
                style={{ width: `${(metric.value / metric.target) * 100}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Target: {metric.target}{metric.unit.includes('%') ? '%' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Audit Activity</h3>
          <Button
            onClick={onViewAuditLogs}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {entry.timestamp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {entry.action}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {entry.user}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {entry.resource}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {entry.ipAddress}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Recommendations */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Action Items</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span className="text-yellow-800 text-sm">
              Complete staff HIPAA training for 15% of employees who are overdue
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span className="text-yellow-800 text-sm">
              Execute Business Associate Agreements with 2 remaining vendors
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span className="text-yellow-800 text-sm">
              Review access logs for the past week (6% pending review)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

