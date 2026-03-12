'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vayva/ui';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface OccupancyOverviewProps {
  data: {
    todayCheckIns: number;
    tonightOccupancy: number;
    availableUnits: number;
    avgDailyRate: number;
    adrTrend: string;
    occupancyTrend: string;
  };
}

const OccupancyOverview: React.FC<OccupancyOverviewProps> = ({ data }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        ACTIVE BOOKINGS OVERVIEW
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data.todayCheckIns}</div>
            <p className="text-sm text-green-600 mt-1">▲ 18% vs last week</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tonight's Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data.tonightOccupancy}%</div>
            <p className="text-sm text-green-600 mt-1">▲ {data.availableUnits} units available</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Daily Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${data.avgDailyRate}/night</div>
            <p className="text-sm text-green-600 mt-1">{data.adrTrend} vs last month</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default OccupancyOverview;