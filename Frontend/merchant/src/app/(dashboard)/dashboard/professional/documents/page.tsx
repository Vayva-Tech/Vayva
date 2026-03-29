/**
 * Professional (Legal) - Legal Documents Page
 * Manage legal documents, contracts, and case files
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, Plus, Upload, Folder } from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  name: string;
  type: "contract" | "motion" | "brief" | "discovery" | "correspondence" | "court-filing";
  matterReference: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  status: "active" | "archived" | "draft";
}

export default function ProfessionalDocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const documents: Document[] = [
    { id: "1", name: "Merger Agreement - Final Draft", type: "contract", matterReference: "MAT-2024-001", uploadedBy: "Alex Thompson", uploadedDate: "2024-01-20", size: "2.4 MB", status: "active" },
    { id: "2", name: "Motion to Dismiss", type: "motion", matterReference: "MAT-2024-002", uploadedBy: "Maria Garcia", uploadedDate: "2024-01-19", size: "856 KB", status: "active" },
    { id: "3", name: "Patent Application Specification", type: "brief", matterReference: "MAT-2023-089", uploadedBy: "James Lee", uploadedDate: "2024-01-18", size: "5.1 MB", status: "active" },
    { id: "4", name: "Document Request - Discovery", type: "discovery", matterReference: "MAT-2023-067", uploadedBy: "Sarah Johnson", uploadedDate: "2024-01-17", size: "1.2 MB", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Legal Documents</h1>
            <p className="text-muted-foreground">Manage legal documents and case files</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button onClick={() => router.push("/dashboard/professional/documents/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name, matter, or type..."
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
                <p className="text-sm text-muted-foreground">Active Files</p>
                <p className="text-2xl font-bold">{documents.filter(d => d.status === "active").length}</p>
              </div>
              <Folder className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Court Filings</p>
                <p className="text-2xl font-bold">{documents.filter(d => d.type === "court-filing").length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">9.6 MB</p>
              </div>
              <Folder className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium" scope="col">Document Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Matter</th>
                  <th className="py-3 px-4 font-medium" scope="col">Uploaded By</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Size</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{document.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{document.type}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{document.matterReference}</td>
                    <td className="py-3 px-4 text-sm">{document.uploadedBy}</td>
                    <td className="py-3 px-4 text-sm">{document.uploadedDate}</td>
                    <td className="py-3 px-4 font-mono text-sm">{document.size}</td>
                    <td className="py-3 px-4">
                      <Badge variant={document.status === "active" ? "default" : document.status === "archived" ? "secondary" : "outline"}>
                        {document.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional/documents/${document.id}`)}>
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
