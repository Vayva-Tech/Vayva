/**
 * Professional Services - Team Management Page
 * Manage team members, roles, and capacity planning
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Mail, Briefcase } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  utilization: number;
  activeProjects: number;
  status: "active" | "on-leave" | "overallocated";
}

export default function ProfessionalServicesTeamPage() {
  const router = useRouter();

  const team: TeamMember[] = [
    { id: "1", name: "Alex Thompson", role: "Senior Designer", department: "Design", email: "alex.t@company.com", utilization: 85, activeProjects: 4, status: "active" },
    { id: "2", name: "Maria Garcia", role: "Project Manager", department: "Operations", email: "maria.g@company.com", utilization: 95, activeProjects: 6, status: "overallocated" },
    { id: "3", name: "James Lee", role: "Developer", department: "Engineering", email: "james.l@company.com", utilization: 70, activeProjects: 3, status: "active" },
    { id: "4", name: "Sophie Brown", role: "Marketing Specialist", department: "Marketing", email: "sophie.b@company.com", utilization: 0, activeProjects: 0, status: "on-leave" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/professional-services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Team</h1>
            <p className="text-muted-foreground">Manage team members and capacity</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/professional-services/team/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{team.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{team.filter(t => t.status === "active").length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold">{Math.round(team.reduce((acc, t) => acc + t.utilization, 0) / team.filter(t => t.status !== "on-leave").length)}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overallocated</p>
                <p className="text-2xl font-bold">{team.filter(t => t.status === "overallocated").length}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {member.role}
                  </p>
                </div>
                <Badge variant={member.status === "active" ? "default" : member.status === "overallocated" ? "destructive" : "secondary"}>
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{member.department}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="truncate">{member.email}</span>
              </div>

              <div className="pt-3 border-t space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-medium">{member.utilization}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${member.utilization >= 90 ? 'bg-red-500' : member.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${member.utilization}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Active Projects:</span>
                  <span className="font-medium">{member.activeProjects}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/professional-services/team/${member.id}`)}>
                  Profile
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/professional-services/team/${member.id}/schedule`)}>
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
