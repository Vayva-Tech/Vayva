"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KPIMetric } from "@vayva/industry-restaurant";

interface KPIRowProps {
  metrics: KPIMetric[];
}

export function KPIRow({ metrics }: KPIRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.label}
            </CardTitle>
            {metric.isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof metric.value === 'number' 
                ? metric.label === 'Revenue' || metric.label === 'Avg Ticket' 
                  ? `$${metric.value.toFixed(2)}`
                  : metric.value
                : metric.value}
            </div>
            <div className="flex items-center mt-1">
              {metric.trend === 'up' ? (
                <TrendingUp className={`h-4 w-4 ${metric.isPositive ? 'text-green-500' : 'text-red-500'} mr-1`} />
              ) : metric.trend === 'down' ? (
                <TrendingDown className={`h-4 w-4 ${metric.isPositive ? 'text-green-500' : 'text-red-500'} mr-1`} />
              ) : (
                <Minus className="h-4 w-4 text-gray-500 mr-1" />
              )}
              <p className={`text-xs ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {typeof metric.change === 'number' 
                  ? `${metric.change >= 0 ? '+' : ''}${metric.change.toFixed(1)}%`
                  : metric.change}
              </p>
            </div>
            {metric.tooltip && (
              <p className="text-xs text-muted-foreground mt-2">{metric.tooltip}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
