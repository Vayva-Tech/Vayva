// @ts-nocheck
/**
 * Freshness Tracker Widget Component
 * Displays produce freshness status and quality metrics
 */

import React from 'react';

export interface FreshnessRecord {
  id: string;
  productId: string;
  productName?: string;
  batchNumber: string;
  freshnessScore: number;
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  status: 'fresh' | 'aging' | 'near-expiry' | 'expired';
  expirationDate: Date;
}

export interface FreshnessStats {
  total: number;
  fresh: number;
  aging: number;
  nearExpiry: number;
  expired: number;
  averageScore: number;
}

export interface FreshnessTrackerProps {
  records?: FreshnessRecord[];
  stats?: FreshnessStats;
  onRefresh?: () => void;
  compact?: boolean;
}

export const FreshnessTracker: React.FC<FreshnessTrackerProps> = ({
  records = [],
  stats,
  onRefresh,
  compact = false,
}) => {
  // Mock data if not provided
  const displayRecords = records.length > 0 ? records : [
    { id: '1', productId: 'prod-1', productName: 'Organic Apples', batchNumber: 'BATCH-001', freshnessScore: 95, qualityGrade: 'A', status: 'fresh', expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { id: '2', productId: 'prod-2', productName: 'Fresh Lettuce', batchNumber: 'BATCH-002', freshnessScore: 72, qualityGrade: 'B', status: 'aging', expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { id: '3', productId: 'prod-3', productName: 'Strawberries', batchNumber: 'BATCH-003', freshnessScore: 45, qualityGrade: 'C', status: 'near-expiry', expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  ];

  const displayStats = stats || {
    total: displayRecords.length,
    fresh: displayRecords.filter(r => r.status === 'fresh').length,
    aging: displayRecords.filter(r => r.status === 'aging').length,
    nearExpiry: displayRecords.filter(r => r.status === 'near-expiry').length,
    expired: displayRecords.filter(r => r.status === 'expired').length,
    averageScore: Math.round(displayRecords.reduce((sum, r) => sum + r.freshnessScore, 0) / displayRecords.length),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'aging': return 'bg-yellow-100 text-yellow-800';
      case 'near-expiry': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 font-bold';
      case 'B': return 'text-blue-600 font-semibold';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Freshness Overview</h3>
          {onRefresh && (
            <button onClick={onRefresh} className="text-blue-600 hover:text-blue-800">
              ↻ Refresh
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{displayStats.fresh}</p>
            <p className="text-xs text-gray-600">Fresh</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{displayStats.aging}</p>
            <p className="text-xs text-gray-600">Aging</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{displayStats.nearExpiry}</p>
            <p className="text-xs text-gray-600">Expiring</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{displayStats.expired}</p>
            <p className="text-xs text-gray-600">Expired</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Freshness Tracker</h3>
          <p className="text-sm text-gray-500">Monitor produce quality and shelf life</p>
        </div>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{displayStats.fresh}</p>
          <p className="text-sm text-gray-600 mt-1">Fresh Items</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{displayStats.aging}</p>
          <p className="text-sm text-gray-600 mt-1">Aging</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-600">{displayStats.nearExpiry}</p>
          <p className="text-sm text-gray-600 mt-1">Near Expiry</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">{displayStats.expired}</p>
          <p className="text-sm text-gray-600 mt-1">Expired</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{displayStats.averageScore}</p>
          <p className="text-sm text-gray-600 mt-1">Avg Score</p>
        </div>
      </div>

      {/* Product List */}
      <div className="p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{record.productName || record.productId}</p>
                    <p className="text-xs text-gray-500">ID: {record.productId}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{record.batchNumber}</td>
                <td className="px-4 py-3">
                  <span className={`text-lg ${getQualityGradeColor(record.qualityGrade)}`}>
                    {record.qualityGrade}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          record.freshnessScore >= 80 ? 'bg-green-500' :
                          record.freshnessScore >= 60 ? 'bg-yellow-500' :
                          record.freshnessScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${record.freshnessScore}%` }}
                      />
                    </div>
                    <span className={`font-medium ${getScoreColor(record.freshnessScore)}`}>
                      {record.freshnessScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(record.expirationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
