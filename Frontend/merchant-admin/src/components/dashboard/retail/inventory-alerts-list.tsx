'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Package } from 'lucide-react';

interface InventoryAlert {
  productId: string;
  productName: string;
  sku?: string;
  currentStock: number;
  reorderPoint: number;
  status: 'critical' | 'warning' | 'info';
}

interface InventoryAlertsListProps {
  alerts: InventoryAlert[];
  className?: string;
}

export function InventoryAlertsList({ alerts, className }: InventoryAlertsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <Package className="w-4 h-4 text-amber-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Inventory Alerts</CardTitle>
        <Button variant="ghost" size="sm">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No inventory alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.productId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(alert.status)}
                  <div>
                    <div className="font-medium">{alert.productName}</div>
                    {alert.sku && (
                      <div className="text-xs text-muted-foreground">SKU: {alert.sku}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(alert.status)}>
                    {alert.currentStock} left
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reorder at: {alert.reorderPoint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
