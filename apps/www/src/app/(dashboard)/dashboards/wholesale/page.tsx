'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  _Users, 
  _Truck, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  BarChart3,
  _Warehouse,
  _FileText,
  Bell
} from 'lucide-react';
import { wholesaleService } from '@vayva/industry-wholesale';

interface WholesaleDashboardData {
  businessOverview: {
    ordersToday: number;
    ordersTrend: number;
    revenueMTD: number;
    revenueTrend: number;
    averageOrderValue: number;
    aovTrend: number;
  };
  orderPipeline: {
    pending: number;
    processing: number;
    shipped: number;
    readyForPickup: number;
    totalBacklog: number;
    onTimeShipRate: number;
  };
  salesByCategory: {
    categories: Array<{
      id: string;
      name: string;
      revenue: number;
      percentage: number;
      trend: number;
      color: string;
    }>;
    topBrand: string;
    topBrandGrowth: number;
    decliningCategory: string;
    decliningCategoryDrop: number;
  };
  inventoryHealth: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    overstocked: number;
    inventoryTurnoverDays: number;
    fillRate: number;
    carryingCost: number;
  };
  customerInsights: {
    totalAccounts: number;
    activeAccounts: number;
    newThisMonth: number;
    atRiskAccounts: number;
    topCustomers: Array<{
      id: string;
      name: string;
      revenue: number;
      orderCount: number;
      percentageOfTotal: number;
    }>;
    customerLifetimeValue: number;
    avgOrderFrequency: number;
  };
  purchaseOrders: {
    pendingApproval: number;
    inTransit: number;
    expectedThisWeek: number;
    supplierDelays: number;
    qualityIssues: number;
    supplierOTD: number;
  };
  reorderForecast: {
    autoGenerateCount: number;
    priorityRestocks: Array<{
      id: string;
      sku: string;
      productName: string;
      currentStock: number;
      suggestedQty: number;
      dueDate: string;
      priority: string;
    }>;
    estimatedInvestment: number;
    projectedROI: number;
  };
  accountsReceivable: {
    current: number;
    oneToThirtyDays: number;
    thirtyOneToSixtyDays: number;
    sixtyPlusDays: number;
    dso: number;
    collectionEffectiveness: number;
  };
  warehousePerformance: {
    ordersToPick: number;
    pickingProgress: number;
    packingQueue: number;
    shippedToday: number;
    picksPerHour: number;
    picksPerHourTarget: number;
    accuracyRate: number;
  };
  quotePipeline: {
    pendingQuotes: number;
    quoteValue: number;
    winRate: number;
    closingThisMonth: number;
    topOpportunity: {
      id: string;
      customerName: string;
      value: number;
      probability: number;
    };
  };
  actionRequired: {
    tasks: Array<{
      id: string;
      title: string;
      priority: string;
      dueTime?: string;
      completed: boolean;
      category: string;
    }>;
    lowStockApprovals: number;
    pastDueCustomerCalls: number;
    quoteRequests: number;
  };
  notifications: number;
}

const WholesaleDashboard = () => {
  const [data, setData] = useState<WholesaleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('corporate-blue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await wholesaleService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Error fetching wholesale dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    );
  };

  const getStatusColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VAYVA WHOLESALE</h1>
            <p className="text-gray-600">Distribution & Supply Chain Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Bell className="h-4 w-4 mr-2" />
              {data.notifications} Notifications
            </Badge>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="corporate-blue">Corporate Blue</option>
              <option value="industrial-gray">Industrial Gray</option>
              <option value="growth-green">Growth Green</option>
              <option value="premium-purple">Premium Purple</option>
              <option value="ocean-teal">Ocean Teal</option>
            </select>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-1 mt-6 border-b">
          {['Dashboard', 'Orders', 'Inventory', 'Customers', 'Suppliers', 'Warehouse', 'Finance', 'Settings'].map((item) => (
            <Button
              key={item}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                item === 'Dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {/* Business Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.businessOverview.ordersToday)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.businessOverview.ordersTrend)}
              <span className="ml-1">{(data.businessOverview.ordersTrend * 100).toFixed(0)}% vs last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.businessOverview.revenueMTD)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.businessOverview.revenueTrend)}
              <span className="ml-1">{(data.businessOverview.revenueTrend * 100).toFixed(0)}% vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.businessOverview.averageOrderValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.businessOverview.aovTrend)}
              <span className="ml-1">{(data.businessOverview.aovTrend * 100).toFixed(0)}% vs last Q</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              ORDER PIPELINE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{data.orderPipeline.pending}</div>
                <div className="text-sm text-blue-600">Pending</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{data.orderPipeline.processing}</div>
                <div className="text-sm text-yellow-600">Processing</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{data.orderPipeline.shipped}</div>
                <div className="text-sm text-green-600">Shipped</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{data.orderPipeline.readyForPickup}</div>
                <div className="text-sm text-purple-600">Ready for Pickup</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <div className="text-sm text-gray-500">Backlog</div>
                <div className="font-semibold">{data.orderPipeline.totalBacklog} total orders</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">On-Time Ship Rate</div>
                <div className="font-semibold text-green-600">{data.orderPipeline.onTimeShipRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              SALES BY CATEGORY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.salesByCategory.categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <div className="w-32 text-sm font-medium">{category.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{formatCurrency(category.revenue)}</span>
                      <span>{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-xs ${category.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.trend >= 0 ? '▲' : '▼'} {(Math.abs(category.trend) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between text-sm">
              <div>
                <div className="text-gray-500">Top Brand</div>
                <div className="font-medium">{data.salesByCategory.topBrand} <span className="text-green-600">(+{data.salesByCategory.topBrandGrowth}%)</span></div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Declining</div>
                <div className="font-medium">{data.salesByCategory.decliningCategory} <span className="text-red-600">({data.salesByCategory.decliningCategoryDrop}%)</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            ACTION REQUIRED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{data.actionRequired.lowStockApprovals}</div>
              <div className="text-sm text-red-600">Approve POs</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{data.actionRequired.pastDueCustomerCalls}</div>
              <div className="text-sm text-orange-600">Past Due Calls</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{data.actionRequired.quoteRequests}</div>
              <div className="text-sm text-yellow-600">Quote Requests</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{data.reorderForecast.autoGenerateCount}</div>
              <div className="text-sm text-blue-600">Auto-Generate Orders</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {data.actionRequired.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-3 ${getStatusColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </div>
                    <span className={task.completed ? 'line-through text-gray-500' : 'font-medium'}>
                      {task.title}
                    </span>
                    {task.dueTime && (
                      <span className="text-sm text-gray-500 ml-2">Due: {task.dueTime}</span>
                    )}
                  </div>
                </div>
                {!task.completed && (
                  <Button size="sm" variant="outline">
                    Complete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesaleDashboard;
