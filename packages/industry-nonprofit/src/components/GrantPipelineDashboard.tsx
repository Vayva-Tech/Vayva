// @ts-nocheck
/**
 * Grant Pipeline Dashboard Component
 * Visualizes grant applications and tracking
 */

import React from 'react';

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  status: 'research' | 'draft' | 'submitted' | 'awarded' | 'rejected';
  deadline: Date;
}

interface GrantPipelineDashboardProps {
  grants?: Grant[];
  onUpdateStatus?: (grantId: string, status: string) => void;
}

export const GrantPipelineDashboard: React.FC<GrantPipelineDashboardProps> = ({
  grants,
  onUpdateStatus,
}) => {
  const displayGrants = grants || [
    { id: '1', name: 'Youth Programs', funder: 'XYZ Foundation', amount: 50000, status: 'submitted', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { id: '2', name: 'Education Initiative', funder: 'ABC Trust', amount: 75000, status: 'draft', deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    { id: '3', name: 'Health Fund', funder: 'State Dept', amount: 100000, status: 'awarded', deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  ];

  const stats = {
    total: displayGrants.length,
    awarded: displayGrants.filter(g => g.status === 'awarded').length,
    pending: displayGrants.filter(['research', 'draft', 'submitted'].includes.bind(['research', 'draft', 'submitted'])).length,
    totalAmount: displayGrants.reduce((sum, g) => sum + g.amount, 0),
    awardedAmount: displayGrants.filter(g => g.status === 'awarded').reduce((sum, g) => sum + g.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'research': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const pipelineStages = ['research', 'draft', 'submitted', 'awarded'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">💰 Grant Pipeline</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Grants</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.awarded}</p>
          <p className="text-sm text-gray-600">Awarded</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">${(stats.totalAmount / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Total Pipeline</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">${(stats.awardedAmount / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Awarded $</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{Math.round((stats.awarded / stats.total) * 100)}%</p>
          <p className="text-sm text-gray-600">Success Rate</p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Application Pipeline</h4>
        <div className="flex gap-2">
          {pipelineStages.map(stage => {
            const count = displayGrants.filter(g => g.status === stage).length;
            const amount = displayGrants.filter(g => g.status === stage).reduce((sum, g) => sum + g.amount, 0);
            
            return (
              <div key={stage} className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 capitalize mb-1">{stage}</p>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-gray-500">${(amount / 1000).toFixed(0)}K</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grant List */}
      <div className="space-y-3">
        {displayGrants.map(grant => (
          <div key={grant.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{grant.name}</h4>
                <p className="text-sm text-gray-500">{grant.funder}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Deadline: {new Date(grant.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${grant.amount.toLocaleString()}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(grant.status)}`}>
                  {grant.status}
                </span>
              </div>
            </div>
            {onUpdateStatus && grant.status !== 'awarded' && grant.status !== 'rejected' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onUpdateStatus(grant.id, 'draft')}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                >
                  Move to Draft
                </button>
                <button
                  onClick={() => onUpdateStatus(grant.id, 'submitted')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Mark Submitted
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
