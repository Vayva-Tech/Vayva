/**
 * Real Estate - Clients Management Page
 * Manage buyers, sellers, and leads pipeline
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "buyer" | "seller" | "investor" | "renter";
  status: "lead" | "active" | "qualified" | "closed";
  budget?: number;
  propertyInterest?: string;
  lastContact: string;
}

export default function RealEstateClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const clients: Client[] = [
    { id: "1", name: "John & Lisa Smith", email: "john.smith@email.com", phone: "+1 (555) 111-2222", type: "buyer", status: "active", budget: 850000, propertyInterest: "3-4 bed house in Beverly Hills", lastContact: "2024-01-14" },
    { id: "2", name: "Robert Chen", email: "r.chen@email.com", phone: "+1 (555) 222-3333", type: "seller", status: "qualified", budget: undefined, propertyInterest: "Selling: 456 Palm Avenue", lastContact: "2024-01-15" },
    { id: "3", name: "Maria Garcia", email: "maria.g@email.com", phone: "+1 (555) 333-4444", type: "investor", status: "lead", budget: 2000000, propertyInterest: "Multi-family properties", lastContact: "2024-01-13" },
    { id: "4", name: "Tech Startup LLC", email: "realestate@startup.com", phone: "+1 (555) 444-5555", type: "buyer", status: "closed", budget: 5000000, propertyInterest: "Commercial office space", lastContact: "2024-01-10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage buyers, sellers, and leads</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
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
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Buyers</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.type === "buyer" && c.status === "active").length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified Leads</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === "qualified").length}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed Deals</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === "closed").length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Budget/Property</th>
                  <th className="py-3 px-4 font-medium">Last Contact</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{client.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{client.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={client.status === "closed" ? "default" : client.status === "qualified" ? "secondary" : "outline"}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {client.budget ? (
                        <p className="font-medium">${(client.budget / 1000).toFixed(0)}K</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{client.propertyInterest}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{client.lastContact}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/real-estate/clients/${client.id}`)}>
                          View
                        </Button>
                        <Button size="sm">Contact</Button>
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
  );
}
