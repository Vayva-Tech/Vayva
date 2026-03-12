"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Buildings,
  Plus,
  Trash,
  ArrowsClockwise as RefreshCw,
  Copy,
  CheckCircle,
  Warning as AlertTriangle,
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { apiJson } from "@/lib/api-client-shared";

interface IdentityProvider {
  id: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  isActive: boolean;
}

interface RoleMapping {
  id: string;
  idpGroupName: string;
  vayvaRole: string;
}

export default function SSOSettingsPage() {
  const [idps, setIdps] = useState<IdentityProvider[]>([]);
  const [roleMappings, setRoleMappings] = useState<RoleMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIdp, setShowAddIdp] = useState(false);
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [scimToken, setScimToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const [idpForm, setIdpForm] = useState({
    name: "",
    metadataUrl: "",
    entityId: "",
    ssoUrl: "",
    certificate: "",
    useMetadataUrl: true,
  });

  const [mappingForm, setMappingForm] = useState({
    idpId: "",
    idpGroupName: "",
    vayvaRole: "staff",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [idpsData] = await Promise.all([
        apiJson<{ idps: IdentityProvider[] }>("/api/auth/saml/login"),
      ]);
      setIdps(idpsData.idps || []);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = idpForm.useMetadataUrl
        ? { name: idpForm.name, metadataUrl: idpForm.metadataUrl }
        : {
            name: idpForm.name,
            entityId: idpForm.entityId,
            ssoUrl: idpForm.ssoUrl,
            certificate: idpForm.certificate,
          };

      const { idp } = await apiJson<{ idp: IdentityProvider }>(
        "/api/auth/saml/metadata",
        { method: "POST", body: JSON.stringify(payload) }
      );

      setIdps((prev) => [...prev, idp]);
      setShowAddIdp(false);
      setIdpForm({ name: "", metadataUrl: "", entityId: "", ssoUrl: "", certificate: "", useMetadataUrl: true });
      toast.success("Identity Provider added successfully");
    } catch {
      toast.error("Failed to add Identity Provider");
    }
  };

  const handleDeactivateIdp = async (id: string) => {
    try {
      await apiJson(`/api/auth/saml/idps/${id}`, { method: "DELETE" });
      setIdps((prev) => prev.filter((idp) => idp.id !== id));
      toast.success("Identity Provider deactivated");
    } catch {
      toast.error("Failed to deactivate Identity Provider");
    }
  };

  const handleGenerateScimToken = async () => {
    setGeneratingToken(true);
    try {
      const { token } = await apiJson<{ token: string; expiresAt: string }>(
        "/api/auth/scim/token",
        { method: "POST" }
      );
      setScimToken(token);
      toast.success("SCIM token generated");
    } catch {
      toast.error("Failed to generate SCIM token");
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = async () => {
    if (scimToken) {
      await navigator.clipboard.writeText(scimToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const spMetadataUrl = `${window.location.origin}/api/auth/saml/metadata`;
  const scimBaseUrl = `${window.location.origin}/api/auth/scim/v2`;

  const vayvaRoles = [
    "owner", "admin", "manager", "staff", "viewer",
    "billing_admin", "support_agent", "developer",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div>
        <BackButton />
        <Breadcrumbs
          items={[
            { label: "Settings", href: "/dashboard/settings" },
            { label: "SSO & Provisioning" },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck size={24} className="text-blue-600" weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SSO & User Provisioning</h1>
          <p className="text-gray-500 text-sm">
            Configure SAML 2.0 Single Sign-On and SCIM automated provisioning
          </p>
        </div>
      </div>

      {/* Identity Providers Section */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Identity Providers</h2>
            <p className="text-sm text-gray-500">Okta, Azure AD, OneLogin, and more</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddIdp(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add IdP
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : idps.length === 0 ? (
          <div className="p-8 text-center">
            <Buildings size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No Identity Providers configured</p>
            <p className="text-sm text-gray-400 mt-1">
              Add your first IdP to enable SAML SSO for your team
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {idps.map((idp) => (
              <div key={idp.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${idp.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <div>
                    <p className="font-medium text-gray-900">{idp.name}</p>
                    <p className="text-sm text-gray-400 font-mono">{idp.entityId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    idp.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}>
                    {idp.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivateIdp(idp.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SP Metadata URL */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <p className="text-xs font-medium text-blue-700 mb-1">Your SP Metadata URL</p>
          <p className="text-xs font-mono text-blue-600 break-all">{spMetadataUrl}</p>
          <p className="text-xs text-blue-500 mt-1">
            Provide this URL to your Identity Provider during configuration
          </p>
        </div>
      </section>

      {/* Add IdP Modal */}
      {showAddIdp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Add Identity Provider</h3>

            <form onSubmit={handleAddIdp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <Input
                  placeholder="e.g. Okta, Azure AD, OneLogin"
                  value={idpForm.name}
                  onChange={(e) => setIdpForm({ ...idpForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={idpForm.useMetadataUrl}
                    onChange={() => setIdpForm({ ...idpForm, useMetadataUrl: true })}
                  />
                  <span className="text-sm">Metadata URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!idpForm.useMetadataUrl}
                    onChange={() => setIdpForm({ ...idpForm, useMetadataUrl: false })}
                  />
                  <span className="text-sm">Manual Configuration</span>
                </label>
              </div>

              {idpForm.useMetadataUrl ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata URL
                  </label>
                  <Input
                    placeholder="https://your-idp.com/metadata"
                    value={idpForm.metadataUrl}
                    onChange={(e) => setIdpForm({ ...idpForm, metadataUrl: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
                    <Input
                      placeholder="https://your-idp.com"
                      value={idpForm.entityId}
                      onChange={(e) => setIdpForm({ ...idpForm, entityId: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SSO URL</label>
                    <Input
                      placeholder="https://your-idp.com/sso"
                      value={idpForm.ssoUrl}
                      onChange={(e) => setIdpForm({ ...idpForm, ssoUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X.509 Certificate
                    </label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm font-mono h-24 resize-none"
                      placeholder="-----BEGIN CERTIFICATE-----..."
                      value={idpForm.certificate}
                      onChange={(e) => setIdpForm({ ...idpForm, certificate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowAddIdp(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit">Add Identity Provider</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Mapping Section */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Role Mappings</h2>
            <p className="text-sm text-gray-500">
              Map IdP groups to Vayva roles automatically
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddMapping(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Mapping
          </Button>
        </div>

        {roleMappings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400">
              No role mappings configured. Users will be assigned the default &quot;staff&quot; role.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roleMappings.map((mapping) => (
              <div key={mapping.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                    {mapping.idpGroupName}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-medium text-blue-700">{mapping.vayvaRole}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash size={14} className="text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SCIM Provisioning Section */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">SCIM Provisioning</h2>
          <p className="text-sm text-gray-500">
            Automate user provisioning/deprovisioning from your IdP
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">SCIM Base URL</p>
                <p className="text-xs font-mono text-gray-500 mt-1 break-all">{scimBaseUrl}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Bearer Token</p>
            {scimToken ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-xs bg-gray-50 border rounded-lg px-3 py-2 overflow-hidden">
                  <span className="text-gray-400">{"*".repeat(32)}</span>
                  <span className="text-gray-700">...{scimToken.slice(-8)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                  className="flex items-center gap-1"
                >
                  {copiedToken ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedToken ? "Copied" : "Copy"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">No token generated yet</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerateScimToken}
                  disabled={generatingToken}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={14} className={generatingToken ? "animate-spin" : ""} />
                  Generate Token
                </Button>
              </div>
            )}
            <div className="flex items-start gap-2 mt-2">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600">
                Store this token securely. It will not be shown again after you leave this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add Role Mapping Modal */}
      {showAddMapping && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Add Role Mapping</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identity Provider
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={mappingForm.idpId}
                  onChange={(e) => setMappingForm({ ...mappingForm, idpId: e.target.value })}
                >
                  <option value="">Select IdP...</option>
                  {idps.map((idp) => (
                    <option key={idp.id} value={idp.id}>{idp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IdP Group Name
                </label>
                <Input
                  placeholder="e.g. Store Admins, Staff, Managers"
                  value={mappingForm.idpGroupName}
                  onChange={(e) => setMappingForm({ ...mappingForm, idpGroupName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vayva Role
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={mappingForm.vayvaRole}
                  onChange={(e) => setMappingForm({ ...mappingForm, vayvaRole: e.target.value })}
                >
                  {vayvaRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAddMapping(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setRoleMappings((prev) => [
                    ...prev,
                    { id: Date.now().toString(), ...mappingForm },
                  ]);
                  setShowAddMapping(false);
                  toast.success("Role mapping added");
                }}
              >
                Add Mapping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
