/**
 * Expiration Tracking Component - Grocery Industry
 * Track products approaching expiration and recommend actions to reduce waste
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Progress } from '@vayva/ui/components/ui/progress';

export interface ExpiringProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  action: 'markdown' | 'donate' | 'discard';
  department: string;
  costPerUnit?: number;
  retailPrice?: number;
  totalValue?: number;
  location?: string;
}

export interface ExpirationTrackingProps {
  expiring: ExpiringProduct[];
  savings: number;
}

export function ExpirationTracking({ expiring, savings }: Props) {
  const [markedForAction, setMarkedForAction] = useState<string[]>([]);

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'bg-red-100 text-red-700 border-red-200';
    if (days <= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (days <= 7) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getUrgencyLabel = (days: number) => {
    if (days === 0) return 'Expires Today';
    if (days === 1) return '1 Day Left';
    if (days <= 3) return `${days} Days Left`;
    if (days <= 7) return `${days} Days Left`;
    return `${days} Days Left`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'markdown': return '🏷️';
      case 'donate': return '❤️';
      case 'discard': return '🗑️';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'markdown': return 'bg-purple-100 text-purple-700';
      case 'donate': return 'bg-green-100 text-green-700';
      case 'discard': return 'bg-red-100 text-red-700';
    }
  };

  const handleTakeAction = (productId: string) => {
    setMarkedForAction(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculatePotentialRecovery = (product: ExpiringProduct) => {
    if (product.action === 'markdown' && product.retailPrice && product.costPerUnit) {
      const markdownPrice = product.retailPrice * 0.7;
      return (markdownPrice - product.costPerUnit) * product.quantity;
    }
    if (product.action === 'donate' && product.costPerUnit) {
      return product.costPerUnit * product.quantity * 0.21;
    }
    if (product.action === 'discard' && product.costPerUnit) {
      return -(product.costPerUnit * product.quantity);
    }
    return 0;
  };

  const criticalItems = expiring.filter(p => p.daysUntilExpiry <= 3);
  const warningItems = expiring.filter(p => p.daysUntilExpiry > 3 && p.daysUntilExpiry <= 7);
  const totalPotentialLoss = expiring.reduce((sum, p) => sum + Math.abs(calculatePotentialRecovery(p)), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>⏰</span>
          Expiration Tracking
        </h3>
        <Badge variant={criticalItems.length > 0 ? 'destructive' : 'secondary'}>
          {criticalItems.length} Critical
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Critical</p>
          <p className="text-lg font-bold text-red-600">{criticalItems.length}</p>
          <p className="text-xs text-red-600">≤3 days</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Warning</p>
          <p className="text-lg font-bold text-orange-600">{warningItems.length}</p>
          <p className="text-xs text-orange-600">4-7 days</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">At Risk</p>
          <p className="text-lg font-bold text-gray-900">${Math.abs(totalPotentialLoss).toLocaleString()}</p>
          <p className="text-xs text-gray-600">Value</p>
        </div>
      </div>

      {/* Expiring Products List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {expiring.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20 text-green-600" />
            <p>All products are fresh</p>
            <p className="text-xs mt-1">No items expiring in next 7 days</p>
          </div>
        ) : (
          expiring.map((product) => {
            const urgencyPercent = Math.max(0, ((7 - product.daysUntilExpiry) / 7) * 100);
            const potentialRecovery = calculatePotentialRecovery(product);

            return (
              <div 
                key={product.id} 
                className={`p-3 rounded-lg border-2 transition-all ${
                  markedForAction.includes(product.productId)
                    ? 'bg-green-50 border-green-300'
                    : product.daysUntilExpiry <= 3
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.productName}</p>
                    <p className="text-xs text-gray-600">
                      {product.department} {product.location && `• ${product.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getUrgencyColor(product.daysUntilExpiry)} border`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {getUrgencyLabel(product.daysUntilExpiry)}
                    </Badge>
                    <Badge className={`${getActionColor(product.action)}`}>
                      <span className="mr-1">{getActionIcon(product.action)}</span>
                      {product.action}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Quantity</p>
                      <p className="text-sm font-bold text-gray-900">{product.quantity}</p>
                    </div>
                    {product.totalValue && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Value</p>
                        <p className="text-sm font-bold text-gray-900">${product.totalValue.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Recovery</p>
                      <p className={`text-sm font-bold ${potentialRecovery >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${potentialRecovery >= 0 ? '+' : ''}${potentialRecovery.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant={markedForAction.includes(product.productId) ? 'default' : 'outline'}
                    onClick={() => handleTakeAction(product.productId)}
                    disabled={markedForAction.includes(product.productId)}
                    className="h-8 text-xs"
                  >
                    {markedForAction.includes(product.productId) ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marked
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Take Action
                      </>
                    )}
                  </Button>
                </div>

                {/* Urgency Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Expiration Progress</span>
                    <span>{urgencyPercent.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={urgencyPercent} 
                    className={`h-2 ${
                      product.daysUntilExpiry <= 1 ? '[&>div]:bg-red-600' :
                      product.daysUntilExpiry <= 3 ? '[&>div]:bg-orange-600' :
                      '[&>div]:bg-yellow-600'
                    }`} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Waste Reduction Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Waste Reduction Savings</p>
              <p className="text-xs text-gray-600">Total recovered this month</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">${savings.toLocaleString()}</p>
            <p className="text-xs text-green-600">Prevented loss</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {markedForAction.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-900 mb-2">
            ✓ {markedForAction.length} item(s) marked for action
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Apply Markdowns
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Schedule Pickup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
