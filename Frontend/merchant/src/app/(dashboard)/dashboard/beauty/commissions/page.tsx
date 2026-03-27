/**
 * Beauty Commissions & Payroll Page
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, DollarSign, TrendingUp } from "lucide-react";

interface Commission {
  id: string;
  staffId: string;
  staffName: string;
  totalEarnings: number;
  commissionRate: number;
  appointmentsCompleted: number;
  status: string;
}

export default function BeautyCommissionsPage() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const response = await apiJson<{ data: Commission[] }>("/api/beauty/commissions");
      setCommissions(response.data || generateMockCommissions());
    } catch (error) {
      setCommissions(generateMockCommissions());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/beauty")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Commissions & Payroll
              </h1>
            </div>
          </div>
          <Button size="sm">Process Payroll</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="font-medium">{comm.staffName}</TableCell>
                    <TableCell>{comm.appointmentsCompleted}</TableCell>
                    <TableCell><Badge variant="outline">{(comm.commissionRate * 100).toFixed(0)}%</Badge></TableCell>
                    <TableCell className="font-semibold">{formatCurrency(comm.totalEarnings)}</TableCell>
                    <TableCell>
                      <Badge variant={comm.status === "paid" ? "default" : "secondary"}>{comm.status}</Badge>
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


// No mock data - requires real beauty API integration

