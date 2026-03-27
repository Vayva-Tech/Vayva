/**
 * Professional (Legal) - Clients Management Page
 * Manage law firm clients, contacts, and relationships
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone, Building2 } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  type: "individual" | "corporation" | "partnership" | "nonprofit";
  email: string;
  phone: string;
  company?: string;
  activeMatters: number;
  totalRevenue: number;
  status: "active" | "inactive" | "conflict";
}

export default function ProfessionalClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const clients: Client[] = [
    { id: "1", name: "John Smith", type: "individual", email: "john.smith@email.com", phone: "+1 (555) 123-4567", activeMatters: 2, totalRevenue: 45000, status: "active" },
    { id: "2", name: "Tech Corp", type: "corporation", email: "legal@techcorp.com", phone: "+1 (555) 234-5678", company: "Technology Inc.", activeMatters: 5, totalRevenue: 285000, status: "active" },
    { id: "3", name: "Finance Plus LLC", type: "corporation", email: "counsel@financeplus.com", phone: "+1 (555) 345-6789", company: "Financial Services", activeMatters: 3, totalRevenue: 175000, status: "active" },
    { id: "4", name: "Healthcare Inc", type: "corporation", email: "legal@healthcareinc.com", phone: "+1 (555) 456-7890", company: "Healthcare Provider", activeMatters: 4, totalRevenue: 225000, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage client relationships and contacts</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
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
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === "active").length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Matters</p>
                <p className="text-2xl font-bold">{clients.reduce((acc, c) => acc + c.activeMatters, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${(clients.reduce((acc, c) => acc + c.totalRevenue, 0) / 1000).toFixed(0)}K</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Company</th>
                  <th className="py-3 px-4 font-medium">Active Matters</th>
                  <th className="py-3 px-4 font-medium">Total Revenue</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{client.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{client.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{client.company || "-"}</td>
                    <td className="py-3 px-4 font-bold">{client.activeMatters}</td>
                    <td className="py-3 px-4 font-bold">${client.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={client.status === "active" ? "default" : client.status === "conflict" ? "destructive" : "outline"}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/clients/${client.id}`)}>
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
