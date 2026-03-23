// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent } from '@vayva/ui';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueAnalyticsProps {
  data: {
    monthlyRevenue: number;
    adr: number;
    revpar: number;
    trendData: Array<{ month: string; revenue: number }>;
  };
}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ data }) => {
  // Mock trend data for visualization
  const trendPoints = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 135000 },
    { month: 'Mar', revenue: 150000 },
    { month: 'Apr', revenue: 140000 },
    { month: 'May', revenue: 180000 }
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        REVENUE ANALYTICS
      </h2>
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="h-64 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center w-full">
              <p className="text-gray-600 mb-4">Monthly Revenue Trend</p>
              {/* Simplified chart visualization */}
              <div className="relative h-32 mx-8">
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-24">
                  {trendPoints.map((point, index) => {
                    const height = (point.revenue / 200000) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-2">{point.month}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                  <span>$200K</span>
                  <span>$150K</span>
                  <span>$100K</span>
                  <span>$50K</span>
                  <span>$0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">${data.adr}</p>
              <p className="text-sm text-blue-600">Avg Daily Rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">${data.revpar}</p>
              <p className="text-sm text-green-600">Revenue per Available Room</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-gray-800 mb-3">Revenue Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Direct Bookings</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">OTA Channels</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Corporate</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Groups</span>
                <span className="text-sm font-medium">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RevenueAnalytics;