/**
 * Retail Industry - Customer Loyalty Program Management Page
 * Manage loyalty members, points, rewards, and engagement
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, Search, TrendingUp, Gift, Crown } from "lucide-react";
import { useState } from "react";

interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  lifetimePoints: number;
  joinDate: string;
  lastPurchase: string;
  totalSpent: number;
  visits: number;
  status: "active" | "inactive";
}

export default function RetailLoyaltyPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const members: LoyaltyMember[] = [
    { id: "1", name: "Sarah Williams", email: "sarah.w@email.com", phone: "(555) 234-5678", tier: "platinum", points: 12500, lifetimePoints: 45000, joinDate: "2023-03-15", lastPurchase: "2024-01-19", totalSpent: 8750, visits: 47, status: "active" },
    { id: "2", name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", tier: "gold", points: 5600, lifetimePoints: 18500, joinDate: "2023-06-22", lastPurchase: "2024-01-20", totalSpent: 4250, visits: 28, status: "active" },
    { id: "3", name: "Michael Brown", email: "mbrown@email.com", phone: "(555) 345-6789", tier: "silver", points: 2800, lifetimePoints: 8900, joinDate: "2023-09-10", lastPurchase: "2024-01-18", totalSpent: 2150, visits: 15, status: "active" },
    { id: "4", name: "Emily Davis", email: "emily.davis@email.com", phone: "(555) 456-7890", tier: "gold", points: 6200, lifetimePoints: 21000, joinDate: "2023-05-08", lastPurchase: "2024-01-17", totalSpent: 5100, visits: 32, status: "active" },
    { id: "5", name: "Robert Wilson", email: "rwilson@email.com", phone: "(555) 567-8901", tier: "bronze", points: 850, lifetimePoints: 3200, joinDate: "2023-11-20", lastPurchase: "2024-01-10", totalSpent: 890, visits: 6, status: "active" },
    { id: "6", name: "Jennifer Martinez", email: "jmartinez@email.com", phone: "(555) 678-9012", tier: "platinum", points: 15200, lifetimePoints: 52000, joinDate: "2023-02-01", lastPurchase: "2024-01-20", totalSpent: 10500, visits: 58, status: "active" },
    { id: "7", name: "David Anderson", email: "d.anderson@email.com", phone: "(555) 789-0123", tier: "silver", points: 3100, lifetimePoints: 9800, joinDate: "2023-08-14", lastPurchase: "2023-12-28", totalSpent: 2450, visits: 18, status: "inactive" },
    { id: "8", name: "Lisa Thompson", email: "lthompson@email.com", phone: "(555) 890-1234", tier: "bronze", points: 1200, lifetimePoints: 4500, joinDate: "2023-10-05", lastPurchase: "2024-01-15", totalSpent: 1250, visits: 9, status: "active" },
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === "active").length,
    platinum: members.filter(m => m.tier === "platinum").length,
    gold: members.filter(m => m.tier === "gold").length,
    silver: members.filter(m => m.tier === "silver").length,
    bronze: members.filter(m => m.tier === "bronze").length,
    totalPointsOutstanding: members.reduce((sum, m) => sum + m.points, 0),
    avgPointsPerMember: Math.round(members.reduce((sum, m) => sum + m.points, 0) / members.length),
  };

  const tierBenefits = {
    platinum: "Free shipping, Early access, Personal shopper, 5% cashback",
    gold: "Free shipping, Birthday gift, 3% cashback",
    silver: "Double points days, 2% cashback",
    bronze: "Earn points, Member discounts",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/retail")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Loyalty Program
              </h1>
              <p className="text-muted-foreground mt-1">Manage members, points, and rewards</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
            <Gift className="h-4 w-4 mr-2" />
            Create Reward
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Platinum Members</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.platinum}</div>
              <p className="text-xs text-muted-foreground mt-1">Top tier customers</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Points Outstanding</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{(stats.totalPointsOutstanding / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Avg {(stats.avgPointsPerMember / 1000).toFixed(1)}K per member</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gold Members</CardTitle>
              <Badge className="h-6 w-6 text-xs">GOLD</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.gold}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.silver} silver, {stats.bronze} bronze</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Breakdown */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Loyalty Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { tier: "Platinum", count: stats.platinum, color: "from-purple-500 to-pink-500", benefit: tierBenefits.platinum },
                { tier: "Gold", count: stats.gold, color: "from-yellow-500 to-amber-500", benefit: tierBenefits.gold },
                { tier: "Silver", count: stats.silver, color: "from-gray-400 to-gray-500", benefit: tierBenefits.silver },
                { tier: "Bronze", count: stats.bronze, color: "from-orange-700 to-orange-800", benefit: tierBenefits.bronze },
              ].map((tier) => (
                <div key={tier.tier} className={`p-4 rounded-lg bg-gradient-to-br ${tier.color} text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{tier.tier}</span>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">{tier.count} members</Badge>
                  </div>
                  <p className="text-xs opacity-90">{tier.benefit}</p>
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
                placeholder="Search by name, email, or tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Loyalty Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Member</th>
                    <th className="text-left py-3 px-4 font-semibold">Tier</th>
                    <th className="text-left py-3 px-4 font-semibold">Points</th>
                    <th className="text-left py-3 px-4 font-semibold">Lifetime Points</th>
                    <th className="text-left py-3 px-4 font-semibold">Total Spent</th>
                    <th className="text-left py-3 px-4 font-semibold">Visits</th>
                    <th className="text-left py-3 px-4 font-semibold">Last Purchase</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={member.tier === "platinum" ? "default" : member.tier === "gold" ? "secondary" : member.tier === "silver" ? "outline" : "outline"} className="capitalize">
                          {member.tier === "platinum" && <Crown className="h-3 w-3 mr-1" />}
                          {member.tier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-yellow-600">{member.points.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{member.lifetimePoints.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">${member.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{member.visits}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{member.lastPurchase}</td>
                      <td className="py-3 px-4">
                        <Badge variant={member.status === "active" ? "default" : "outline"}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/retail/loyalty/${member.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-blue-600">
                            Award Points
                          </Button>
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
