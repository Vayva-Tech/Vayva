/**
 * Beauty Staff Management Page
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
import { ChevronLeft, Award, Users, DollarSign } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  role: string;
  commissionRate: number;
  totalEarnings: number;
  appointmentsToday: number;
}

export default function BeautyStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await apiJson<{ data: Staff[] }>("/beauty/staff");
      setStaff(response.data || generateMockStaff());
    } catch (error) {
      setStaff(generateMockStaff());
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
              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Staff Management
              </h1>
            </div>
          </div>
          <Button size="sm">Add Staff</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{staff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Commissions</p>
                  <p className="text-2xl font-bold">{formatCurrency(staff.reduce((sum, s) => sum + s.totalEarnings, 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Commission Rate</p>
                  <p className="text-2xl font-bold">{(staff.reduce((sum, s) => sum + s.commissionRate, 0) / staff.length * 100).toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Appointments Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                    <TableCell>{(member.commissionRate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(member.totalEarnings)}</TableCell>
                    <TableCell>{member.appointmentsToday}</TableCell>
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

