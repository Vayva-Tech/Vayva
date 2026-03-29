/**
 * Creative Industry - Clients Management Page
 * Manage creative agency clients, contacts, and relationships
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone, Briefcase } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: "business" | "startup" | "nonprofit" | "individual";
  status: "active" | "inactive" | "prospect";
  activeProjects: number;
  totalRevenue: number;
  lastContact: string;
}

export default function CreativeClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const clients: Client[] = [
    { id: "1", name: "John Smith", company: "Tech Corp", email: "john@techcorp.com", phone: "+1 (555) 123-4567", type: "business", status: "active", activeProjects: 3, totalRevenue: 85000, lastContact: "2024-01-22" },
    { id: "2", name: "Sarah Johnson", company: "Fashion Boutique", email: "sarah@fashionboutique.com", phone: "+1 (555) 234-5678", type: "business", status: "active", activeProjects: 2, totalRevenue: 45000, lastContact: "2024-01-21" },
    { id: "3", name: "Mike Chen", company: "StartupXYZ", email: "mike@startupxyz.com", phone: "+1 (555) 345-6789", type: "startup", status: "active", activeProjects: 1, totalRevenue: 25000, lastContact: "2024-01-20" },
    { id: "4", name: "Emily Davis", company: "Community Nonprofit", email: "emily@nonprofit.org", phone: "+1 (555) 456-7890", type: "nonprofit", status: "inactive", activeProjects: 0, totalRevenue: 15000, lastContact: "2023-12-15" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage client relationships</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/creative/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or email..."
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
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{clients.reduce((acc, c) => acc + c.activeProjects, 0)}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
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
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Client Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Company</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Contact Info</th>
                  <th className="py-3 px-4 font-medium" scope="col">Active Projects</th>
                  <th className="py-3 px-4 font-medium" scope="col">Total Revenue</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{client.name}</td>
                    <td className="py-3 px-4">{client.company}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{client.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="truncate max-w-[180px]">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{client.activeProjects}</td>
                    <td className="py-3 px-4 font-bold">${client.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={client.status === "active" ? "default" : client.status === "inactive" ? "outline" : "secondary"}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/clients/${client.id}`)}>
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
