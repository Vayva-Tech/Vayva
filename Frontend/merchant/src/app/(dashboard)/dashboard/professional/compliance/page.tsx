/**
 * Professional (Legal) - Compliance & Ethics Page
 * Manage regulatory compliance, ethics checks, and conflict screening
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ComplianceItem {
  id: string;
  title: string;
  type: "conflict-check" | "ethics-screening" | "regulatory-filing" | "continuing-education" | "audit";
  description: string;
  dueDate: string;
  status: "compliant" | "pending" | "overdue" | "requires-action";
  priority: "high" | "medium" | "low";
}

export default function ProfessionalCompliancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const complianceItems: ComplianceItem[] = [
    { id: "1", title: "Annual Conflict of Interest Screening", type: "conflict-check", description: "Firm-wide conflict check for all active matters", dueDate: "2024-02-01", status: "pending", priority: "high" },
    { id: "2", title: "State Bar Annual Registration", type: "regulatory-filing", description: "Attorney licensing and registration renewal", dueDate: "2024-01-31", status: "pending", priority: "high" },
    { id: "3", title: "Client Trust Account Audit", type: "audit", description: "Quarterly trust fund reconciliation and audit", dueDate: "2024-01-28", status: "requires-action", priority: "high" },
    { id: "4", title: "Ethics CLE Requirements", type: "continuing-education", description: "Annual continuing legal education - ethics credits", dueDate: "2024-06-30", status: "compliant", priority: "medium" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compliance & Ethics</h1>
            <p className="text-muted-foreground">Manage regulatory compliance and ethics requirements</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/compliance/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Compliance Item
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, type, or status..."
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
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{complianceItems.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold">{complianceItems.filter(c => c.status === "compliant").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requires Action</p>
                <p className="text-2xl font-bold">{complianceItems.filter(c => c.status === "requires-action").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{complianceItems.filter(c => c.priority === "high").length}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium" scope="col">Title</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Description</th>
                  <th className="py-3 px-4 font-medium" scope="col">Due Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Priority</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{item.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{item.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm truncate max-w-[300px]">{item.description}</td>
                    <td className="py-3 px-4 text-sm font-medium">{item.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "secondary" : "outline"}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status === "compliant" ? "default" : item.status === "requires-action" ? "destructive" : item.status === "overdue" ? "outline" : "secondary"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/compliance/${item.id}`)}>
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
