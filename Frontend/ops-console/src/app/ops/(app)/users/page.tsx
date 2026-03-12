"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, UserPlus, Trash as Trash2, Shield, Envelope as Mail, CheckCircle, X, Spinner as Loader2, Copy, Warning as AlertTriangle, MagnifyingGlass as Search } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";

interface OpsUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

const ROLE_OPTIONS = ["OPS_ADMIN", "OPS_SUPPORT", "OPERATOR"] as const;
type RoleOption = (typeof ROLE_OPTIONS)[number];

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creds: { email: string; tempPass: string }) => void;
}

const isOpsUser = (value: unknown): value is OpsUser => {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    typeof user.isActive === "boolean" &&
    typeof user.lastLoginAt === "string" &&
    typeof user.createdAt === "string"
  );
};

export default function UsersPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newUserCreds, setNewUserCreds] = useState<{
    email: string;
    tempPass: string;
  } | null>(null);

  const [searchInput, setSearchInput] = useState(q);
  const [advancedSearch, setAdvancedSearch] = useState(q);

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    router.push(`?${params.toString()}`);
  };

  // User List Query
  const { data: users, isLoading } = useOpsQuery<OpsUser[]>(
    ["ops-users", q],
    async () => {
      const res = await fetch(`/api/ops/users${q ? `?q=${q}` : ""}`);
      if (res.status === 401) { window.location.href = "/ops/login"; return []; }
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      return Array.isArray(json) ? json.filter(isOpsUser) : [];
    },
  );

  return (
    <OpsPageShell
      title="Team Management"
      description="Manage access to the Ops Console"
      headerActions={
        <div className="flex items-center gap-4">
          <AdvancedSearchInput
            value={advancedSearch}
            onChange={setAdvancedSearch}
            onSearch={handleAdvancedSearch}
            placeholder="Search team (try: role:ADMIN status:active)"
            className="w-80"
          />
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm h-auto"
            aria-label="Invite new team member"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      }
    >

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading team...
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users?.map((user: OpsUser) => (
                <UserRow
                  key={user.id}
                  user={user}
                  refresh={() =>
                    queryClient.invalidateQueries({ queryKey: ["ops-users"] })
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={(creds: { email: string; tempPass: string }) => {
          setNewUserCreds(creds);
          queryClient.invalidateQueries({ queryKey: ["ops-users"] });
        }}
      />

      <CredentialsDialog
        creds={newUserCreds}
        onClose={() => setNewUserCreds(null)}
      />
    </OpsPageShell>
  );
}

function UserRow({
  user,
  refresh,
}: {
  user: OpsUser;
  refresh: () => void;
}): React.JSX.Element {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${user.name}? This cannot be undone.`,
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/ops/users?id=${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }
      toast.success("User removed");
      refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error
          ? e instanceof Error
            ? e.message
            : String(e)
          : String(e),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (action: "TOGGLE_STATUS" | "RESET_2FA") => {
    const msg =
      action === "TOGGLE_STATUS"
        ? `Are you sure you want to ${user.isActive ? "suspend" : "activate"} ${user.name}?`
        : `Reset 2FA for ${user.name}? They will need to set it up again on next login.`;

    if (!confirm(msg)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/ops/users", {
        method: "PATCH",
        body: JSON.stringify({ userId: user.id, action }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Action failed");
      }
      toast.success("User updated");
      refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error
          ? e instanceof Error
            ? e.message
            : String(e)
          : String(e),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-white/60 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
            {user.name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              <a
                href={`/ops/users/${user.id}/activity`}
                className="hover:underline focus:outline-none"
              >
                {user.name}
              </a>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            user.role === "OPS_OWNER"
              ? "bg-purple-100 text-purple-700"
              : user.role === "OPS_ADMIN"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          <Shield className="h-3 w-3" />
          {user?.role?.replace("OPS_", "")}
        </span>
      </td>
      <td className="px-6 py-4">
        {user.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle className="h-3 w-3" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-gray-500">
        {user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString()
          : "Never"}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 items-center">
          {user.role !== "OPS_OWNER" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleUpdate("TOGGLE_STATUS")}
                disabled={deleting}
                className={`px-3 py-1 text-xs font-bold rounded border transition-colors h-auto ${
                  user.isActive
                    ? "text-red-600 bg-red-50 border-red-100 hover:bg-red-100"
                    : "text-green-600 bg-green-50 border-green-100 hover:bg-green-100"
                }`}
                aria-label={
                  user.isActive
                    ? `Suspend ${user.name}`
                    : `Activate ${user.name}`
                }
              >
                {user.isActive ? "Suspend" : "Activate"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUpdate("RESET_2FA")}
                disabled={deleting}
                className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded h-auto"
                aria-label={`Reset 2FA for ${user.name}`}
              >
                Reset 2FA
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors h-8 w-8"
                aria-label={`Remove user ${user.name}`}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function InviteUserModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteUserModalProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<RoleOption>("OPS_SUPPORT");

  if (!isOpen) return <></>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role: String(formData.get("role") || ""),
    };

    try {
      const res = await fetch("/api/ops/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      toast.success("Invitation sent");
      onSuccess({ email: json.user?.email, tempPass: json.tempPassword });
      onClose();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error
          ? e instanceof Error
            ? e.message
            : String(e)
          : String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Invite New Member</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 h-8 w-8"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Alice Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="alice@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((r: RoleOption) => (
                <Button
                  key={r}
                  type="button"
                  variant="ghost"
                  onClick={() => setRole(r)}
                  className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all h-auto hover:bg-transparent ${
                    role === r
                      ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  aria-label={`Select role: ${r.replace("OPS_", "")}`}
                >
                  {r.replace("OPS_", "")}
                </Button>
              ))}
            </div>
            <input type="hidden" name="role" value={role} />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-70 h-auto"
              aria-label="PaperPlane as Send invitation email"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              PaperPlane as Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CredentialsDialog({
  creds,
  onClose,
}: {
  creds: { email: string; tempPass: string } | null;
  onClose: () => void;
}): React.JSX.Element {
  if (!creds) return <></>;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">User Created</h3>
        <p className="text-sm text-gray-500 mb-6">
          Share these temporary credentials with the user securely. They will
          not be shown again.
        </p>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-6 relative group">
          <div className="text-xs text-gray-500 uppercase font-bold mb-1">
            Email
          </div>
          <div className="font-mono text-gray-900 mb-3 select-all">
            {creds.email}
          </div>

          <div className="text-xs text-gray-500 uppercase font-bold mb-1">
            Temporary Password
          </div>
          <div className="font-mono text-indigo-600 font-bold text-lg select-all">
            {creds.tempPass}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold h-auto"
          aria-label="Close credentials dialog"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
