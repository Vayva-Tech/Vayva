"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input, Select } from "@vayva/ui";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { logger } from "@vayva/shared";
import { Member, Invite, CustomRole, TeamResponse } from "@/types/settings";
import { apiJson } from "@/lib/api-client-shared";
import { Users, UserPlus, ShieldCheck, Envelope, Trash } from "@phosphor-icons/react";

export default function TeamSettingsPage() {
  useAuth();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  const [removing, setRemoving] = useState(false);

  // Auto-open invite modal when ?invite=true is in the URL
  useEffect(() => {
    if (searchParams?.get("invite") === "true") {
      setShowInviteModal(true);
    }
  }, [searchParams]);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const phone = formData.get("phone") as string;

    try {
      await apiJson("/api/merchant/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, phone: phone || undefined }),
      });
      toast.success("Invite sent successfully!");
      setShowInviteModal(false);
      void fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[INVITE_ERROR]", { error: errMsg, app: "merchant" });
      toast.error("Failed to send invite. Please try again.");
    }
  };

  const handleRemove = async (userId: string) => {
    setRemoving(true);
    try {
      await apiJson("/api/merchant/team/member/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      toast.success("Team member removed.");
      void fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[REMOVE_MEMBER_ERROR]", { error: errMsg, app: "merchant" });
      toast.error("Failed to remove member.");
    } finally {
      setRemoving(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiJson<TeamResponse>("/api/merchant/team");
      if (data) {
        setMembers(data.members || []);
        setInvites(data.invites || []);
      }

      // Fetch custom roles
      const rolesData = await apiJson<CustomRole[]>("/api/settings/roles");
      if (rolesData) {
        setCustomRoles(rolesData);
      }
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        (err as {status?: number}).status === 403
      ) {
        logger.warn("[TEAM_FETCH_FORBIDDEN]", { app: "merchant" });
      } else {
        logger.error("[TEAM_FETCH_ERROR]", { error: _errMsg, app: "merchant" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // Calculate metrics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingInvites = invites.length;
  const admins = members.filter(m => m.role === 'admin').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-4 text-sm text-gray-500">Loading team...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and permissions</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 h-10 rounded-xl font-semibold">
          <UserPlus size={18} className="mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Users size={18} />}
          label="Total Members"
          value={String(totalMembers)}
          trend={`${activeMembers} active`}
          positive
        />
        <SummaryWidget
          icon={<Envelope size={18} />}
          label="Pending Invites"
          value={String(pendingInvites)}
          trend="awaiting response"
          positive={pendingInvites === 0}
        />
        <SummaryWidget
          icon={<ShieldCheck size={18} />}
          label="Admins"
          value={String(admins)}
          trend="full access"
          positive
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Staff"
          value={String(totalMembers - admins)}
          trend="team members"
          positive
        />
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {members.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No team members yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Invite your first team member to start collaborating.
            </p>
            <Button onClick={() => setShowInviteModal(true)} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
              <UserPlus size={18} className="mr-2" />
              Invite Member
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active'
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setConfirmRemove({ open: true, userId: member.id })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal Overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input id="invite-email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <Select
                  id="invite-role"
                  name="role"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="support">Support</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admin</option>
                  {customRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="invite-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone (Optional)
                </label>
                <Input id="invite-phone"
                  name="phone"
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="+1234567890"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-500 font-medium text-sm hover:text-black"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600"
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={confirmRemove.open}
        onClose={() => setConfirmRemove({ open: false, userId: null })}
        onConfirm={() => {
          if (!confirmRemove.userId) return;
          const userId = confirmRemove.userId;
          setConfirmRemove({ open: false, userId: null });
          void handleRemove(userId);
        }}
        title="Remove team member?"
        message="This user will lose access to this store."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
