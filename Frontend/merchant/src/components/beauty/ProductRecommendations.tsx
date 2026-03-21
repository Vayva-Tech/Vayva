"use client";

import { Card, Button } from "@vayva/ui";

interface ProductRecommendationsProps {
  products?: any[];
  lowStockCount?: number;
  isLoading?: boolean;
}

export function ProductRecommendations({
  products = [],
  lowStockCount = 0,
  isLoading = false,
}: ProductRecommendationsProps) {
  const sampleProducts = [
    { name: "Olaplex No.3", units: 8, revenue: 240 },
    { name: "Pureology Shampoo", units: 6, revenue: 192 },
    { name: "Redken Mask", units: 5, revenue: 175 },
  ];

  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Product Recommendations</h3>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
          View Inventory
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sampleProducts.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{product.name}</p>
                <p className="text-gray-500 text-xs">{product.units} units</p>
              </div>
              <span className="text-red-400 font-medium">${product.revenue}</span>
            </div>
          ))}
          
          {lowStockCount > 0 && (
            <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-amber-500/20">
              <p className="text-amber-300 text-sm">⚠️ {lowStockCount} products low on stock</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
