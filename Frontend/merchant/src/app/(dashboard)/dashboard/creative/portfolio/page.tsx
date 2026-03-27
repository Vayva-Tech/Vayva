/**
 * Creative Industry - Portfolio Management Page
 * Showcase creative work, case studies, and project highlights
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image, Search, Plus, Star, Eye } from "lucide-react";
import { useState } from "react";

interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: "branding" | "web-design" | "marketing" | "photography" | "video" | "illustration";
  description: string;
  thumbnailUrl: string;
  createdDate: string;
  views: number;
  featured: boolean;
  status: "published" | "draft" | "archived";
}

export default function CreativePortfolioPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const portfolio: PortfolioItem[] = [
    { id: "1", title: "TechCorp Brand Redesign", client: "Tech Corp", category: "branding", description: "Complete brand identity overhaul including logo, colors, and guidelines", thumbnailUrl: "/portfolio/techcorp.jpg", createdDate: "2024-01-15", views: 1247, featured: true, status: "published" },
    { id: "2", title: "E-commerce Website Design", client: "Fashion Boutique", category: "web-design", description: "Modern Shopify store with custom theme development", thumbnailUrl: "/portfolio/ecommerce.jpg", createdDate: "2024-01-10", views: 892, featured: true, status: "published" },
    { id: "3", title: "Product Launch Campaign", client: "StartupXYZ", category: "marketing", description: "Multi-channel marketing campaign for new product launch", thumbnailUrl: "/portfolio/campaign.jpg", createdDate: "2024-01-05", views: 654, featured: false, status: "published" },
    { id: "4", title: "Corporate Headshots", client: "Law Firm Partners", category: "photography", description: "Professional headshot session for 20+ attorneys", thumbnailUrl: "/portfolio/headshots.jpg", createdDate: "2023-12-20", views: 423, featured: false, status: "published" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Showcase your creative work</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/creative/portfolio/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search portfolio..."
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
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{portfolio.length}</p>
              </div>
              <Image className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured Work</p>
                <p className="text-2xl font-bold">{portfolio.filter(p => p.featured).length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{portfolio.reduce((acc, p) => acc + p.views, 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{portfolio.filter(p => p.status === "published").length}</p>
              </div>
              <Image className="h-8 w-8 text-green-600" />
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
                  <th className="py-3 px-4 font-medium">Project Title</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Views</th>
                  <th className="py-3 px-4 font-medium">Featured</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{item.title}</td>
                    <td className="py-3 px-4">{item.client}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{item.category.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{item.description}</td>
                    <td className="py-3 px-4 font-bold">{item.views.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {item.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" /> Featured</Badge>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status === "published" ? "default" : item.status === "draft" ? "secondary" : "outline"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/portfolio/${item.id}`)}>
                        Edit
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
