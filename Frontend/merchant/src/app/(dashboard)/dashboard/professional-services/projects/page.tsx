/**
 * Professional Services - Projects Management Page
 * Manage client projects, timelines, and deliverables
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FolderKanban, Plus, Calendar, Users } from "lucide-react";

interface Project {
  id: string;
  name: string;
  clientName: string;
  status: "planning" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  dueDate: string;
  budget: number;
  teamSize: number;
  progress: number;
}

export default function ProfessionalServicesProjectsPage() {
  const router = useRouter();

  const projects: Project[] = [
    { id: "1", name: "Website Redesign", clientName: "Tech Corp", status: "in-progress", priority: "high", startDate: "2024-01-05", dueDate: "2024-03-15", budget: 45000, teamSize: 5, progress: 65 },
    { id: "2", name: "Brand Strategy", clientName: "Finance Plus", status: "planning", priority: "medium", startDate: "2024-01-20", dueDate: "2024-04-20", budget: 32000, teamSize: 3, progress: 15 },
    { id: "3", name: "Marketing Campaign", clientName: "Healthcare Inc", status: "in-progress", priority: "urgent", startDate: "2024-01-10", dueDate: "2024-02-28", budget: 58000, teamSize: 7, progress: 78 },
    { id: "4", name: "SEO Optimization", clientName: "Retail Solutions", status: "review", priority: "high", startDate: "2023-12-01", dueDate: "2024-01-31", budget: 28000, teamSize: 4, progress: 95 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage client projects and deliverables</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/projects/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-600" />
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
              <FolderKanban className="h-8 w-8 text-yellow-600" />
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
              <FolderKanban className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{projects.reduce((acc, p) => acc + p.teamSize, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={project.priority === "urgent" ? "destructive" : project.priority === "high" ? "secondary" : "outline"}>
                      {project.priority}
                    </Badge>
                    <Badge variant={project.status === "completed" ? "default" : project.status === "in-progress" ? "secondary" : "outline"}>
                      {project.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Due: {project.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="ml-2 font-medium">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{project.teamSize} members</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${project.progress >= 75 ? 'bg-green-500' : project.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/professional-services/projects/${project.id}`)}>
                    View Details
                  </Button>
                  <Button size="sm" onClick={() => router.push(`/dashboard/professional-services/projects/${project.id}/team`)}>
                    Manage Team
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
