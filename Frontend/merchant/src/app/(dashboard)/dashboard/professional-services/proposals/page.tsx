/**
 * Professional Services - Proposals & Contracts Page
 * Create and manage client proposals and contracts
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Download } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  value: number;
  createdDate: string;
  status: "draft" | "sent" | "negotiation" | "accepted" | "rejected";
}

export default function ProfessionalServicesProposalsPage() {
  const router = useRouter();

  const proposals: Proposal[] = [
    { id: "1", title: "Q1 Marketing Strategy", clientName: "Tech Corp", value: 75000, createdDate: "2024-01-10", status: "sent" },
    { id: "2", title: "Annual Brand Refresh", clientName: "Finance Plus", value: 120000, createdDate: "2024-01-08", status: "negotiation" },
    { id: "3", title: "Website Development", clientName: "Healthcare Inc", value: 95000, createdDate: "2024-01-05", status: "accepted" },
    { id: "4", title: "Social Media Campaign", clientName: "Retail Solutions", value: 45000, createdDate: "2024-01-12", status: "draft" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Proposals & Contracts</h1>
            <p className="text-muted-foreground">Manage client proposals and agreements</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/proposals/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${(proposals.reduce((acc, p) => acc + p.value, 0) / 1000).toFixed(0)}K</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{proposals.filter(p => p.status === "sent").length}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{proposals.filter(p => p.status === "accepted").length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
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
                  <th className="py-3 px-4 font-medium">Proposal</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Value</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{proposal.title}</td>
                    <td className="py-3 px-4">{proposal.clientName}</td>
                    <td className="py-3 px-4 font-bold">${proposal.value.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{proposal.createdDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={proposal.status === "accepted" ? "default" : proposal.status === "rejected" ? "destructive" : proposal.status === "draft" ? "outline" : "secondary"}>
                        {proposal.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/proposals/${proposal.id}`)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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
  );
}
