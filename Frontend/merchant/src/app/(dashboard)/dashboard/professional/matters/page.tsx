/**
 * Professional (Legal) - Matters Management Page
 * Manage legal matters, cases, and client representations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Briefcase, Search, Plus, Scale } from "lucide-react";
import { useState } from "react";

interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  clientName: string;
  practiceArea: string;
  status: "active" | "pending" | "closed" | "archived";
  openedDate: string;
  assignedAttorney: string;
  estimatedValue: number;
}

export default function ProfessionalMattersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const matters: Matter[] = [
    { id: "1", matterNumber: "MAT-2024-001", title: "Corporate Merger - TechCorp Acquisition", clientName: "Tech Corp", practiceArea: "Corporate Law", status: "active", openedDate: "2024-01-05", assignedAttorney: "Alex Thompson", estimatedValue: 125000 },
    { id: "2", matterNumber: "MAT-2024-002", title: "Employment Dispute Resolution", clientName: "Finance Plus", practiceArea: "Employment Law", status: "active", openedDate: "2024-01-10", assignedAttorney: "Maria Garcia", estimatedValue: 45000 },
    { id: "3", matterNumber: "MAT-2023-089", title: "Intellectual Property Patent Filing", clientName: "Healthcare Inc", practiceArea: "IP Law", status: "pending", openedDate: "2023-12-15", assignedAttorney: "James Lee", estimatedValue: 75000 },
    { id: "4", matterNumber: "MAT-2023-067", title: "Real Estate Transaction - Commercial", clientName: "Retail Solutions", practiceArea: "Real Estate", status: "closed", openedDate: "2023-11-01", assignedAttorney: "Sarah Johnson", estimatedValue: 95000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Matters</h1>
            <p className="text-muted-foreground">Manage legal matters and cases</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional/matters/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Matter
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by matter number, title, or client..."
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
                <p className="text-sm text-muted-foreground">Active Matters</p>
                <p className="text-2xl font-bold">{matters.filter(m => m.status === "active").length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{matters.filter(m => m.status === "pending").length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${(matters.reduce((acc, m) => acc + m.estimatedValue, 0) / 1000).toFixed(0)}K</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed (YTD)</p>
                <p className="text-2xl font-bold">{matters.filter(m => m.status === "closed").length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
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
                  <th className="py-3 px-4 font-medium">Matter #</th>
                  <th className="py-3 px-4 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Practice Area</th>
                  <th className="py-3 px-4 font-medium">Attorney</th>
                  <th className="py-3 px-4 font-medium">Value</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {matters.map((matter) => (
                  <tr key={matter.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono font-medium">{matter.matterNumber}</td>
                    <td className="py-3 px-4 font-semibold">{matter.title}</td>
                    <td className="py-3 px-4">{matter.clientName}</td>
                    <td className="py-3 px-4 text-sm">{matter.practiceArea}</td>
                    <td className="py-3 px-4 text-sm">{matter.assignedAttorney}</td>
                    <td className="py-3 px-4 font-bold">${matter.estimatedValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={matter.status === "closed" ? "default" : matter.status === "pending" ? "secondary" : "outline"}>
                        {matter.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/matters/${matter.id}`)}>
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
