/**
 * SaaS Industry - Subscription Management Page
 * Manage customer subscriptions, plans, and recurring billing
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, Search, Plus, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  plan: "starter" | "professional" | "enterprise" | "custom";
  status: "active" | "trialing" | "cancelled" | "past_due" | "paused";
  mrr: number;
  startDate: string;
  renewalDate: string;
  seats: number;
  usage: number;
  trialEnds?: string;
}

export default function SaaSSubscriptionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const subscriptions: Subscription[] = [
    { id: "1", customerName: "TechCorp Inc", customerEmail: "admin@techcorp.com", plan: "enterprise", status: "active", mrr: 2499, startDate: "2023-06-15", renewalDate: "2024-02-15", seats: 50, usage: 87 },
    { id: "2", customerName: "StartupHub", customerEmail: "billing@startuphub.io", plan: "professional", status: "active", mrr: 499, startDate: "2023-09-20", renewalDate: "2024-02-20", seats: 15, usage: 62 },
    { id: "3", customerName: "Digital Agency Co", customerEmail: "accounts@digitalagency.com", plan: "starter", status: "trialing", mrr: 0, startDate: "2024-01-10", renewalDate: "2024-02-10", seats: 5, usage: 45, trialEnds: "2024-01-24" },
    { id: "4", customerName: "E-commerce Solutions", customerEmail: "finance@ecommsolutions.com", plan: "professional", status: "active", mrr: 499, startDate: "2023-08-05", renewalDate: "2024-02-05", seats: 20, usage: 78 },
    { id: "5", customerName: "Consulting Partners", customerEmail: "ops@consultingpartners.com", plan: "enterprise", status: "past_due", mrr: 1999, startDate: "2023-05-10", renewalDate: "2024-02-10", seats: 40, usage: 92 },
    { id: "6", customerName: "Marketing Pros", customerEmail: "team@marketingpros.com", plan: "professional", status: "cancelled", mrr: 0, startDate: "2023-07-01", renewalDate: "2024-01-01", seats: 10, usage: 0 },
    { id: "7", customerName: "Software Labs", customerEmail: "billing@softwarelabs.io", plan: "starter", status: "active", mrr: 99, startDate: "2023-11-15", renewalDate: "2024-02-15", seats: 5, usage: 34 },
    { id: "8", customerName: "Growth Hackers Ltd", customerEmail: "admin@growthhackers.com", plan: "custom", status: "active", mrr: 4999, startDate: "2023-04-20", renewalDate: "2024-04-20", seats: 100, usage: 95 },
  ];

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    trialing: subscriptions.filter(s => s.status === "trialing").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
    pastDue: subscriptions.filter(s => s.status === "past_due").length,
    totalMRR: subscriptions.filter(s => s.status === "active" || s.status === "past_due").reduce((sum, s) => sum + s.mrr, 0),
    avgMRR: subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + s.mrr, 0) / subscriptions.filter(s => s.status === "active").length,
  };

  const planDistribution = [
    { plan: "Starter", count: subscriptions.filter(s => s.plan === "starter").length, mrr: subscriptions.filter(s => s.plan === "starter").reduce((sum, s) => sum + s.mrr, 0), color: "from-blue-500 to-cyan-500" },
    { plan: "Professional", count: subscriptions.filter(s => s.plan === "professional").length, mrr: subscriptions.filter(s => s.plan === "professional").reduce((sum, s) => sum + s.mrr, 0), color: "from-purple-500 to-pink-500" },
    { plan: "Enterprise", count: subscriptions.filter(s => s.plan === "enterprise").length, mrr: subscriptions.filter(s => s.plan === "enterprise").reduce((sum, s) => sum + s.mrr, 0), color: "from-orange-500 to-amber-500" },
    { plan: "Custom", count: subscriptions.filter(s => s.plan === "custom").length, mrr: subscriptions.filter(s => s.plan === "custom").reduce((sum, s) => sum + s.mrr, 0), color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/saas")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Subscriptions
              </h1>
              <p className="text-muted-foreground mt-1">Manage customer plans and recurring revenue</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total MRR</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalMRR.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly recurring revenue</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.trialing} trials, {stats.pastDue} past due</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg MRR per Account</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${Math.round(stats.avgMRR)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per active subscription</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
              <Badge className="h-6 w-6 text-xs">CANCELLED</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground mt-1">Lost subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{plan.plan}</span>
                    <span className="text-muted-foreground">{plan.count} subscribers • ${plan.mrr.toLocaleString()} MRR</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${plan.color}`}
                      style={{ width: `${(plan.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, email, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">MRR</th>
                    <th className="text-left py-3 px-4 font-semibold">Seats</th>
                    <th className="text-left py-3 px-4 font-semibold">Usage</th>
                    <th className="text-left py-3 px-4 font-semibold">Renewal Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{sub.customerName}</p>
                          <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={sub.plan === "enterprise" ? "default" : sub.plan === "professional" ? "secondary" : sub.plan === "custom" ? "outline" : "outline"} className="capitalize">
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.status === "active" ? "default" : sub.status === "trialing" ? "secondary" : sub.status === "cancelled" || sub.status === "past_due" ? "destructive" : "outline"}>
                            {sub.status}
                          </Badge>
                          {sub.trialEnds && (
                            <span className="text-xs text-muted-foreground">Ends {sub.trialEnds}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">${sub.mrr.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{sub.seats} seats</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className={`h-full ${sub.usage > 80 ? 'bg-red-500' : sub.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${sub.usage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{sub.usage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{sub.renewalDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/saas/subscriptions/${sub.id}`)}>
                            View
                          </Button>
                          {sub.status === "trialing" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Convert
                            </Button>
                          )}
                          {sub.status === "past_due" && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Remind
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
