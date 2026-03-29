/**
 * Real Estate Showings Page - Showing & Open House Scheduling
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar, Plus } from "lucide-react";

interface Showing {
  id: string;
  propertyAddress: string;
  clientName: string;
  dateTime: string;
  status: "scheduled" | "completed" | "cancelled";
  feedback?: string;
}

export default function RealEstateShowingsPage() {
  const router = useRouter();
  const [showings, setShowings] = useState<Showing[]>([]);

  useEffect(() => {
    fetchShowings();
  }, []);

  const fetchShowings = async () => {
    try {
      const response = await apiJson<{ data: Showing[] }>("/realestate/showings?limit=200");
      setShowings(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch showings", error);
      setShowings([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/realestate")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Showing Scheduler
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Showing
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Showings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Showings Scheduled</h3>
                <p className="text-muted-foreground mb-4">Schedule property showings and open houses for clients</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Showing
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showings.map((showing) => (
                    <TableRow key={showing.id}>
                      <TableCell className="font-medium">{showing.propertyAddress}</TableCell>
                      <TableCell>{showing.clientName}</TableCell>
                      <TableCell>{formatDate(showing.dateTime)}</TableCell>
                      <TableCell><Badge variant={showing.status === "scheduled" ? "default" : "secondary"}>{showing.status}</Badge></TableCell>
                      <TableCell>{showing.feedback || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// No mock data - requires real estate API integration
