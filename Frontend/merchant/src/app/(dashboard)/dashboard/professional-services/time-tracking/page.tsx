/**
 * Professional Services Time Tracking Page - Billable Hours Management
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Clock, Plus } from "lucide-react";

interface TimeEntry {
  id: string;
  projectId: string;
  userId: string;
  hours: number;
  rate: number;
  date: string;
  description: string;
}

export default function ProfessionalServicesTimeTrackingPage() {
  const router = useRouter();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const response = await apiJson<{ data: TimeEntry[] }>("/professional-services/time-entries?limit=200");
      setTimeEntries(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch time entries", error);
      setTimeEntries([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/professional-services")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Time Tracking
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              All Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Time Entries Yet</h3>
                <p className="text-muted-foreground mb-4">Start tracking billable hours for your projects</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Time
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.projectId}</TableCell>
                      <TableCell>{entry.userId}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell className="font-semibold">{entry.hours}h</TableCell>
                      <TableCell>{formatCurrency(entry.rate)}/hr</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(entry.hours * entry.rate)}</TableCell>
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

// No mock data - requires professional services API integration
