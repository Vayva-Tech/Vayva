/**
 * Real Estate - Contracts Management Page
 * Manage purchase agreements, contracts, and transaction documents
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Download } from "lucide-react";

interface Contract {
  id: string;
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  contractValue: number;
  signedDate: string;
  closingDate: string;
  status: "draft" | "pending-signature" | "under-contract" | "closed" | "cancelled";
  contingencies: number;
}

export default function RealEstateContractsPage() {
  const router = useRouter();

  const contracts: Contract[] = [
    { id: "1", propertyAddress: "123 Oak Street, Beverly Hills", buyerName: "John & Lisa Smith", sellerName: "Robert Chen", contractValue: 2450000, signedDate: "2024-01-10", closingDate: "2024-02-15", status: "under-contract", contingencies: 2 },
    { id: "2", propertyAddress: "789 Maple Drive, Austin", buyerName: "Tech Executives", sellerName: "Homeowner LLC", contractValue: 975000, signedDate: "2024-01-14", closingDate: "2024-02-28", status: "pending-signature", contingencies: 3 },
    { id: "3", propertyAddress: "456 Ocean Drive, Miami", buyerName: "Investment Group", sellerName: "Estate Sale", contractValue: 3200000, signedDate: "2023-12-20", closingDate: "2024-01-20", status: "closed", contingencies: 0 },
    { id: "4", propertyAddress: "321 Pine Lane, Seattle", buyerName: "Young Family", sellerName: "Builder", contractValue: 1250000, signedDate: "2024-01-08", closingDate: "2024-02-10", status: "under-contract", contingencies: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Contracts</h1>
            <p className="text-muted-foreground">Manage purchase agreements and transactions</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/contracts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === "under-contract").length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Signatures</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === "pending-signature").length}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${(contracts.reduce((acc, c) => acc + c.contractValue, 0) / 1000000).toFixed(1)}M</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed This Month</p>
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === "closed").length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Property</th>
                  <th className="py-3 px-4 font-medium">Buyer → Seller</th>
                  <th className="py-3 px-4 font-medium">Contract Value</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Closing Date</th>
                  <th className="py-3 px-4 font-medium">Contingencies</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{contract.propertyAddress.split(',')[0]}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>{contract.buyerName.split(' ')[0]}</div>
                      <div className="text-xs text-muted-foreground">→ {contract.sellerName}</div>
                    </td>
                    <td className="py-3 px-4 font-bold">${contract.contractValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={contract.status === "closed" ? "default" : contract.status === "cancelled" ? "destructive" : contract.status === "pending-signature" ? "secondary" : "outline"}>
                        {contract.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{contract.closingDate}</td>
                    <td className="py-3 px-4">
                      {contract.contingencies > 0 ? (
                        <Badge variant="outline">{contract.contingencies}</Badge>
                      ) : (
                        <span className="text-green-600">✓ Cleared</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/real-estate/contracts/${contract.id}`)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
