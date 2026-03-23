// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantDashboardService } from '../../services';
import { Card, CardContent, CardHeader, CardTitle , Badge } from '@vayva/ui';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  Utensils
} from 'lucide-react';

interface MenuItemPerformance {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  popularityRank: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface MenuPerformanceProps {
  dashboardService: RestaurantDashboardService;
}

export function MenuPerformance({ dashboardService }: MenuPerformanceProps) {
  const [menuItems, setMenuItems] = useState<MenuItemPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const fetchMenuPerformance = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockItems: MenuItemPerformance[] = [
          {
            id: '1',
            name: 'Grilled Salmon',
            category: 'Main Course',
            unitsSold: 24,
            revenue: 360,
            popularityRank: 1,
            trend: 'up',
            trendPercentage: 15
          },
          {
            id: '2',
            name: 'Caesar Salad',
            category: 'Appetizers',
            unitsSold: 18,
            revenue: 126,
            popularityRank: 2,
            trend: 'stable',
            trendPercentage: 2
          },
          {
            id: '3',
            name: 'Chocolate Cake',
            category: 'Desserts',
            unitsSold: 15,
            revenue: 90,
            popularityRank: 3,
            trend: 'up',
            trendPercentage: 8
          },
          {
            id: '4',
            name: 'Steak Frites',
            category: 'Main Course',
            unitsSold: 12,
            revenue: 240,
            popularityRank: 4,
            trend: 'down',
            trendPercentage: 12
          },
          {
            id: '5',
            name: 'Mushroom Risotto',
            category: 'Main Course',
            unitsSold: 9,
            revenue: 135,
            popularityRank: 5,
            trend: 'up',
            trendPercentage: 5
          }
        ];
        
        setMenuItems(mockItems);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch menu performance:', error);
        setLoading(false);
      }
    };

    fetchMenuPerformance();
    // Poll for updates every 5 minutes
    const interval = setInterval(fetchMenuPerformance, 300000);
    return () => clearInterval(interval);
  }, [dashboardService, timeRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const sortedItems = [...menuItems].sort((a, b) => a.popularityRank - b.popularityRank);

  const totalRevenue = menuItems.reduce((sum, item) => sum + item.revenue, 0);
  const totalUnits = menuItems.reduce((sum, item) => sum + item.unitsSold, 0);

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <BarChart3 className="h-5 w-5" />
            Menu Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-orange-50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl border border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <BarChart3 className="h-5 w-5" />
          Menu Performance
        </CardTitle>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeRange === 'day'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeRange === 'week'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeRange === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            This Month
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Revenue</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              ${totalRevenue.toFixed(0)}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Items Sold</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {totalUnits}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <div 
              key={item.id}
              className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                #{item.popularityRank}
              </div>
              
              {/* Item Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-orange-900 truncate">
                    {item.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs bg-white/70">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-orange-600">
                  <span>{item.unitsSold} sold</span>
                  <span>${item.revenue.toFixed(0)} revenue</span>
                </div>
              </div>
              
              {/* Performance Indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  {getTrendIcon(item.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                    {item.trendPercentage}%
                  </span>
                </div>
                {item.popularityRank <= 3 && (
                  <div className="flex">
                    {[...Array(Math.min(item.popularityRank, 3))].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Performance Insights */}
        <div className="mt-4 pt-4 border-t border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">Insights</h4>
          <div className="space-y-2 text-sm text-orange-700">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium">Grilled Salmon</span> is trending +15% - consider promoting
              </span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
              <span>
                <span className="font-medium">Steak Frites</span> down 12% - check pricing or ingredients
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}