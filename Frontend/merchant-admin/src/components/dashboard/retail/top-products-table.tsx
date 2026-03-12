'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopProduct {
  id: string;
  name: string;
  sku?: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface TopProductsTableProps {
  products: TopProduct[];
  className?: string;
}

export function TopProductsTable({ products, className }: TopProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-amber-100 text-amber-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
        <Button variant="ghost" size="sm">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{product.name}</div>
                  {product.sku && (
                    <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(product.revenue)}</div>
                  <div className="text-xs text-muted-foreground">{product.unitsSold.toLocaleString()} units</div>
                </div>
                
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-sm font-medium">{(product.growth * 100).toFixed(1)}%</span>
                </div>
                
                <Badge className={getStockStatusColor(product.stockStatus)}>
                  {getStockStatusLabel(product.stockStatus)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
