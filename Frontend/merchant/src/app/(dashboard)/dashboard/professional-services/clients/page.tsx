/**
 * Professional Services - Clients Management Page
 * Manage client relationships, contacts, and account information
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, Search, Plus, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect";
  totalProjects: number;
  revenue: number;
}

export default function ProfessionalServicesClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const clients: Client[] = [
    { id: "1", name: "John Smith", company: "Tech Corp", industry: "Technology", email: "john@techcorp.com", phone: "+1 (555) 123-4567", status: "active", totalProjects: 12, revenue: 245000 },
    { id: "2", name: "Emily Chen", company: "Finance Plus", industry: "Finance", email: "emily@financeplus.com", phone: "+1 (555) 234-5678", status: "active", totalProjects: 8, revenue: 189000 },
    { id: "3", name: "Mike Wilson", company: "Healthcare Inc", industry: "Healthcare", email: "mike@healthcareinc.com", phone: "+1 (555) 345-6789", status: "active", totalProjects: 15, revenue: 312000 },
    { id: "4", name: "Sarah Johnson", company: "Retail Solutions", industry: "Retail", email: "sarah@retailsolutions.com", phone: "+1 (555) 456-7890", status: "prospect", totalProjects: 2, revenue: 45000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage client relationships and accounts</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {client.company}
                  </p>
                </div>
                <Badge variant={client.status === "active" ? "default" : client.status === "prospect" ? "secondary" : "outline"}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{client.industry}</p>
              
              <div className="space-y-2 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="font-semibold text-lg">{client.totalProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-lg">${(client.revenue / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/professional-services/clients/${client.id}`)}>
                  Profile
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/professional-services/projects?client=${client.id}`)}>
                  Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
