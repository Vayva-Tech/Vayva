/**
 * Professional Services - Documents & Files Page
 * Manage project documents, contracts, and client files
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Upload, Download, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  name: string;
  type: "contract" | "proposal" | "report" | "presentation" | "other";
  clientName: string;
  projectName: string;
  uploadedDate: string;
  size: string;
  status: "active" | "archived" | "draft";
}

export default function ProfessionalServicesDocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const documents: Document[] = [
    { id: "1", name: "Service Agreement Q1 2024", type: "contract", clientName: "Tech Corp", projectName: "Website Redesign", uploadedDate: "2024-01-05", size: "2.4 MB", status: "active" },
    { id: "2", name: "Brand Strategy Proposal", type: "proposal", clientName: "Finance Plus", projectName: "Brand Strategy", uploadedDate: "2024-01-08", size: "5.1 MB", status: "active" },
    { id: "3", name: "Marketing Campaign Report", type: "report", clientName: "Healthcare Inc", projectName: "Marketing Campaign", uploadedDate: "2024-01-12", size: "3.8 MB", status: "active" },
    { id: "4", name: "Client Presentation Deck", type: "presentation", clientName: "Retail Solutions", projectName: "SEO Optimization", uploadedDate: "2024-01-10", size: "8.2 MB", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Documents & Files</h1>
            <p className="text-muted-foreground">Manage project documents and client files</p>
          </div>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name, client, or project..."
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
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{documents.filter(d => d.status === "active").length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contracts</p>
                <p className="text-2xl font-bold">{documents.filter(d => d.type === "contract").length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proposals</p>
                <p className="text-2xl font-bold">{documents.filter(d => d.type === "proposal").length}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium">Document Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">Uploaded</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{doc.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{doc.type}</Badge>
                    </td>
                    <td className="py-3 px-4">{doc.clientName}</td>
                    <td className="py-3 px-4 text-sm">{doc.projectName}</td>
                    <td className="py-3 px-4 text-sm">{doc.uploadedDate}</td>
                    <td className="py-3 px-4 text-sm font-mono">{doc.size}</td>
                    <td className="py-3 px-4">
                      <Badge variant={doc.status === "active" ? "default" : doc.status === "archived" ? "secondary" : "outline"}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/documents/${doc.id}`)}>
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
