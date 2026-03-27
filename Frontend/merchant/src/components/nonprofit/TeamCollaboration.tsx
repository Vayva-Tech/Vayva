"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Shield, Edit, Trash2, Plus, Activity, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: PermissionSet;
  status: "active" | "inactive" | "pending";
  lastActive?: string;
  invitedAt: string;
}

type Role = "admin" | "manager" | "volunteer_coordinator" | "fundraiser" | "viewer";

interface PermissionSet {
  canManageGrants: boolean;
  canManageDonations: boolean;
  canManageDonors: boolean;
  canManageCampaigns: boolean;
  canManageVolunteers: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageTeam: boolean;
  canSendEmails: boolean;
  canManageSettings: boolean;
}

const defaultPermissions: Record<Role, PermissionSet> = {
  admin: {
    canManageGrants: true,
    canManageDonations: true,
    canManageDonors: true,
    canManageCampaigns: true,
    canManageVolunteers: true,
    canViewReports: true,
    canExportData: true,
    canManageTeam: true,
    canSendEmails: true,
    canManageSettings: true,
  },
  manager: {
    canManageGrants: true,
    canManageDonations: true,
    canManageDonors: true,
    canManageCampaigns: true,
    canManageVolunteers: false,
    canViewReports: true,
    canExportData: true,
    canManageTeam: false,
    canSendEmails: true,
    canManageSettings: false,
  },
  volunteer_coordinator: {
    canManageGrants: false,
    canManageDonations: false,
    canManageDonors: false,
    canManageCampaigns: false,
    canManageVolunteers: true,
    canViewReports: true,
    canExportData: false,
    canManageTeam: false,
    canSendEmails: true,
    canManageSettings: false,
  },
  fundraiser: {
    canManageGrants: false,
    canManageDonations: true,
    canManageDonors: true,
    canManageCampaigns: true,
    canManageVolunteers: false,
    canViewReports: true,
    canExportData: false,
    canManageTeam: false,
    canSendEmails: true,
    canManageSettings: false,
  },
  viewer: {
    canManageGrants: false,
    canManageDonations: false,
    canManageDonors: false,
    canManageCampaigns: false,
    canManageVolunteers: false,
    canViewReports: true,
    canExportData: false,
    canManageTeam: false,
    canSendEmails: false,
    canManageSettings: false,
  },
};

const roleColors: Record<Role, string> = {
  admin: "bg-purple-500",
  manager: "bg-blue-500",
  volunteer_coordinator: "bg-green-500",
  fundraiser: "bg-orange-500",
  viewer: "bg-gray-500",
};

export function TeamCollaboration() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    fetchTeam();
    fetchActivityLog();
  }, []);

  const fetchTeam = async () => {
    try {
      // Mock data for now
      const mockTeam: TeamMember[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
          permissions: defaultPermissions.admin,
          status: "active",
          lastActive: new Date().toISOString(),
          invitedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setTeamMembers(mockTeam);
    } catch (error: unknown) {
      logger.error("[FETCH_TEAM_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      // Mock activity log
      setActivityLog([
        {
          id: "1",
          action: "Updated grant application",
          user: "John Doe",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          action: "Created new campaign",
          user: "Jane Smith",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error: unknown) {
      logger.error("[FETCH_ACTIVITY_ERROR]", { error });
    }
  };

  const handleInviteMember = async (email: string, role: Role) => {
    try {
      const newMember: TeamMember = {
        id: `new-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role,
        permissions: defaultPermissions[role],
        status: "pending",
        invitedAt: new Date().toISOString(),
      };
      setTeamMembers([...teamMembers, newMember]);
      toast.success(`Invitation sent to ${email}!`);
      setIsInviteDialogOpen(false);
    } catch (error: unknown) {
      logger.error("[INVITE_MEMBER_ERROR]", { error });
      toast.error("Failed to send invitation");
    }
  };

  const handleUpdateRole = (memberId: string, newRole: Role) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === memberId ? { ...m, role: newRole, permissions: defaultPermissions[newRole] } : m
    ));
    toast.success("Role updated successfully!");
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success("Team member removed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Collaboration</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={roleColors[member.role]}>{member.role.replace("_", " ")}</Badge>
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                              {member.status}
                            </Badge>
                            {member.lastActive && (
                              <span className="text-xs text-gray-400">
                                Last active: {formatDate(member.lastActive)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select value={member.role} onValueChange={(value) => handleUpdateRole(member.id, value as Role)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="volunteer_coordinator">Volunteer Coordinator</SelectItem>
                            <SelectItem value="fundraiser">Fundraiser</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Permission</th>
                      {Object.keys(defaultPermissions).map(role => (
                        <th key={role} className="text-center p-3 capitalize">{role.replace("_", " ")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(Object.entries(defaultPermissions.admin).reduce((acc, [key, value]) => {
                      acc[key] = Object.fromEntries(
                        Object.keys(defaultPermissions).map(role => [role, defaultPermissions[role as Role][key as keyof PermissionSet]])
                      );
                      return acc;
                    }, {} as Record<string, Record<string, boolean>>)).map(([permission, roles]) => (
                      <tr key={permission} className="border-b">
                        <td className="p-3 font-medium">{permission.replace(/([A-Z])/g, " $1").trim()}</td>
                        {Object.entries(roles).map(([role, hasPermission]) => (
                          <td key={role} className="text-center p-3">
                            {hasPermission ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-500">by {log.user}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <InviteForm onInvite={handleInviteMember} onCancel={() => setIsInviteDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface InviteFormProps {
  onInvite: (email: string, role: Role) => void;
  onCancel: () => void;
}

function InviteForm({ onInvite, onCancel }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(email, role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="volunteer_coordinator">Volunteer Coordinator</SelectItem>
            <SelectItem value="fundraiser">Fundraiser</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-2">
          Each role has predefined permissions. You can customize them later.
        </p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Send Invitation</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
