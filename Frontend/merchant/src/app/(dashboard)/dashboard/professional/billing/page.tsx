/**
 * Professional (Legal) - Billing & Invoices Page
 * Manage legal billing, invoices, and trust accounting
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Search, Plus, FileText, Clock } from "lucide-react";
import { useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  matterReference: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  description: string;
}

export default function ProfessionalBillingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const invoices: Invoice[] = [
    { id: "1", invoiceNumber: "INV-2024-001", clientName: "Tech Corp", matterReference: "MAT-2024-001", amount: 25000, issuedDate: "2024-01-15", dueDate: "2024-02-15", status: "pending", description: "Corporate merger legal services" },
    { id: "2", invoiceNumber: "INV-2024-002", clientName: "Finance Plus", matterReference: "MAT-2024-002", amount: 8500, issuedDate: "2024-01-20", dueDate: "2024-02-20", status: "pending", description: "Employment dispute consultation" },
    { id: "3", invoiceNumber: "INV-2023-089", clientName: "Healthcare Inc", matterReference: "MAT-2023-089", amount: 15000, issuedDate: "2023-12-20", dueDate: "2024-01-20", status: "overdue", description: "IP patent filing services" },
    { id: "4", invoiceNumber: "INV-2023-067", clientName: "Retail Solutions", matterReference: "MAT-2023-067", amount: 18500, issuedDate: "2023-11-15", dueDate: "2023-12-15", status: "paid", description: "Commercial real estate transaction" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage legal billing and invoicing</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/billing/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, client, or matter..."
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
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-2xl font-bold">${invoices.reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "pending").reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "overdue").reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "paid").reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
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
                  <th className="py-3 px-4 font-medium" scope="col">Invoice #</th>
                  <th className="py-3 px-4 font-medium" scope="col">Client</th>
                  <th className="py-3 px-4 font-medium" scope="col">Matter</th>
                  <th className="py-3 px-4 font-medium" scope="col">Description</th>
                  <th className="py-3 px-4 font-medium" scope="col">Amount</th>
                  <th className="py-3 px-4 font-medium" scope="col">Issued</th>
                  <th className="py-3 px-4 font-medium" scope="col">Due Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono font-semibold">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium">{invoice.clientName}</td>
                    <td className="py-3 px-4 font-mono text-sm">{invoice.matterReference}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{invoice.description}</td>
                    <td className="py-3 px-4 font-bold">${invoice.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{invoice.issuedDate}</td>
                    <td className="py-3 px-4 text-sm">{invoice.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : invoice.status === "pending" ? "secondary" : "outline"}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/billing/${invoice.id}`)}>
                        View
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
