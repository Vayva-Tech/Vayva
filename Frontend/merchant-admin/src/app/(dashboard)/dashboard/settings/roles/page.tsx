"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Card, Icon, Input, Checkbox } from "@vayva/ui";
import { toast } from "sonner";
import { PERMISSION_GROUPS } from "@/lib/team/permissions";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BackButton } from "@/components/ui/BackButton";

import { apiJson } from "@/lib/api-client-shared";

interface Role {
  id: string;
  name: string;
  description: string | null;
  RolePermission: Array<{
    Permission: {
      name: string;
    };
  }>;
  _count?: {
    Membership: number;
  };
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentRole, setCurrentRole] = useState<{
    id?: string;
    name: string;
    description: string;
    permissionIds: string[];
  }>({
    name: "",
    description: "",
    permissionIds: [],
  });

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await apiJson<Role[]>("/api/settings/roles");
      setRoles(data || []);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_ROLES_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  const handleSave = async () => {
    if (!currentRole.name) return toast.error("Role name is required");

    setIsSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/settings/roles", {
        method: "POST",
        body: JSON.stringify(currentRole),
      });
      toast.success("Role saved successfully");
      setIsEditing(false);
      void fetchRoles();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SAVE_ROLE_ERROR]", {
        error: _errMsg,
        roleName: currentRole.name,
        app: "merchant",
      });
      toast.error("Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permId: string) => {
    const ids = [...currentRole.permissionIds];
    if (ids.includes(permId)) {
      setCurrentRole({
        ...currentRole,
        permissionIds: ids.filter((id) => id !== permId),
      });
    } else {
      setCurrentRole({ ...currentRole, permissionIds: [...ids, permId] });
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {currentRole.id ? "Edit Role" : "Create Custom Role"}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Role"}
            </Button>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold">Role Name</label>
            <Input
              placeholder="e.g. Content Manager"
              value={currentRole.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentRole({ ...currentRole, name: e.target?.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold">Description</label>
            <Input
              placeholder="Short summary of what this role can do"
              value={currentRole.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentRole({ ...currentRole, description: e.target?.value })
              }
            />
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERMISSION_GROUPS.map((group: { id: string; name: string; permissions: Array<{ id: string; label: string; description: string }> }) => (
              <Card key={group.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Icon name="Shield" size={16} className="text-indigo-600" />
                  <h4 className="font-bold">{group.name}</h4>
                </div>
                <div className="space-y-3">
                  {group?.permissions?.map((perm) => (
                    <div key={perm.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={currentRole?.permissionIds?.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        id={perm.id}
                      />
                      <label
                        htmlFor={perm.id}
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="text-sm font-bold">{perm.label}</span>
                        <span className="text-xs text-text-tertiary">
                          {perm.description}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tight text-black">
            Roles & Permissions
          </h1>
          <p className="text-text-tertiary">
            Define custom access levels for your staff. Limit sensitive data
            visibility.
          </p>
        </div>
        <Button
          onClick={() => {
            setCurrentRole({ name: "", description: "", permissionIds: [] });
            setIsEditing(true);
          }}
        >
          <Icon name="Plus" size={18} className="mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Roles */}
        <Card className="p-6 bg-background/30 border-dashed">
          <h3 className="font-bold text-text-tertiary uppercase text-xs tracking-widest mb-4">
            System Roles
          </h3>
          <div className="flex flex-col gap-3">
            {["Owner", "Admin", "Finance", "Support", "Viewer"].map((r) => (
              <div
                key={r}
                className="flex items-center justify-between p-3 bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border/40"
              >
                <span className="font-bold">{r}</span>
                <span className="text-xs bg-background/30 px-2 py-1 rounded-full text-text-tertiary">
                  Fixed
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Custom Roles List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold uppercase text-xs tracking-widest text-indigo-600">
            Custom Roles
          </h3>
          {isLoading ? (
            <div className="p-12 text-center text-text-tertiary">
              Loading roles...
            </div>
          ) : roles.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-3xl text-text-tertiary">
              No custom roles created yet.
            </div>
          ) : (
            roles.map((role) => (
              <Card
                key={role.id}
                className="p-6 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-lg">{role.name}</h4>
                  <p className="text-sm text-text-tertiary">
                    {role.description || "No description provided."}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold">
                      {role.RolePermission?.length || 0} Permissions
                    </span>
                    <span className="text-xs bg-background/30 text-text-tertiary px-2 py-1 rounded-full">
                      {role._count?.Membership || 0} Staff Members
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentRole({
                        id: role.id,
                        name: role.name,
                        description: role.description || "",
                        permissionIds: role.RolePermission?.map(
                          (rp) => rp.Permission?.name,
                        ),
                      });
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
