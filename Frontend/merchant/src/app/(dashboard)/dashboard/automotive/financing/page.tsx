/**
 * Automotive Industry - Financing Calculator & Management Page
 * Manage customer financing, loans, and payment calculations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Search, Plus, Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";

interface FinancingDeal {
  id: string;
  customerName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  salePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  lender: string;
  creditScore: number;
  status: "pending" | "approved" | "declined" | "active";
  applicationDate: string;
}

export default function AutomotiveFinancingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const deals: FinancingDeal[] = [
    { id: "1", customerName: "John Smith", vehicleMake: "Tesla", vehicleModel: "Model 3", vehicleYear: 2024, salePrice: 42990, downPayment: 8000, loanAmount: 34990, interestRate: 4.9, termMonths: 60, monthlyPayment: 658, lender: "Tesla Financial", creditScore: 750, status: "approved", applicationDate: "2024-01-15" },
    { id: "2", customerName: "Sarah Williams", vehicleMake: "BMW", vehicleModel: "X5", vehicleYear: 2024, salePrice: 68500, downPayment: 15000, loanAmount: 53500, interestRate: 5.2, termMonths: 72, monthlyPayment: 865, lender: "BMW Credit", creditScore: 720, status: "pending", applicationDate: "2024-01-18" },
    { id: "3", customerName: "Michael Brown", vehicleMake: "Mercedes-Benz", vehicleModel: "C-Class", vehicleYear: 2023, salePrice: 48900, downPayment: 10000, loanAmount: 38900, interestRate: 4.5, termMonths: 60, monthlyPayment: 725, lender: "Mercedes-Benz Financial", creditScore: 780, status: "active", applicationDate: "2024-01-10" },
    { id: "4", customerName: "Emily Davis", vehicleMake: "Audi", vehicleModel: "e-tron GT", vehicleYear: 2024, salePrice: 106500, downPayment: 25000, loanAmount: 81500, interestRate: 3.9, termMonths: 60, monthlyPayment: 1498, lender: "Audi Finance", creditScore: 800, status: "approved", applicationDate: "2024-01-16" },
    { id: "5", customerName: "Robert Wilson", vehicleMake: "Ford", vehicleModel: "F-150", vehicleYear: 2024, salePrice: 58750, downPayment: 12000, loanAmount: 46750, interestRate: 5.5, termMonths: 72, monthlyPayment: 762, lender: "Ford Credit", creditScore: 690, status: "declined", applicationDate: "2024-01-12" },
    { id: "6", customerName: "Jennifer Martinez", vehicleMake: "Porsche", vehicleModel: "911 Carrera", vehicleYear: 2024, salePrice: 125900, downPayment: 30000, loanAmount: 95900, interestRate: 4.2, termMonths: 60, monthlyPayment: 1768, lender: "Porsche Financial", creditScore: 820, status: "approved", applicationDate: "2024-01-17" },
    { id: "7", customerName: "David Anderson", vehicleMake: "Toyota", vehicleModel: "RAV4", vehicleYear: 2023, salePrice: 32500, downPayment: 5000, loanAmount: 27500, interestRate: 5.9, termMonths: 60, monthlyPayment: 531, lender: "Toyota Financial", creditScore: 680, status: "active", applicationDate: "2024-01-08" },
    { id: "8", customerName: "Lisa Thompson", vehicleMake: "Honda", vehicleModel: "Accord", vehicleYear: 2023, salePrice: 29900, downPayment: 7000, loanAmount: 22900, interestRate: 5.3, termMonths: 48, monthlyPayment: 531, lender: "Honda Financial", creditScore: 710, status: "active", applicationDate: "2024-01-09" },
  ];

  const filteredDeals = deals.filter(deal =>
    deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${deal.vehicleMake} ${deal.vehicleModel}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.lender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: deals.length,
    pending: deals.filter(d => d.status === "pending").length,
    approved: deals.filter(d => d.status === "approved").length,
    active: deals.filter(d => d.status === "active").length,
    declined: deals.filter(d => d.status === "declined").length,
    totalLoanVolume: deals.filter(d => d.status === "active").reduce((sum, d) => sum + d.loanAmount, 0),
    avgInterestRate: (deals.filter(d => d.status === "active").reduce((sum, d) => sum + d.interestRate, 0) / deals.filter(d => d.status === "active").length).toFixed(2),
    approvalRate: ((deals.filter(d => d.status === "approved" || d.status === "active").length / deals.length) * 100).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Financing & Loans
              </h1>
              <p className="text-muted-foreground mt-1">Manage customer financing and payment plans</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">${(stats.totalLoanVolume / 1000).toFixed(0)}K volume</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 75%</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Interest Rate</CardTitle>
              <Calculator className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgInterestRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Current average</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, vehicle, or lender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financing Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Financing Deals ({filteredDeals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Sale Price</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Down Payment</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Loan Amount</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Interest Rate</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Term</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Monthly Payment</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Credit Score</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{deal.customerName}</p>
                          <p className="text-xs text-muted-foreground">Applied: {deal.applicationDate}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{deal.vehicleMake} {deal.vehicleModel}</p>
                          <p className="text-xs text-muted-foreground">{deal.vehicleYear}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">${deal.salePrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-green-600">${deal.downPayment.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-medium">${deal.loanAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-semibold">{deal.interestRate}%</td>
                      <td className="py-3 px-4 text-sm">{deal.termMonths} months</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">${deal.monthlyPayment}</td>
                      <td className="py-3 px-4">
                        <Badge variant={deal.creditScore >= 750 ? "default" : deal.creditScore >= 700 ? "secondary" : "outline"}>
                          {deal.creditScore}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={deal.status === "active" ? "default" : deal.status === "approved" ? "secondary" : deal.status === "declined" ? "destructive" : "outline"}>
                          {deal.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/automotive/financing/${deal.id}`)}>
                            View
                          </Button>
                          {deal.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600">
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Decline
                              </Button>
                            </>
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
