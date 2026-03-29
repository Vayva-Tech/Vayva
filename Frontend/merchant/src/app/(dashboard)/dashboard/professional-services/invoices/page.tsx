/**
 * Professional Services - Invoices & Billing Page
 * Manage invoices, payments, and billing history
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Plus, Download } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  projectName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
}

export default function ProfessionalServicesInvoicesPage() {
  const router = useRouter();

  const invoices: Invoice[] = [
    { id: "1", invoiceNumber: "INV-2024-001", clientName: "Tech Corp", projectName: "Website Redesign", amount: 15000, issueDate: "2024-01-05", dueDate: "2024-02-05", status: "pending" },
    { id: "2", invoiceNumber: "INV-2024-002", clientName: "Finance Plus", projectName: "Brand Strategy", amount: 10666, issueDate: "2024-01-10", dueDate: "2024-02-10", status: "pending" },
    { id: "3", invoiceNumber: "INV-2023-089", clientName: "Healthcare Inc", projectName: "Marketing Campaign", amount: 29000, issueDate: "2023-12-15", dueDate: "2024-01-15", status: "overdue" },
    { id: "4", invoiceNumber: "INV-2023-078", clientName: "Retail Solutions", projectName: "SEO Optimization", amount: 14000, issueDate: "2023-12-01", dueDate: "2024-01-01", status: "paid" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoices & Billing</h1>
            <p className="text-muted-foreground">Manage invoices and payment tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => router.push("/dashboard/professional-services/invoices/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$1.2M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "pending").reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "overdue").reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid (This Month)</p>
                <p className="text-2xl font-bold">${invoices.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
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
                    <td className="py-3 px-4 font-mono font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4">{invoice.clientName}</td>
                    <td className="py-3 px-4 text-sm">{invoice.projectName}</td>
                    <td className="py-3 px-4 font-bold">${invoice.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{invoice.issueDate}</td>
                    <td className="py-3 px-4 text-sm">{invoice.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/invoices/${invoice.id}`)}>
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
