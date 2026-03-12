"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  lastUsedAt: string | null;
  usageCount: number;
  status: "active" | "revoked" | "expired";
  expiresAt: string | null;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
  };
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);

      const response = await fetch(`/api/saas/api-keys?${params}`);
      const data = await response.json();

      // Filter by search locally
      let filtered = data.apiKeys || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (key: ApiKey) =>
            key.name.toLowerCase().includes(searchLower) ||
            key.tenant.name.toLowerCase().includes(searchLower)
        );
      }

      setApiKeys(filtered);
    } catch (error) {
      logger.error("[API Keys] Failed to fetch:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [search, statusFilter]);

  const revokeApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/saas/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      logger.error("[API Keys] Failed to revoke:", { error });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      revoked: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    const icons = {
      active: <CheckCircle className="h-3 w-3" />,
      revoked: <XCircle className="h-3 w-3" />,
      expired: <Clock className="h-3 w-3" />,
    };
    return (
      <Badge className={variants[status]}>
        <span className="flex items-center gap-1">
          {icons[status as keyof typeof icons]}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const maskKey = (prefix: string) => {
    return `${prefix}••••••••••••••••`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Manage API keys for tenant access"
        primaryAction={{
          label: "Create API Key",
          icon: "Plus",
          onClick: () => router.push("/dashboard/api-keys/new"),
        }}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search API keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="active">Active</option>
              <option value="">All Keys</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading API keys...
                    </TableCell>
                  </TableRow>
                ) : apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No API keys found. Create your first API key to get
                      started.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <p className="font-medium">{key.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{key.tenant.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {maskKey(key.keyPrefix)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.slice(0, 2).map((scope, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                          {key.scopes.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{key.scopes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {key.usageCount.toLocaleString()} calls
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Last used: {formatDate(key.lastUsedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/api-keys/${key.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/api-keys/${key.id}/edit`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            {key.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => revokeApiKey(key.id)}
                                className="text-red-600"
                              >
                                Revoke
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
