'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantDashboardService, type Order } from '../../services';
import { Card, CardContent, CardHeader, CardTitle } from '@vayva/ui';
import { ScrollArea } from '@vayva/ui';
import { Badge } from '@vayva/ui';
import { 
  Clock, 
  Utensils, 
  User, 
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface LiveOrderFeedProps {
  dashboardService: RestaurantDashboardService;
}

export function LiveOrderFeed({ dashboardService }: LiveOrderFeedProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const liveOrders = await dashboardService.getLiveOrders();
        setOrders(liveOrders);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [dashboardService]);

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Timer className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'served':
        return <Utensils className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Utensils className="h-5 w-5" />
            Live Order Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-orange-50 rounded-lg animate-pulse"></div>
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
          <Utensils className="h-5 w-5" />
          Live Order Feed
          <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
            {orders.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <Utensils className="h-12 w-12 mb-4 text-gray-300" />
              <p className="font-medium">No active orders</p>
              <p className="text-sm">Orders will appear here when received</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  {/* Order Number */}
                  <div className="flex-shrink-0">
                    <div className="bg-orange-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg">
                      #{order.orderNumber?.slice(-3) || '000'}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-orange-900 truncate">
                        {order.customerName || 'Walk-in Customer'}
                      </h3>
                      <Badge className={getOrderStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getOrderStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-orange-600 mb-2 line-clamp-2">
                      {order.items?.slice(0, 2).map((item: any) => item.name).join(', ')}
                      {order.items && order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-orange-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Table {order.tableNumber || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(new Date(order.createdAt))}
                      </div>
                      {order.totalAmount && (
                        <span className="font-medium text-orange-700">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(order.totalAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors">
                      View
                    </button>
                    {order.status === 'pending' && (
                      <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}