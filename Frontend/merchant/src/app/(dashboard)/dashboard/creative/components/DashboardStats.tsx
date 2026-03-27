/**
 * Dashboard Stats Component
 */

import React from 'react';

interface DashboardStatsProps {
  stats: {
    activeProjects: number;
    pendingReviews: number;
    totalAssets: number;
    monthlyRevenue: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Active Projects" 
        value={stats.activeProjects.toString()}
        trend="+12%"
        positive={true}
        icon="📁"
      />
      <StatCard 
        label="Pending Reviews" 
        value={stats.pendingReviews.toString()}
        trend="-5%"
        positive={false}
        icon="⏳"
      />
      <StatCard 
        label="Total Assets" 
        value={stats.totalAssets.toLocaleString()}
        trend="+24%"
        positive={true}
        icon="🎨"
      />
      <StatCard 
        label="Monthly Revenue" 
        value={`$${stats.monthlyRevenue.toLocaleString()}`}
        trend="+18%"
        positive={true}
        icon="💰"
      />
    </div>
  );
}

function StatCard({ label, value, trend, positive, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
