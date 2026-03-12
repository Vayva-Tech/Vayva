"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { logger } from "@/lib/logger";
import { Loader2, Copy, Check } from "lucide-react";

interface ApiKeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AVAILABLE_SCOPES = [
  { id: "orders:read", label: "Read Orders", category: "Orders" },
  { id: "orders:write", label: "Write Orders", category: "Orders" },
  { id: "products:read", label: "Read Products", category: "Products" },
  { id: "products:write", label: "Write Products", category: "Products" },
  { id: "customers:read", label: "Read Customers", category: "Customers" },
  { id: "customers:write", label: "Write Customers", category: "Customers" },
  { id: "inventory:read", label: "Read Inventory", category: "Inventory" },
  { id: "inventory:write", label: "Write Inventory", category: "Inventory" },
  { id: "analytics:read", label: "Read Analytics", category: "Analytics" },
  { id: "webhooks:manage", label: "Manage Webhooks", category: "Admin" },
  { id: "api_keys:manage", label: "Manage API Keys", category: "Admin" },
  { id: "full_access", label: "Full Access", category: "Admin" },
];

export function ApiKeyCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [allowedIps, setAllowedIps] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<{
    id: string;
    key: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedScopes.length === AVAILABLE_SCOPES.length) {
      setSelectedScopes([]);
    } else {
      setSelectedScopes(AVAILABLE_SCOPES.map((s) => s.id));
    }
  };

  const handleSubmit = async () => {
    if (!name || selectedScopes.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          scopes: selectedScopes,
          expiresAt: expiresAt || undefined,
          allowedIps: allowedIps
            ? allowedIps.split(",").map((ip) => ip.trim())
            : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data);
        onSuccess();
      }
    } catch (error) {
      logger.error("[ApiKeyCreate] Failed to create:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedScopes([]);
    setExpiresAt("");
    setAllowedIps("");
    setCreatedKey(null);
    onOpenChange(false);
  };

  const copyKey = () => {
    if (createdKey?.key) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group scopes by category
  const scopesByCategory = AVAILABLE_SCOPES.reduce((acc, scope) => {
    if (!acc[scope.category]) acc[scope.category] = [];
    acc[scope.category].push(scope);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_SCOPES>);

  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">API Key Created!</DialogTitle>
            <DialogDescription>
              Your API key has been created successfully. Copy it now - it
              won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key Name</Label>
              <Input value={createdKey.name} readOnly />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={createdKey.key}
                  readOnly
                  type="password"
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Store this key securely. It provides access to your store data.
              </p>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Copy the API key above</li>
                <li>Include it in the Authorization header</li>
                <li>Start making API requests</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Vayva API programmatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Key Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Production API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for no expiration.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedIps">Allowed IP Addresses (Optional)</Label>
            <Input
              id="allowedIps"
              placeholder="e.g., 192.168.1.1, 10.0.0.1"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of allowed IPs. Leave blank to allow all.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Scopes <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                type="button"
              >
                {selectedScopes.length === AVAILABLE_SCOPES.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              {Object.entries(scopesByCategory).map(([category, scopes]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {scopes.map((scope) => (
                      <div key={scope.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={scope.id}
                          checked={selectedScopes.includes(scope.id)}
                          onCheckedChange={() => handleScopeToggle(scope.id)}
                        />
                        <Label
                          htmlFor={scope.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {scope.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedScopes.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedScopes.length} scope
                {selectedScopes.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || selectedScopes.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create API Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
