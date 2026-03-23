// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantDashboardService } from '../../services';
import { Card, CardContent, CardHeader, CardTitle , Badge , Button } from '@vayva/ui';
import { 
  CircleOff,
  Circle,
  AlertTriangle,
  Clock,
  ChefHat
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  isAvailable: boolean;
  lastUpdated: Date;
  reason?: string;
}

interface EightySixBoardProps {
  dashboardService: RestaurantDashboardService;
}

export function EightySixBoard({ dashboardService }: EightySixBoardProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockItems: MenuItem[] = [
          {
            id: '1',
            name: 'Grilled Salmon',
            category: 'Main Course',
            isAvailable: true,
            lastUpdated: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            name: 'Caesar Salad',
            category: 'Appetizers',
            isAvailable: false,
            lastUpdated: new Date(),
            reason: 'Out of romaine lettuce'
          },
          {
            id: '3',
            name: 'Chocolate Cake',
            category: 'Desserts',
            isAvailable: true,
            lastUpdated: new Date(Date.now() - 7200000),
          },
          {
            id: '4',
            name: 'Steak Frites',
            category: 'Main Course',
            isAvailable: false,
            lastUpdated: new Date(Date.now() - 300000),
            reason: 'Beef supplier delay'
          },
          {
            id: '5',
            name: 'Mushroom Risotto',
            category: 'Main Course',
            isAvailable: false,
            lastUpdated: new Date(Date.now() - 1800000),
            reason: 'Ran out of arborio rice'
          },
          {
            id: '6',
            name: 'Iced Tea',
            category: 'Beverages',
            isAvailable: true,
            lastUpdated: new Date(Date.now() - 86400000),
          }
        ];
        
        setMenuItems(mockItems);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        setLoading(false);
      }
    };

    fetchMenuItems();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMenuItems, 30000);
    return () => clearInterval(interval);
  }, [dashboardService]);

  const toggleAvailability = async (itemId: string) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, isAvailable: !item.isAvailable, lastUpdated: new Date() }
          : item
      )
    );
    
    // In real implementation, this would call the service
    // await dashboardService.toggleMenuItemAvailability(itemId);
  };

  const filteredItems = menuItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'available') return item.isAvailable;
    if (filter === 'unavailable') return !item.isAvailable;
    return true;
  });

  const unavailableCount = menuItems.filter(item => !item.isAvailable).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <CircleOff className="h-5 w-5" />
            86 Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
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
          <div className="flex items-center gap-2">
            <CircleOff className="h-5 w-5" />
            86 Board
            {unavailableCount > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-700">
                {unavailableCount} items
              </Badge>
            )}
          </div>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
              filter === 'available'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <Circle className="h-3 w-3" />
            Available
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
              filter === 'unavailable'
                ? 'bg-red-500 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <CircleOff className="h-3 w-3" />
            86'd
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <ChefHat className="h-12 w-12 mb-4 text-gray-300" />
            <p className="font-medium">No items match your filter</p>
            <p className="text-sm">Try changing the filter criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all
                  ${item.isAvailable 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${
                      item.isAvailable ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {item.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/70"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  
                  {item.reason && !item.isAvailable && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{item.reason}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {formatTimeAgo(item.lastUpdated)}
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={item.isAvailable ? "destructive" : "default"}
                  onClick={() => toggleAvailability(item.id)}
                  className={`
                    ml-3 transition-colors
                    ${item.isAvailable 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    }
                  `}
                >
                  {item.isAvailable ? (
                    <div className="flex items-center gap-1">
                      <CircleOff className="h-4 w-4" />
                      86 Item
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Circle className="h-4 w-4" />
                      Re-enable
                    </div>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-orange-200">
          <h4 className="font-medium text-orange-800 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => {
                // 86 all items low in stock
                console.log('86 low stock items');
              }}
            >
              86 Low Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => {
                // Re-enable all items
                setMenuItems(prev => prev.map(item => ({ ...item, isAvailable: true })));
              }}
            >
              Re-enable All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}