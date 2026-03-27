/**
 * Creative Industry - Projects Management Page
 * Track creative projects, timelines, and deliverables
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Briefcase, Search, Plus, Clock, Calendar } from "lucide-react";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  client: string;
  type: "branding" | "web-design" | "marketing" | "video" | "consulting";
  status: "planning" | "in-progress" | "review" | "completed" | "on-hold";
  budget: number;
  startDate: string;
  dueDate: string;
  progress: number;
}

export default function CreativeProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const projects: Project[] = [
    { id: "1", name: "Brand Identity Redesign", client: "Tech Corp", type: "branding", status: "in-progress", budget: 35000, startDate: "2024-01-05", dueDate: "2024-02-28", progress: 65 },
    { id: "2", name: "E-commerce Website", client: "Fashion Boutique", type: "web-design", status: "in-progress", budget: 25000, startDate: "2024-01-10", dueDate: "2024-03-15", progress: 45 },
    { id: "3", name: "Product Launch Campaign", client: "StartupXYZ", type: "marketing", status: "review", budget: 18000, startDate: "2024-01-15", dueDate: "2024-02-15", progress: 90 },
    { id: "4", name: "Corporate Video Production", client: "Law Firm", type: "video", status: "planning", budget: 45000, startDate: "2024-02-01", dueDate: "2024-04-30", progress: 15 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Track project progress and deliverables</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/creative/projects/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
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
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === "in-progress").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${(projects.reduce((acc, p) => acc + p.budget, 0) / 1000).toFixed(0)}K</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === "completed").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
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
                  <th className="py-3 px-4 font-medium">Project Name</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Budget</th>
                  <th className="py-3 px-4 font-medium">Timeline</th>
                  <th className="py-3 px-4 font-medium">Progress</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{project.name}</td>
                    <td className="py-3 px-4">{project.client}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{project.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold">${project.budget.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${project.progress > 75 ? 'bg-green-500' : project.progress > 50 ? 'bg-blue-500' : project.progress > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={project.status === "completed" ? "default" : project.status === "in-progress" ? "secondary" : project.status === "review" ? "outline" : "outline"}>
                        {project.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/creative/projects/${project.id}`)}>
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
