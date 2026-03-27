/**
 * Wellness - Memberships Management Page
 * Manage membership plans, subscriptions, and renewals
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, DollarSign, Users, Plus } from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  activeMembers: number;
  status: "active" | "inactive";
}

export default function WellnessMembershipsPage() {
  const router = useRouter();

  const plans: MembershipPlan[] = [
    { id: "1", name: "Basic", price: 49, billingCycle: "monthly", features: ["Gym access", "Locker room", "Free WiFi"], activeMembers: 847, status: "active" },
    { id: "2", name: "Premium", price: 79, billingCycle: "monthly", features: ["All Basic features", "Group classes", "Sauna access", "1 PT session/month"], activeMembers: 1245, status: "active" },
    { id: "3", name: "Elite", price: 149, billingCycle: "monthly", features: ["All Premium features", "Unlimited classes", "Nutrition plan", "4 PT sessions/month"], activeMembers: 523, status: "active" },
    { id: "4", name: "Annual Premium", price: 790, billingCycle: "yearly", features: ["All Premium features", "2 months free", "Free assessment"], activeMembers: 232, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Memberships</h1>
            <p className="text-muted-foreground">Manage membership plans and subscriptions</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/memberships/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active Members</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">$284.5K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Retention</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{plan.billingCycle}</p>
                </div>
                <Badge variant={plan.status === "active" ? "default" : "outline"}>{plan.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-2">/{plan.billingCycle === "monthly" ? "mo" : "yr"}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Active Members:</span>
                  <span className="font-medium">{plan.activeMembers.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/memberships/${plan.id}`)}>
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/members?plan=${plan.id}`)}>
                  View Members
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
