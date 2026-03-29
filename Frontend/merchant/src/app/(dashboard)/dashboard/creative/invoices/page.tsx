/**
 * Creative Industry - Invoices & Billing Page
 * Manage client invoices, payments, and billing history
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Search, Plus, Clock, FileText } from "lucide-react";
import { useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  project?: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  description: string;
}

export default function CreativeInvoicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const invoices: Invoice[] = [
    { id: "1", invoiceNumber: "INV-2024-001", client: "Tech Corp", project: "Brand Identity Redesign", amount: 35000, issuedDate: "2024-01-05", dueDate: "2024-02-05", status: "pending", description: "Milestone 1 - Logo Design" },
    { id: "2", invoiceNumber: "INV-2024-002", client: "Fashion Boutique", project: "E-commerce Website", amount: 12500, issuedDate: "2024-01-10", dueDate: "2024-02-10", status: "pending", description: "50% deposit payment" },
    { id: "3", invoiceNumber: "INV-2023-089", client: "StartupXYZ", project: "Product Launch Campaign", amount: 18000, issuedDate: "2023-12-15", dueDate: "2024-01-15", status: "overdue", description: "Final payment" },
    { id: "4", invoiceNumber: "INV-2023-067", client: "Law Firm", project: "Corporate Video", amount: 22500, issuedDate: "2023-11-20", dueDate: "2023-12-20", status: "paid", description: "Video production complete" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoices & Billing</h1>
            <p className="text-muted-foreground">Manage client invoicing and payments</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/creative/invoices/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, client, or project..."
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
                  <th className="py-3 px-4 font-medium" scope="col">Project</th>
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
                    <td className="py-3 px-4 font-medium">{invoice.client}</td>
                    <td className="py-3 px-4 text-sm">{invoice.project || "-"}</td>
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
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/invoices/${invoice.id}`)}>
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
