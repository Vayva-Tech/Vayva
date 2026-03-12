"use client";

import React, { useState, useEffect } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, EmptyState, Icon, Input, Select } from "@vayva/ui";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { logger } from "@vayva/shared";
import { Member, Invite, CustomRole, TeamResponse } from "@/types/settings";
import { apiJson } from "@/lib/api-client-shared";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

export default function TeamSettingsPage() {
  useAuth();
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email");
    const role = formData.get("role");
    const phone = formData.get("phone");

    try {
      await apiJson<{ success: boolean }>("/api/merchant/team/invite", {
        method: "POST",
        body: JSON.stringify({ email, role, phone }),
      });
      toast.success("Invite sent");
      setShowInviteModal(false);
      void fetchData();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[INVITE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to send invite");
    }
  };

  const handleRemove = async (userId: string) => {
    setRemoving(true);
    try {
      await apiJson<{ success: boolean }>("/api/merchant/team/member/remove", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      toast.success("Member removed");
      void fetchData();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[REMOVE_MEMBER_ERROR]", {
        error: _errMsg,
        userId,
        app: "merchant",
      });
      toast.error("Failed to remove member");
    } finally {
      setRemoving(false);
      setConfirmRemove({ open: false, userId: null });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/team/member/update-role",
        {
          method: "POST",
          body: JSON.stringify({ userId, role: newRole }),
        },
      );
      toast.success("Role updated");
      void fetchData();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[UPDATE_ROLE_ERROR]", {
        error: _errMsg,
        userId,
        role: newRole,
        app: "merchant",
      });
      toast.error("Failed to update role");
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await apiJson<{ success: boolean }>("/api/merchant/team/invite/revoke", {
        method: "POST",
        body: JSON.stringify({ inviteId }),
      });

      toast.success("Invite revoked");
      void fetchData();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[REVOKE_INVITE_ERROR]", {
        error: _errMsg,
        inviteId,
        app: "merchant",
      });
      toast.error("Failed to revoke invite");
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Breadcrumbs />
        <div className="flex items-center gap-4 mb-6">
          <BackButton
            href="/dashboard/settings/overview"
            label="Back to Settings"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Team
            </h1>
            <p className="text-slate-500">
              Manage team members and invites.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 bg-border/20 rounded-lg w-24 animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-border/20 rounded animate-pulse" />
                <div className="h-4 w-48 bg-border/20 rounded mt-1 animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-32 bg-border/20 rounded-lg animate-pulse" />
          </div>
          <PageSkeleton variant="table" rows={4} />
        </div>
        <PageSkeleton variant="table" rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton
            href="/dashboard/settings/overview"
            label="Back to Settings"
          />
          <div>
            <h1 className="text-2xl font-bold text-black">Team Members</h1>
            <p className="text-text-tertiary">
              Manage who has access to your store
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-text-primary transition"
        >
          Invite Member
        </Button>
      </div>

      {/* Stats / Usage */}
      <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Icon name={"Users"} size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Seat Usage</p>
            <p className="text-xs text-text-tertiary">
              {members.length + invites.length} active seats
            </p>
          </div>
        </div>
        <div className="text-xs text-text-tertiary">
          Plan Limit depends on Plan
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-background/70 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-background/30 text-text-tertiary font-medium border-b border-border/40">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-black">{m.name}</div>
                  <div className="text-xs text-text-tertiary">{m.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    aria-label="Select Role"
                    value={m.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleRoleChange(m.id, e.target?.value)
                    }
                    disabled={m.role === "owner"} // Owner checks on server too
                    className="bg-background/30 border-none rounded text-xs py-1 px-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                    <option value="support">Support</option>
                    <option value="viewer">Viewer</option>
                    {customRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                    {m.role === "owner" && <option value="owner">Owner</option>}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {m.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm" // using size prop if available or class override
                      onClick={() =>
                        setConfirmRemove({ open: true, userId: m.id })
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-medium h-auto px-2 py-1"
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {invites.map((i) => (
              <tr key={i.id} className="bg-background/30">
                <td className="px-4 py-3">
                  <div className="text-text-tertiary italic">{i.email}</div>
                  <div className="text-[10px] text-orange-500 font-medium">
                    Pending Invite
                  </div>
                </td>
                <td className="px-4 py-3 text-text-tertiary text-xs capitalize">
                  {i.role}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase">
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(i.id)}
                    className="text-text-tertiary hover:text-red-500 text-xs h-auto px-2 py-1"
                  >
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && invites.length === 0 && (
          <div className="p-8">
            <EmptyState
              title="No team members"
              icon="Users"
              description="Invite your colleagues to help manage your store."
              action={
                <Button onClick={() => setShowInviteModal(true)}>
                  Invite Member
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* Invite Modal Overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background/70 backdrop-blur-xl rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Email
                </label>
                <Input id="invite-email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-role"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Role
                </label>
                <Select
                  id="invite-role"
                  name="role"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
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
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Phone (Optional)
                </label>
                <Input id="invite-phone"
                  name="phone"
                  type="tel"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="+1234567890"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInviteModal(false)}
                  className="text-text-tertiary font-medium text-sm hover:text-black"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-text-primary"
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
