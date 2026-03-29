/**
 * Fashion Trends Analysis Page
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Trend {
  id: string;
  name: string;
  category: string;
  growthRate: number;
  demandScore: number;
  predictedGrowth: number;
}

export default function FashionTrendsPage() {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await apiJson<{ data: Trend[] }>("/fashion/trends");
      setTrends(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch fashion trends", error);
      setTrends([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/fashion")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Trend Analysis
              </h1>
            </div>
          </div>
          <Button size="sm">Generate Forecast</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fashion Trends & Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trend Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Growth Rate</TableHead>
                  <TableHead>Demand Score</TableHead>
                  <TableHead>Predicted Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trends.map((trend) => (
                  <TableRow key={trend.id}>
                    <TableCell className="font-medium">{trend.name}</TableCell>
                    <TableCell><Badge variant="outline">{trend.category}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="font-semibold">+{trend.growthRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${trend.demandScore}%` }} />
                        </div>
                        <span className="text-sm font-medium">{trend.demandScore}/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-blue-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="font-semibold">+{trend.predictedGrowth}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// No mock data - requires real API integration
// Trend tracking should be manual curation or integrated with social media APIs
