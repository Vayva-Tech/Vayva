"use client";

/**
 * Travel Dashboard - Payments Page
 * Booking payments and financial transactions
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Payment {
  id: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  method: "credit_card" | "bank_transfer" | "paypal" | "stripe";
  date: string;
}

export default function TravelPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Payment[] }>("/api/travel/payments?limit=500");
      setPayments(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch payments", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      case "refunded":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Payments</h1>
          <p className="mt-1 text-gray-600">Process and track booking payments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>Recent payment activity and processing</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-gray-600 mb-4">Payment transactions will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.bookingNumber}</TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="capitalize">{payment.method.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(payment.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// API INTEGRATION:
// Required Endpoints:
// - GET /api/travel/payments - List payments
// - POST /api/travel/payments - Process payment
// - PUT /api/travel/payments/:id - Update payment status
// - DELETE /api/travel/payments/:id - Refund/cancel payment
