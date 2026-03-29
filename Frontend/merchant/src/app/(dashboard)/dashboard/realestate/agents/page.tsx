/**
 * Real Estate Agents Page - Agent Performance Tracking
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
import { ChevronLeft, Briefcase, Plus } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  licenseNumber: string;
  totalSales: number;
  activeListings: number;
  commissionRate: number;
}

export default function RealEstateAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await apiJson<{ data: Agent[] }>("/realestate/agents?limit=200");
      setAgents(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch agents", error);
      setAgents([]);
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
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Agent Management
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              All Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Agents Yet</h3>
                <p className="text-muted-foreground mb-4">Add licensed agents to track performance and commissions</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>License #</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Active Listings</TableHead>
                    <TableHead>Commission Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.licenseNumber}</TableCell>
                      <TableCell><Badge variant="default">{agent.totalSales}</Badge></TableCell>
                      <TableCell>{agent.activeListings}</TableCell>
                      <TableCell className="font-semibold">{agent.commissionRate}%</TableCell>
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
