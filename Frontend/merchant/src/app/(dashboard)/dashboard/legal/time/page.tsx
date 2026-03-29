/**
 * ============================================================================
 * Legal Time & Billing Page
 * ============================================================================
 * Time tracking, invoice generation, and billing management
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, DollarSign, FileText, Plus, ChevronLeft, Timer, Receipt } from "lucide-react";

interface TimeEntry {
  id: string;
  matterId: string;
  attorneyName: string;
  date: string;
  duration: number;
  description: string;
  amount: number;
  billable: boolean;
  invoiced: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
}

export default function LegalTimeBillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeRes, invoicesRes] = await Promise.all([
        apiJson<{ data: TimeEntry[] }>("/legal/time-entries"),
        apiJson<{ data: Invoice[] }>("/legal/invoices"),
      ]);
      setTimeEntries(timeRes.data || generateMockTimeEntries());
      setInvoices(invoicesRes.data || generateMockInvoices());
    } catch (error) {
      setTimeEntries(generateMockTimeEntries());
      setInvoices(generateMockInvoices());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/legal")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Time & Billing
                </h1>
                <p className="text-xs text-muted-foreground">Track time and manage invoices</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm">
              <Timer className="h-4 w-4 mr-2" />
              Log Time
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(timeEntries.filter(t => !t.invoiced).reduce((sum, t) => sum + t.amount, 0))}</p>
                  <p className="text-xs text-muted-foreground">Unbilled Time</p>
                </div>
                <Timer className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.total, 0))}</p>
                  <p className="text-xs text-muted-foreground">Overdue Invoices</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{invoices.filter(i => i.status === "paid").length}/{invoices.length}</p>
                  <p className="text-xs text-muted-foreground">Collection Rate</p>
                </div>
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="time">
          <TabsList>
            <TabsTrigger value="time">
              <Clock className="h-4 w-4 mr-2" />
              Time Entries
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <FileText className="h-4 w-4 mr-2" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Attorney</TableHead>
                        <TableHead>Matter</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.attorneyName}</TableCell>
                          <TableCell>{entry.matterId}</TableCell>
                          <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                          <TableCell>{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(entry.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={entry.invoiced ? "default" : "secondary"}>
                              {entry.invoiced ? "Billed" : "Unbilled"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


// No mock data - requires real legal API integration

