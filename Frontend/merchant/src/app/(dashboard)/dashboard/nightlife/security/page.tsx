/**
 * Nightlife - Security Management Page
 * Manage security staff, incident reports, and safety protocols
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Search, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface SecurityIncident {
  id: string;
  title: string;
  type: "altercation" | "medical" | "intoxicated" | "theft" | "property-damage" | "other";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  dateTime: string;
  reportedBy: string;
  status: "open" | "investigating" | "resolved";
}

export default function NightlifeSecurityPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const incidents: SecurityIncident[] = [
    { id: "1", title: "Verbal altercation at bar", type: "altercation", severity: "medium", location: "Main Bar Area", dateTime: "2024-01-25 23:45", reportedBy: "Marcus Johnson", status: "resolved" },
    { id: "2", title: "Medical emergency - Table 15", type: "medical", severity: "high", location: "VIP Section", dateTime: "2024-01-26 01:30", reportedBy: "Sarah Chen", status: "resolved" },
    { id: "3", title: "Intoxicated patron", type: "intoxicated", severity: "low", location: "Dance Floor", dateTime: "2024-01-26 02:15", reportedBy: "Mike Torres", status: "investigating" },
    { id: "4", title: "Damaged property - restroom", type: "property-damage", severity: "medium", location: "Men's Restroom", dateTime: "2024-01-26 00:30", reportedBy: "Alex Martinez", status: "open" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Security</h1>
            <p className="text-muted-foreground">Manage security incidents and safety</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/security/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
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
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold">{incidents.filter(i => i.status === "open").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold">{incidents.filter(i => i.severity === "high" || i.severity === "critical").length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{incidents.filter(i => i.status === "resolved").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                  <th className="py-3 px-4 font-medium">Incident</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Location</th>
                  <th className="py-3 px-4 font-medium">Date/Time</th>
                  <th className="py-3 px-4 font-medium">Reported By</th>
                  <th className="py-3 px-4 font-medium">Severity</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{incident.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{incident.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{incident.location}</td>
                    <td className="py-3 px-4 text-sm">{new Date(incident.dateTime).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{incident.reportedBy}</td>
                    <td className="py-3 px-4">
                      <Badge variant={incident.severity === "critical" ? "destructive" : incident.severity === "high" ? "secondary" : incident.severity === "medium" ? "default" : "outline"}>
                        {incident.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={incident.status === "resolved" ? "default" : incident.status === "investigating" ? "secondary" : "outline"}>
                        {incident.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/security/${incident.id}`)}>
                        Details
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
