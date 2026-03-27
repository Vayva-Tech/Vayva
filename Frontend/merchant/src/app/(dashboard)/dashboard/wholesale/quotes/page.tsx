/**
 * Wholesale - Quotes Management Page
 * Create and manage B2B price quotes and proposals
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  companyName: string;
  totalAmount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdDate: string;
  expiryDate: string;
}

export default function WholesaleQuotesPage() {
  const router = useRouter();

  const quotes: Quote[] = [
    { id: "1", quoteNumber: "QT-2024-001", customerName: "John Smith", companyName: "ABC Retailers", totalAmount: 15750.00, status: "sent", createdDate: "2024-01-10", expiryDate: "2024-01-24" },
    { id: "2", quoteNumber: "QT-2024-002", customerName: "Sarah Johnson", companyName: "XYZ Distributors", totalAmount: 28900.00, status: "accepted", createdDate: "2024-01-08", expiryDate: "2024-01-22" },
    { id: "3", quoteNumber: "QT-2024-003", customerName: "Mike Brown", companyName: "Quick Supply Co", totalAmount: 8450.00, status: "draft", createdDate: "2024-01-15", expiryDate: "2024-01-29" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Quotes & Proposals</h1>
            <p className="text-muted-foreground">Manage B2B price quotes and custom proposals</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale/quotes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{quote.quoteNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">{quote.companyName}</p>
                </div>
                <Badge variant={quote.status === "accepted" ? "default" : quote.status === "rejected" ? "destructive" : quote.status === "draft" ? "secondary" : "outline"}>
                  {quote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-semibold">${quote.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{quote.createdDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires:</span>
                <span className={new Date(quote.expiryDate) < new Date() ? "text-red-600 font-medium" : ""}>{quote.expiryDate}</span>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wholesale/quotes/${quote.id}`)}>
                  View
                </Button>
                {quote.status === "sent" && (
                  <>
                    <Button size="sm" variant="outline"><CheckCircle className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline"><XCircle className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
