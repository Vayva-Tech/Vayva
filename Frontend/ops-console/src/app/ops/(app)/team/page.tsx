"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { 
  Users, 
  Plus, 
  Trash, 
  CheckCircle, 
  XCircle,
  Crown,
  Shield,
  Headset,
  Code,
  Cloud,
  ChartLineUp,
  CurrencyDollar,
  TrendUp,
  Eye,
  ShieldCheck,
  Gear,
  UserGear,
  MagnifyingGlass as Search,
  Copy,
  Check,
  EnvelopeSimple as Mail,
  UserPlus
} from "@phosphor-icons/react/ssr";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { ROLE_METADATA, OpsRole, getAssignableRoles } from "@/lib/roles";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

// ============================================================================
// Types
// ============================================================================

interface OpsUser {
  id: string;
  email: string;
  name: string;
  role: OpsRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: OpsRole;
  invitedBy: { name: string | null; email: string };
  createdAt: string;
  expiresAt: string;
}

// ============================================================================
// Components
// ============================================================================

function InvitationBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <Mail className="h-3 w-3" />
      Pending Invite
    </span>
  );
}

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Shield,
  UsersThree: Users,
  Gear,
  Headset,
  UserGear,
  Code,
  Cloud,
  ChartLineUp,
  CurrencyDollar,
  TrendUp,
  Eye,
  ShieldCheck,
  Question: CheckCircle,
};

function RoleBadge({ role }: { role: OpsRole }) {
  const meta = ROLE_METADATA[role];
  const Icon = ROLE_ICONS[meta.icon] || CheckCircle;
  
  const categoryColors: Record<string, string> = {
    leadership: "bg-purple-100 text-purple-700 border-purple-200",
    operations: "bg-blue-100 text-blue-700 border-blue-200",
    technical: "bg-green-100 text-green-700 border-green-200",
    support: "bg-yellow-100 text-yellow-700 border-yellow-200",
    external: "bg-gray-100 text-gray-700 border-gray-200",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[meta.category]}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      <XCircle className="h-3 w-3" />
      Inactive
    </span>
  );
}

function InviteModal({
  isOpen,
  onClose,
  currentUserRole,
  onInvite,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: OpsRole;
  onInvite: (data: { email: string; name: string; role: OpsRole }) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<OpsRole>("OPERATOR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignableRoles = getAssignableRoles(currentUserRole);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onInvite({ email, name, role });
      setEmail("");
      setName("");
      setRole("OPERATOR");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-indigo-600" />
          Invite Team Member
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: any) => setName(e.target?.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target?.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target?.value as OpsRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {assignableRoles.map((r: OpsRole) => (
                <option key={r} value={r}>
                  {ROLE_METADATA[r].label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {ROLE_METADATA[role].description}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserRow({
  user,
  currentUserRole,
  onToggleStatus,
  onDelete,
}: {
  user: OpsUser;
  currentUserRole: OpsRole;
  onToggleStatus: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {navigator?.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canManageUser = ROLE_METADATA[currentUserRole].level > ROLE_METADATA[user.role].level;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-4">
        <StatusBadge isActive={user.isActive} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {user.lastLoginAt 
          ? new Date(user.lastLoginAt).toLocaleDateString()
          : "Never"
        }
      </td>
      <td className="px-6 py-4">
        {canManageUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStatus(user.id)}
              className={`p-2 rounded-lg ${user.isActive 
                ? "text-yellow-600 hover:bg-yellow-50" 
                : "text-green-600 hover:bg-green-50"
              }`}
              title={user.isActive ? "Deactivate" : "Activate"}
            >
              {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function TeamManagementPage(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const currentUserRole = (currentUser?.role || "OPERATOR") as OpsRole;
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const canInvite = ROLE_METADATA[currentUserRole].level >= 90; // Owner/Admin only

  const { data: users, isLoading, refetch } = useOpsQuery<OpsUser[]>(
    ["ops-team-members"],
    () => fetch("/api/ops/users").then((res: any) => res.json()),
    {
      enabled: !!currentUser,
    }
  );

  // Fetch pending invitations
  const { data: invitationsData, isLoading: invitationsLoading, refetch: refetchInvitations } = useOpsQuery<{ invitations: PendingInvitation[] }>(
    ["ops-invitations"],
    () => fetch("/api/ops/invitations").then((res: any) => res.json()),
    {
      enabled: !!currentUser && canInvite,
    }
  );

  const handleInvite = async (data: { email: string; name: string; role: OpsRole }) => {
    const res = await fetch("/api/ops/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to send invitation");
    }

    const result = await res.json();
    toast.success("Invitation sent", {
      description: `Invitation sent to ${data.email}. Expires in 24 hours.`,
    });
    refetchInvitations();
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    const res = await fetch(`/api/ops/invitations?id=${invitationId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to cancel invitation");
      return;
    }

    toast.success("Invitation cancelled");
    refetchInvitations();
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await fetch("/api/ops/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "TOGGLE_STATUS" }),
    });

    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated");
    refetch();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/api/ops/users?id=${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete user");
      return;
    }

    toast.success("User deleted");
    refetch();
  };

  const filteredUsers = users?.filter((user: any) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <OpsPageShell
      title="Team Management"
      description="Manage your ops team members and their roles"
      headerActions={
        canInvite && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        )
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target?.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Pending Invitations */}
        {canInvite && invitationsData?.invitations && invitationsData.invitations?.length > 0 && (
          <div className="bg-yellow-50 rounded-2xl border border-yellow-200 overflow-hidden">
            <div className="px-6 py-4 bg-yellow-100/50 border-b border-yellow-200">
              <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Pending Invitations ({invitationsData?.invitations?.length})
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-yellow-100/30">
                <tr>
                  <th className="px-6 py-2 text-xs font-medium text-yellow-800">Email</th>
                  <th className="px-6 py-2 text-xs font-medium text-yellow-800">Role</th>
                  <th className="px-6 py-2 text-xs font-medium text-yellow-800">Invited By</th>
                  <th className="px-6 py-2 text-xs font-medium text-yellow-800">Expires</th>
                  <th className="px-6 py-2 text-xs font-medium text-yellow-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100">
                {invitationsData?.invitations?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-yellow-100/30">
                    <td className="px-6 py-3 text-sm text-yellow-900">{inv.email}</td>
                    <td className="px-6 py-3">
                      <RoleBadge role={inv.role} />
                    </td>
                    <td className="px-6 py-3 text-sm text-yellow-700">
                      {inv?.invitedBy?.name || inv.invitedBy?.email}
                    </td>
                    <td className="px-6 py-3 text-sm text-yellow-700">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleCancelInvitation(inv.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-900">Last Login</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading team members...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? "No users match your search" : "No team members found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUserRole={currentUserRole}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Role Legend */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Role Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-600">Leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Operations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Technical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">Support</span>
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        currentUserRole={currentUserRole}
        onInvite={handleInvite}
      />
    </OpsPageShell>
  );
}
