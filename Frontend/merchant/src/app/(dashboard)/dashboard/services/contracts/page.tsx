/**
 * Services Industry - Contracts Management Page
 * Manage service agreements, contracts, and legal documents
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Contract {
  id: string;
  title: string;
  client: string;
  type: "service-agreement" | "nda" | "sow" | "retainer" | "consulting" | "maintenance";
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "expired" | "draft";
  autoRenew: boolean;
  daysUntilExpiry?: number;
}

export default function ServicesContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const contracts: Contract[] = [
    { id: "1", title: "Annual IT Support Agreement", client: "TechCorp Industries", type: "service-agreement", value: 85000, startDate: "2024-01-01", endDate: "2024-12-31", status: "active", autoRenew: true, daysUntilExpiry: 340 },
    { id: "2", title: "Marketing Strategy Consulting", client: "GrowthCo LLC", type: "consulting", value: 45000, startDate: "2024-02-01", endDate: "2024-07-31", status: "active", autoRenew: false, daysUntilExpiry: 156 },
    { id: "3", title: "Non-Disclosure Agreement", client: "StartupHub Inc", type: "nda", value: 0, startDate: "2024-01-15", endDate: "2026-01-15", status: "active", autoRenew: false, daysUntilExpiry: 720 },
    { id: "4", title: "Website Maintenance Contract", client: "RetailMax", type: "maintenance", value: 24000, startDate: "2024-01-01", endDate: "2024-12-31", status: "active", autoRenew: true, daysUntilExpiry: 340 },
    { id: "5", title: "Business Process Optimization", client: "FinanceFirst", type: "sow", value: 62000, startDate: "2024-03-01", endDate: "2024-08-31", status: "pending", autoRenew: false, daysUntilExpiry: 187 },
    { id: "6", title: "Monthly Retainer Agreement", client: "LegalEase Partners", type: "retainer", value: 120000, startDate: "2024-01-01", endDate: "2024-12-31", status: "active", autoRenew: true, daysUntilExpiry: 340 },
    { id: "7", title: "Brand Development Project", client: "CreativeMinds", type: "consulting", value: 38000, startDate: "2023-11-01", endDate: "2024-04-30", status: "active", autoRenew: false, daysUntilExpiry: 95 },
    { id: "8", title: "Software License Agreement", client: "DataSystems Corp", type: "service-agreement", value: 95000, startDate: "2023-06-01", endDate: "2024-05-31", status: "active", autoRenew: true, daysUntilExpiry: 126 },
    { id: "9", title: "HR Consulting Framework", client: "PeopleFirst Inc", type: "draft", value: 55000, startDate: "2024-04-01", endDate: "2025-03-31", status: "draft", autoRenew: false },
  ];

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "pending").length,
    draft: contracts.filter(c => c.status === "draft").length,
    expired: contracts.filter(c => c.status === "expired").length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0),
    renewalsNeeded: contracts.filter(c => c.autoRenew && c.daysUntilExpiry && c.daysUntilExpiry < 90).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/services")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                Contracts & Agreements
              </h1>
              <p className="text-muted-foreground mt-1">Manage service contracts and legal documents</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-slate-700 to-gray-700 hover:from-slate-800 hover:to-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active, {stats.pending} pending</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contract Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(stats.totalValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Across all contracts</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Renewals Due (90d)</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.renewalsNeeded}</div>
              <p className="text-xs text-muted-foreground mt-1">Auto-renewal contracts</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending + stats.draft}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting signature</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts by title, client, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Contracts ({filteredContracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Contract Title</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Client</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Type</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Value</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Auto-Renew</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Days to Expiry</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{contract.title}</td>
                      <td className="py-3 px-4 text-sm">{contract.client}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {contract.type.replace(/-/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-green-600">
                        ${contract.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{contract.startDate}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{contract.endDate}</td>
                      <td className="py-3 px-4">
                        {contract.autoRenew ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {contract.daysUntilExpiry ? (
                          <div className="flex items-center gap-2">
                            <span className={contract.daysUntilExpiry < 90 ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                              {contract.daysUntilExpiry} days
                            </span>
                            {contract.daysUntilExpiry < 90 && <Clock className="h-3 w-3 text-orange-600" />}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={contract.status === "active" ? "default" : contract.status === "pending" ? "secondary" : contract.status === "expired" ? "destructive" : "outline"}>
                          {contract.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/services/contracts/${contract.id}`)}>
                            View
                          </Button>
                          {contract.status === "pending" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Approve
                            </Button>
                          )}
                          {contract.daysUntilExpiry && contract.daysUntilExpiry < 90 && (
                            <Button variant="outline" size="sm" className="text-orange-600">
                              Renew
                            </Button>
                          )}
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
    </div>
  );
}
