"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryForecast } from "@/types/intelligence";
import { AlertTriangle, Package, Calendar, TrendingUp } from "lucide-react";

interface InventoryForecastTableProps {
  data: InventoryForecast[];
}

export function InventoryForecastTable({ data }: InventoryForecastTableProps) {
  // Sort by stockout risk (highest first)
  const sortedData = [...data].sort((a, b) => b.stockoutRisk - a.stockoutRisk);

  const getRiskBadge = (risk: number) => {
    if (risk >= 0.7) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          High Risk ({Math.round(risk * 100)}%)
        </Badge>
      );
    }
    if (risk >= 0.4) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Medium Risk ({Math.round(risk * 100)}%)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
        Low Risk ({Math.round(risk * 100)}%)
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <span className="text-emerald-600 font-medium">High</span>;
    }
    if (confidence >= 0.5) {
      return <span className="text-amber-600 font-medium">Medium</span>;
    }
    return <span className="text-rose-600 font-medium">Low</span>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Predicted Demand</TableHead>
              <TableHead>Stockout Risk</TableHead>
              <TableHead>Suggested Reorder</TableHead>
              <TableHead>Reorder Date</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No inventory forecasts available
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item: InventoryForecast) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.productId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{item.predictedDemand} units</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(item.stockoutRisk)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{item.suggestedReorder} units</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(item.optimalReorderDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getConfidenceBadge(item.confidence)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to product page or open reorder modal
                        window.location.href = `/products/${item.productId}`;
                      }}
                    >
                      View Product
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Products</div>
          <div className="text-2xl font-bold">{data.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">High Risk</div>
          <div className="text-2xl font-bold text-rose-600">
            {data.filter((i) => i.stockoutRisk >= 0.7).length}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Need Reorder</div>
          <div className="text-2xl font-bold text-amber-600">
            {data.filter((i) => i.stockoutRisk >= 0.5).length}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Avg Confidence</div>
          <div className="text-2xl font-bold">
            {data.length > 0
              ? `${Math.round(
                  (data.reduce((sum: number, i) => sum + i.confidence, 0) / data.length) * 100
                )}%`
              : "0%"}
          </div>
        </div>
      </div>
    </div>
  );
}
