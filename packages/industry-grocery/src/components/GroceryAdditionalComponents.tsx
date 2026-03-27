/**
 * Grocery Industry - Additional Dashboard Components
 * Consolidated implementations for supplier deliveries, stock levels, and action management
 */

import React, { useState } from 'react';
import { Truck, Clock, AlertTriangle, CheckCircle, Package, MapPin, DollarSign, Calendar, TrendingDown, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Progress } from '@vayva/ui/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vayva/ui/components/ui/dropdown-menu';

// ============================================================================
// Supplier Deliveries Component
// ============================================================================

export interface SupplierDelivery {
  id: string;
  supplierId: string;
  supplierName: string;
  expectedTime: string;
  poNumber: string;
  dockDoor: string;
  status: 'on-time' | 'delayed' | 'early' | 'arrived' | 'checked-in';
  items: number;
  value: number;
  driverName?: string;
  contactPhone?: string;
  notes?: string;
  actualArrival?: string;
}

export interface SupplierDeliveriesProps {
  deliveries: SupplierDelivery[];
}

export function SupplierDeliveries({ deliveries }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'arrived': return <CheckCircle className="h-4 w-4" />;
      case 'checked-in': return <Truck className="h-4 w-4" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4" />;
      case 'early': return <Clock className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived': return 'bg-green-100 text-green-700 border-green-200';
      case 'checked-in': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'early': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'on-time': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTimeUntilDelivery = (expectedTime: string) => {
    const now = new Date();
    const expected = new Date(expectedTime);
    const diffMins = Math.round((expected.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMins < 0) return { text: `${Math.abs(diffMins)}m late`, late: true };
    if (diffMins === 0) return { text: 'Due now', late: false };
    if (diffMins < 60) return { text: `in ${diffMins}m`, late: false };
    return { text: `in ${Math.round(diffMins / 60)}h ${diffMins % 60}m`, late: false };
  };

  const getDockDoorColor = (dockDoor: string) => {
    const colors = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
    const index = dockDoor.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const delayedCount = deliveries.filter(d => d.status === 'delayed').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>🚚</span>
          Supplier Deliveries
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">{activeDeliveries.length} Active</Badge>
          {delayedCount > 0 && <Badge variant="destructive" className="text-xs">{delayedCount} Delayed</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Today</p>
          <p className="text-lg font-bold text-gray-900">{deliveries.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">On Time</p>
          <p className="text-lg font-bold text-green-600">{deliveries.filter(d => d.status === 'on-time' || d.status === 'arrived').length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total Value</p>
          <p className="text-lg font-bold text-gray-900">${(deliveries.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(1)}K</p>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {deliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No scheduled deliveries</p>
            <p className="text-xs mt-1">All deliveries completed for today</p>
          </div>
        ) : (
          deliveries.map((delivery) => {
            const timeInfo = getTimeUntilDelivery(delivery.expectedTime);
            return (
              <div key={delivery.id} className={`p-4 rounded-lg border-2 transition-all ${
                delivery.status === 'delayed' ? 'bg-red-50 border-red-200' :
                delivery.status === 'arrived' ? 'bg-green-50 border-green-200' :
                'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${delivery.status === 'arrived' ? 'bg-green-200' : delivery.status === 'delayed' ? 'bg-red-200' : 'bg-gray-200'}`}>
                      {getStatusIcon(delivery.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{delivery.supplierName}</p>
                      <p className="text-xs text-gray-600">PO: {delivery.poNumber}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(delivery.status)} border capitalize flex items-center gap-1`}>
                    {getStatusIcon(delivery.status)}
                    <span className="ml-1">{delivery.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Expected</p>
                      <p className="text-sm font-medium text-gray-900">{delivery.expectedTime.split(' ')[1] || delivery.expectedTime}</p>
                      <p className={`text-xs ${timeInfo.late ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{timeInfo.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Dock Door</p>
                      <Badge className={`${getDockDoorColor(delivery.dockDoor)} text-xs`}>{delivery.dockDoor}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Items</p>
                      <p className="text-sm font-bold text-gray-900">{delivery.items}</p>
                    </div>
                  </div>
                </div>

                {(delivery.driverName || delivery.contactPhone || delivery.notes) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {delivery.driverName && <p className="text-xs text-gray-600">Driver: <span className="font-medium">{delivery.driverName}</span></p>}
                    {delivery.contactPhone && <p className="text-xs text-gray-600">Contact: <span className="font-medium">{delivery.contactPhone}</span></p>}
                    {delivery.notes && <p className="text-xs text-gray-600 italic">📝 {delivery.notes}</p>}
                  </div>
                )}

                {delivery.status === 'checked-in' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1">Check In</Button>
                    <Button size="sm" variant="outline" className="flex-1">Assign Dock</Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Stock Levels Component
// ============================================================================

export interface InventoryHealth {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstocked: number;
  turnoverDays: number;
  shrinkageRate: number;
  totalValue: number;
  idealStockLevel?: number;
  stockAccuracy?: number;
  carryingCost?: number;
}

export interface StockLevelsProps {
  inventoryHealth: InventoryHealth;
}

export function StockLevels({ inventoryHealth }: Props) {
  const totalSKUs = inventoryHealth.inStock + inventoryHealth.lowStock + inventoryHealth.outOfStock + inventoryHealth.overstocked;
  const healthyStockPercent = totalSKUs > 0 ? ((inventoryHealth.inStock / totalSKUs) * 100) : 0;
  
  const getStockStatusColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateFinancialImpact = () => {
    const shrinkageLoss = inventoryHealth.totalValue * inventoryHealth.shrinkageRate;
    const carryingCost = inventoryHealth.carryingCost || (inventoryHealth.totalValue * 0.25);
    return { shrinkageLoss, monthlyCarryingCost: (carryingCost / 365) * 30 };
  };

  const financials = calculateFinancialImpact();
  const stockStatus = getStockStatusColor(healthyStockPercent);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📦</span>
          Stock Levels
        </h3>
        <Badge variant={healthyStockPercent >= 80 ? 'default' : 'destructive'} className="flex items-center gap-1">
          {healthyStockPercent.toFixed(0)}% Healthy
        </Badge>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Inventory Health Score</p>
          <p className={`text-2xl font-bold ${stockStatus}`}>{healthyStockPercent.toFixed(0)}/100</p>
        </div>
        <Progress value={healthyStockPercent} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700">In Stock</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{inventoryHealth.inStock.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <p className="text-xs font-semibold text-orange-700">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{inventoryHealth.lowStock.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs font-semibold text-red-700">Out of Stock</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{inventoryHealth.outOfStock.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-700">Overstocked</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{inventoryHealth.overstocked.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Turnover Days</p>
              <p className="text-xs text-gray-600">Average time to sell inventory</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{inventoryHealth.turnoverDays} days</p>
            <p className="text-xs text-gray-600">{(365 / inventoryHealth.turnoverDays).toFixed(1)} turns/year</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Shrinkage Rate</p>
              <p className="text-xs text-red-600">Loss from damage, theft, spoilage</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-600">{(inventoryHealth.shrinkageRate * 100).toFixed(1)}%</p>
            <p className="text-xs text-red-600">${financials.shrinkageLoss.toLocaleString()} loss</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Total Inventory Value</p>
              <p className="text-xs text-blue-600">Capital invested in stock</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900">${inventoryHealth.totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Action Required Component
// ============================================================================

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;
  completed: boolean;
  category: 'price-check' | 'waste-report' | 'purchase-orders' | 'supplier' | 'staff' | 'safety';
  description?: string;
  assignedTo?: string;
  estimatedMinutes?: number;
}

export interface ActionRequiredProps {
  tasks: Task[];
}

export function ActionRequired({ tasks }: Props) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'price-check': return '🏷️';
      case 'waste-report': return '🗑️';
      case 'purchase-orders': return '📋';
      case 'supplier': return '🚚';
      case 'staff': return '👥';
      case 'safety': return '⚠️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setCompletedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const filteredTasks = filterPriority === 'all' ? tasks : tasks.filter(t => t.priority === filterPriority);
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const completionRate = tasks.length > 0 ? ((completedTasks.length + tasks.filter(t => t.completed).length) / tasks.length) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>⚠️</span>
          Action Required
        </h3>
        <div className="flex gap-2">
          <Badge variant={highPriorityCount > 0 ? 'destructive' : 'default'}>{highPriorityCount} High Priority</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2"><Filter className="h-3 w-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>All Tasks ({tasks.length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('high')}>High Priority ({tasks.filter(t => t.priority === 'high').length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('medium')}>Medium ({tasks.filter(t => t.priority === 'medium').length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low ({tasks.filter(t => t.priority === 'low').length})</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Daily Progress</p>
          <p className="text-lg font-bold text-green-600">{completionRate.toFixed(0)}%</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="text-xs text-gray-600 whitespace-nowrap">{completedTasks.length + tasks.filter(t => t.completed).length}/{tasks.length} done</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20 text-green-600" />
            <p>No tasks found</p>
            <p className="text-xs mt-1">All caught up!</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed || completedTasks.includes(task.id);
            const isUrgent = task.priority === 'high' && !isCompleted && task.dueTime;

            return (
              <div 
                key={task.id} 
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  isUrgent ? 'bg-red-50 border-red-200 hover:border-red-300' : 
                  task.priority === 'high' ? 'bg-orange-50 border-orange-200 hover:border-orange-300' : 
                  'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCompleteTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-green-500'}`}>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getCategoryIcon(task.category)}</span>
                          <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</p>
                        </div>
                        {task.description && <p className={`text-xs ml-7 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>}

                        <div className="flex items-center gap-3 ml-7 mt-2">
                          <Badge className={`${getPriorityColor(task.priority)} text-xs flex items-center gap-1`}>
                            <span className="capitalize">{task.priority}</span>
                          </Badge>
                          {task.dueTime && <div className={`flex items-center gap-1 text-xs ${isUrgent ? 'text-red-700 font-semibold' : 'text-gray-600'}`}><Calendar className="h-3 w-3" />{task.dueTime}</div>}
                          {task.assignedTo && <div className="flex items-center gap-1 text-xs text-gray-600"><ChevronRight className="h-3 w-3" />{task.assignedTo}</div>}
                          {task.estimatedMinutes && <div className="flex items-center gap-1 text-xs text-gray-600"><Clock className="h-3 w-3" />~{task.estimatedMinutes}m</div>}
                        </div>
                      </div>

                      {!isCompleted && (
                        <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id); }}>Complete</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-600">High Priority</p>
            <p className="text-lg font-bold text-red-600">{tasks.filter(t => t.priority === 'high' && !t.completed && !completedTasks.includes(t.id)).length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">In Progress</p>
            <p className="text-lg font-bold text-orange-600">{tasks.filter(t => !t.completed && !completedTasks.includes(t.id)).length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Completed</p>
            <p className="text-lg font-bold text-green-600">{completedTasks.length + tasks.filter(t => t.completed).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
