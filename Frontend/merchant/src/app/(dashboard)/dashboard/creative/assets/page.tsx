/**
 * Creative Industry - Digital Assets Management Page
 * Manage creative files, design assets, and media library
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileImage, Search, Plus, Download, Folder } from "lucide-react";
import { useState } from "react";

interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "design" | "font" | "audio";
  project?: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  format: string;
  status: "active" | "archived";
}

export default function CreativeAssetsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const assets: Asset[] = [
    { id: "1", name: "TechCorp Logo Final.ai", type: "design", project: "Brand Identity Redesign", uploadedBy: "Alex Martinez", uploadedDate: "2024-01-20", size: "15.2 MB", format: "AI", status: "active" },
    { id: "2", name: "Website Hero Images.zip", type: "image", project: "E-commerce Website", uploadedBy: "Sarah Lee", uploadedDate: "2024-01-19", size: "45.8 MB", format: "ZIP", status: "active" },
    { id: "3", name: "Product Launch Video.mp4", type: "video", project: "Product Launch Campaign", uploadedBy: "Mike Chen", uploadedDate: "2024-01-18", size: "128.5 MB", format: "MP4", status: "active" },
    { id: "4", name: "Brand Guidelines.pdf", type: "document", project: "Brand Identity Redesign", uploadedBy: "Alex Martinez", uploadedDate: "2024-01-17", size: "8.4 MB", format: "PDF", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Digital Assets</h1>
            <p className="text-muted-foreground">Manage creative files and media library</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Bulk Download
          </Button>
          <Button onClick={() => router.push("/dashboard/creative/assets/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Asset
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
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
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <FileImage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">197.9 MB</p>
              </div>
              <Folder className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Files</p>
                <p className="text-2xl font-bold">{assets.filter(a => a.status === "active").length}</p>
              </div>
              <FileImage className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{new Set(assets.map(a => a.project)).size}</p>
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
                  <th className="py-3 px-4 font-medium" scope="col">Asset Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Type</th>
                  <th className="py-3 px-4 font-medium" scope="col">Project</th>
                  <th className="py-3 px-4 font-medium" scope="col">Uploaded By</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Size</th>
                  <th className="py-3 px-4 font-medium" scope="col">Format</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{asset.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{asset.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{asset.project || "-"}</td>
                    <td className="py-3 px-4 text-sm">{asset.uploadedBy}</td>
                    <td className="py-3 px-4 text-sm">{asset.uploadedDate}</td>
                    <td className="py-3 px-4 font-mono text-sm">{asset.size}</td>
                    <td className="py-3 px-4 font-mono text-sm">{asset.format}</td>
                    <td className="py-3 px-4">
                      <Badge variant={asset.status === "active" ? "default" : "outline"}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/assets/${asset.id}`)}>
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
