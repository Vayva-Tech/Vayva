/**
 * Real Estate - Agents Management Page
 * Manage real estate agents, teams, and performance
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Mail, Phone, Star } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  activeListings: number;
  salesYTD: number;
  volumeYTD: number;
  rating: number;
  status: "active" | "inactive" | "top-producer";
}

export default function RealEstateAgentsPage() {
  const router = useRouter();

  const agents: Agent[] = [
    { id: "1", name: "Sarah Johnson", role: "Senior Agent", email: "sarah.j@realestate.com", phone: "+1 (555) 123-4567", activeListings: 12, salesYTD: 45, volumeYTD: 52000000, rating: 4.9, status: "top-producer" },
    { id: "2", name: "Michael Chen", role: "Agent", email: "michael.c@realestate.com", phone: "+1 (555) 234-5678", activeListings: 8, salesYTD: 32, volumeYTD: 38000000, rating: 4.7, status: "active" },
    { id: "3", name: "Emily Rodriguez", role: "Junior Agent", email: "emily.r@realestate.com", phone: "+1 (555) 345-6789", activeListings: 5, salesYTD: 18, volumeYTD: 21000000, rating: 4.6, status: "active" },
    { id: "4", name: "David Park", role: "Team Lead", email: "david.p@realestate.com", phone: "+1 (555) 456-7890", activeListings: 15, salesYTD: 52, volumeYTD: 67000000, rating: 4.9, status: "top-producer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Agents</h1>
            <p className="text-muted-foreground">Manage agent team and performance</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/agents/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Producers</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === "top-producer").length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{agents.reduce((acc, a) => acc + a.activeListings, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{(agents.reduce((acc, a) => acc + a.rating, 0) / agents.length).toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{agent.role}</p>
                </div>
                <Badge variant={agent.status === "top-producer" ? "default" : agent.status === "active" ? "secondary" : "outline"}>
                  {agent.status.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>{agent.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Listings:</span>
                  <span className="font-medium">{agent.activeListings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sales YTD:</span>
                  <span className="font-medium">{agent.salesYTD}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume YTD:</span>
                  <span className="font-medium">${(agent.volumeYTD / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Rating:</span>
                  <Badge variant="outline">★ {agent.rating}</Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/real-estate/agents/${agent.id}`)}>
                  Profile
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/real-estate/agents/${agent.id}/performance`)}>
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
