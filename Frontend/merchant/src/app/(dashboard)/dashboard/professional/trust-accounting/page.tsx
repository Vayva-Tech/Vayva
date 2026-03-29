/**
 * Professional (Legal) - Trust Accounting Page
 * Manage client trust funds, retainers, and escrow accounts
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Search, Plus, Wallet, Shield } from "lucide-react";
import { useState } from "react";

interface TrustAccount {
  id: string;
  clientName: string;
  matterReference: string;
  balance: number;
  retainerAmount: number;
  lastActivity: string;
  status: "active" | "closed" | "pending";
}

export default function ProfessionalTrustAccountingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const trustAccounts: TrustAccount[] = [
    { id: "1", clientName: "Tech Corp", matterReference: "MAT-2024-001", balance: 50000, retainerAmount: 75000, lastActivity: "2024-01-22", status: "active" },
    { id: "2", clientName: "Finance Plus", matterReference: "MAT-2024-002", balance: 15000, retainerAmount: 25000, lastActivity: "2024-01-21", status: "active" },
    { id: "3", clientName: "Healthcare Inc", matterReference: "MAT-2023-089", balance: 35000, retainerAmount: 50000, lastActivity: "2024-01-20", status: "active" },
    { id: "4", clientName: "Retail Solutions", matterReference: "MAT-2023-067", balance: 0, retainerAmount: 40000, lastActivity: "2024-01-15", status: "closed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trust Accounting</h1>
            <p className="text-muted-foreground">Manage client trust funds and retainers</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/trust/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Trust Account
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, matter, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trust Balance</p>
                <p className="text-2xl font-bold">${trustAccounts.reduce((acc, a) => acc + a.balance, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Retainers</p>
                <p className="text-2xl font-bold">${trustAccounts.reduce((acc, a) => acc + a.retainerAmount, 0).toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{trustAccounts.filter(a => a.status === "active").length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Funds</p>
                <p className="text-2xl font-bold">${(trustAccounts.reduce((acc, a) => acc + a.balance, 0) * 0.85).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Client</th>
                  <th className="py-3 px-4 font-medium" scope="col">Matter</th>
                  <th className="py-3 px-4 font-medium" scope="col">Balance</th>
                  <th className="py-3 px-4 font-medium" scope="col">Retainer</th>
                  <th className="py-3 px-4 font-medium" scope="col">Utilization</th>
                  <th className="py-3 px-4 font-medium" scope="col">Last Activity</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {trustAccounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{account.clientName}</td>
                    <td className="py-3 px-4 font-mono text-sm">{account.matterReference}</td>
                    <td className="py-3 px-4 font-bold text-green-600">${account.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">${account.retainerAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${account.balance / account.retainerAmount < 0.2 ? 'bg-red-500' : account.balance / account.retainerAmount < 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${(account.balance / account.retainerAmount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{((account.balance / account.retainerAmount) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{account.lastActivity}</td>
                    <td className="py-3 px-4">
                      <Badge variant={account.status === "active" ? "default" : account.status === "closed" ? "outline" : "secondary"}>
                        {account.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/trust/${account.id}`)}>
                        Details
                      </Button>
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
