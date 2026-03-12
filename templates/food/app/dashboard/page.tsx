"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store,
  Utensils,
  ShoppingCart,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Edit,
  Eye,
  Plus,
  RefreshCcw
} from "lucide-react";
import {
  restaurantDashboardService,
  kdsService,
  type KPIMetric,
  type Ticket,
  type Order
} from "@vayva/industry-restaurant";
import { KPIRow, LiveOrderFeed, KDSTicketBoard } from "@/components/kds";
import { useWebSocket } from "@/hooks/useWebSocket";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  phone: string;
  address: string;
  city: string;
  state: string;
  logo?: string;
  coverImage?: string;
  isOpen: boolean;
  menuItemCount: number;
  averageRating: number;
  totalReviews: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface Stats {
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
  pendingOrders: number;
}

export default function RestaurantDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    revenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0
  });
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // WebSocket connection for real-time updates
  const { connected: wsConnected, sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
    onOpen: () => {
      console.log('[Dashboard] WebSocket connected');
      setRealtimeConnected(true);
      // Subscribe to kitchen updates
      sendMessage({ type: 'subscribe', channel: 'kitchen' });
    },
    onClose: () => {
      console.log('[Dashboard] WebSocket disconnected');
      setRealtimeConnected(false);
    },
    onError: (error) => {
      console.error('[Dashboard] WebSocket error:', error);
      setRealtimeConnected(false);
    },
    onMessage: (data) => {
      console.log('[Dashboard] Received message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'ticket_update':
          // Update tickets when new orders come in
          setTickets(kdsService.getTickets({ status: 'cooking' }));
          break;
        case 'order_created':
          // Refresh KPIs when new order is created
          const kpiMetrics = restaurantDashboardService.getKPIMetrics();
          setKpis(kpiMetrics);
          break;
        case 'ticket_started':
        case 'ticket_completed':
        case 'ticket_bumped':
          // Update ticket display
          setTickets(kdsService.getTickets({ status: 'cooking' }));
          break;
      }
    },
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  // Initialize KDS service and load data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Get KPI metrics from restaurant dashboard service
        const kpiMetrics = restaurantDashboardService.getKPIMetrics();
        setKpis(kpiMetrics);
        
        // Get live tickets from KDS service
        const activeTickets = kdsService.getTickets({ status: 'cooking' });
        setTickets(activeTickets);
        
        // Fetch restaurant data (in real app, would be filtered by owner)
        const restaurantsResponse = await fetch('/api/restaurants');
        const restaurantsData = await restaurantsResponse.json();
        
        // Fetch orders for restaurants (would be filtered by restaurant IDs)
        const ordersResponse = await fetch('/api/orders');
        const ordersData = await ordersResponse.json();
        
        if (restaurantsData.restaurants) {
          setRestaurants(restaurantsData.restaurants.slice(0, 3)); // Show first 3 for demo
        }
        
        if (ordersData.orders) {
          setOrders(ordersData.orders.slice(0, 5)); // Show recent 5 orders
          
          // Calculate stats
          const totalRevenue = ordersData.orders.reduce((sum: number, order: any) => sum + order.total, 0);
          const avgOrderValue = ordersData.orders.length > 0 ? totalRevenue / ordersData.orders.length : 0;
          const pendingOrders = ordersData.orders.filter((order: any) => order.status === 'PENDING').length;
          
          setStats({
            totalOrders: ordersData.orders.length,
            revenue: totalRevenue,
            avgOrderValue,
            pendingOrders
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Handle ticket actions
  const handleStartTicket = (ticketId: string) => {
    kdsService.startTicket(ticketId);
    setTickets(kdsService.getTickets({ status: 'cooking' }));
    
    // Broadcast update via WebSocket
    sendMessage({
      type: 'ticket_started',
      ticketId,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCompleteTicket = (ticketId: string) => {
    kdsService.completeTicket(ticketId);
    setTickets(kdsService.getTickets({ status: 'cooking' }));
    
    // Broadcast update via WebSocket
    sendMessage({
      type: 'ticket_completed',
      ticketId,
      timestamp: new Date().toISOString(),
    });
  };

  const handleBumpTicket = (ticketId: string, minutes: number) => {
    kdsService.bumpTicket(ticketId, minutes * 60);
    setTickets(kdsService.getTickets({ status: 'cooking' }));
    
    // Broadcast update via WebSocket
    sendMessage({
      type: 'ticket_bumped',
      ticketId,
      bumpedMinutes: minutes,
      timestamp: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-orange-600">Restaurant Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your food business</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/restaurants/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">View Storefront</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Real-time Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {wsConnected ? 'Real-time Connected (WebSocket)' : 'Connecting...'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const kpiMetrics = restaurantDashboardService.getKPIMetrics();
              setKpis(kpiMetrics);
              setTickets(kdsService.getTickets({ status: 'cooking' }));
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* KPI Metrics Row */}
        {kpis.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Live Performance Metrics</h2>
            <KPIRow metrics={kpis} />
          </div>
        )}

        {/* KDS Ticket Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Kitchen Display System</h2>
            <Badge variant="destructive" className="animate-pulse">
              LIVE - {tickets.length} Active Tickets
            </Badge>
          </div>
          {tickets.length > 0 ? (
            <KDSTicketBoard
              tickets={tickets}
              onStartTicket={handleStartTicket}
              onCompleteTicket={handleCompleteTicket}
              onBumpTicket={handleBumpTicket}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active tickets in kitchen</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Order Feed */}
        <div className="mb-8">
          <LiveOrderFeed tickets={tickets} />
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{(stats.revenue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{(stats.avgOrderValue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Restaurants */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Your Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {restaurant.logo ? (
                          <img 
                            src={restaurant.logo} 
                            alt={restaurant.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-semibold">
                            {restaurant.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{restaurant.city}, {restaurant.state}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{restaurant.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                          {restaurant.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {restaurants.length === 0 && (
                    <div className="text-center py-8">
                      <Store className="h-12 w-12 mx-auto text-orange-300 mb-3" />
                      <p className="text-muted-foreground mb-4">No restaurants yet</p>
                      <Button asChild>
                        <Link href="/restaurants/new">Add Your First Restaurant</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{(order.total / 100).toFixed(2)}</p>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-orange-300 mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/menu/manage">
                  <Utensils className="h-6 w-6" />
                  <span>Manage Menu</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/orders/manage">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Order Management</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/analytics">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Analytics</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                <Link href="/settings">
                  <Edit className="h-6 w-6" />
                  <span>Restaurant Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}