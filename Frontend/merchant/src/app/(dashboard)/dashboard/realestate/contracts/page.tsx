/**
 * Real Estate Contracts Page - Transaction Management
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
import { ChevronLeft, DollarSign, FileText } from "lucide-react";

interface Contract {
  id: string;
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  offerPrice: number;
  status: "draft" | "submitted" | "accepted" | "closed" | "rejected";
  closingDate?: string;
}

export default function RealEstateContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await apiJson<{ data: Contract[] }>("/realestate/contracts?limit=200");
      setContracts(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch contracts", error);
      setContracts([]);
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Contract Management
              </h1>
            </div>
          </div>
          <Button size="sm">
            New Contract
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
                <p className="text-muted-foreground mb-4">Create purchase agreements and manage transactions</p>
                <Button>New Contract</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Buyer → Seller</TableHead>
                    <TableHead>Offer Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Closing Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.propertyAddress}</TableCell>
                      <TableCell>{contract.buyerName} → {contract.sellerName}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(contract.offerPrice)}</TableCell>
                      <TableCell><Badge variant={contract.status === "accepted" ? "default" : contract.status === "closed" ? "secondary" : "outline"}>{contract.status}</Badge></TableCell>
                      <TableCell>{contract.closingDate ? formatDate(contract.closingDate) : "-"}</TableCell>
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
