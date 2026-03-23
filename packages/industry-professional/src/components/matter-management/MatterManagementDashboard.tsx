// @ts-nocheck
'use client';

import React, { useState } from 'react';

export interface MatterManagementDashboardProps {
  businessId: string;
  onViewMatter?: (matterId: string) => void;
  onCreateMatter?: () => void;
}

interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  client: string;
  status: 'open' | 'pending' | 'closed';
  practiceArea: string;
  assignedAttorney: string;
  openDate: Date;
  nextDeadline?: Date;
  billableHours: number;
  outstandingBalance: number;
}

export function MatterManagementDashboard({
  businessId,
  onViewMatter,
  onCreateMatter,
}: MatterManagementDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const matters: Matter[] = [
    {
      id: '1',
      matterNumber: '2024-001',
      title: 'Smith v. Johnson Corp',
      client: 'John Smith',
      status: 'open',
      practiceArea: 'Litigation',
      assignedAttorney: 'Sarah Johnson',
      openDate: new Date('2024-01-15'),
      nextDeadline: new Date('2024-02-15'),
      billableHours: 45.5,
      outstandingBalance: 12500,
    },
    {
      id: '2',
      matterNumber: '2024-002',
      title: 'TechStart Incorporation',
      client: 'TechStart Inc',
      status: 'pending',
      practiceArea: 'Corporate',
      assignedAttorney: 'Michael Chen',
      openDate: new Date('2024-01-20'),
      nextDeadline: new Date('2024-02-01'),
      billableHours: 28.0,
      outstandingBalance: 8400,
    },
    {
      id: '3',
      matterNumber: '2023-089',
      title: 'Estate Planning - Williams',
      client: 'Robert Williams',
      status: 'closed',
      practiceArea: 'Estate Planning',
      assignedAttorney: 'Emily Davis',
      openDate: new Date('2023-11-01'),
      billableHours: 18.5,
      outstandingBalance: 0,
    },
  ];

  const filteredMatters = matters.filter((matter) => {
    if (filter !== 'all' && matter.status !== filter) return false;
    if (
      searchQuery &&
      !matter.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !matter.client.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !matter.matterNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="matter-management-dashboard max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Matter Management</h2>
            <p className="text-gray-600 mt-1">Track and manage all legal matters</p>
          </div>
          <button
            onClick={onCreateMatter}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            + New Matter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Matters</p>
          <p className="text-2xl font-bold text-gray-900">{matters.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Open Matters</p>
          <p className="text-2xl font-bold text-green-600">
            {matters.filter((m) => m.status === 'open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Pending Matters</p>
          <p className="text-2xl font-bold text-yellow-600">
            {matters.filter((m) => m.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
          <p className="text-2xl font-bold text-blue-600">
            ${matters.reduce((sum, m) => sum + m.outstandingBalance, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matters..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Matters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matter #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title / Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Practice Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attorney
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billable Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMatters.map((matter) => (
              <tr
                key={matter.id}
                onClick={() => onViewMatter?.(matter.id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {matter.matterNumber}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{matter.title}</p>
                    <p className="text-sm text-gray-500">{matter.client}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      matter.status
                    )}`}
                  >
                    {matter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {matter.practiceArea}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {matter.assignedAttorney}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {matter.billableHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${matter.outstandingBalance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
