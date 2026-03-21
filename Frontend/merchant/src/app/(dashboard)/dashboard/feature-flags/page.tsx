"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ToggleRight,
  Plus,
  Search,
  MoreHorizontal,
  Percent,
  Users,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string | null;
  type: "boolean" | "percentage" | "user_segment" | "plan_based";
  isEnabled: boolean;
  environment: "development" | "staging" | "production";
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export default function FeatureFlagsPage() {
  const router = useRouter();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [environment, setEnvironment] = useState<string>("production");

  const fetchFeatureFlags = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("environment", environment);

      const response = await fetch(`/api/saas/feature-flags?${params}`);
      const data = await response.json();

      // Filter by search locally
      let filtered = data.featureFlags || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (flag: FeatureFlag) =>
            flag.name.toLowerCase().includes(searchLower) ||
            flag.key.toLowerCase().includes(searchLower) ||
            flag.description?.toLowerCase().includes(searchLower)
        );
      }

      setFeatureFlags(filtered);
    } catch (error) {
      logger.error("[Feature Flags] Failed to fetch:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, [search, environment]);

  const toggleFeatureFlag = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/saas/feature-flags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentValue }),
      });

      if (response.ok) {
        fetchFeatureFlags();
      }
    } catch (error) {
      logger.error("[Feature Flags] Failed to toggle:", { error });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "boolean":
        return <ToggleRight className="h-4 w-4" />;
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "user_segment":
        return <Users className="h-4 w-4" />;
      case "plan_based":
        return <Layers className="h-4 w-4" />;
      default:
        return <ToggleRight className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      boolean: "On/Off",
      percentage: "Percentage",
      user_segment: "Segment",
      plan_based: "Plan",
    };
    return (
      <Badge variant="secondary" className="gap-1">
        {getTypeIcon(type)}
        {labels[type] || type}
      </Badge>
    );
  };

  const getEnvironmentBadge = (env: string) => {
    const variants: Record<string, string> = {
      development: "bg-purple-100 text-purple-800",
      staging: "bg-blue-100 text-blue-800",
      production: "bg-green-100 text-green-800",
    };
    return <Badge className={variants[env]}>{env}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Manage feature toggles and progressive rollouts"
        icon={<ToggleRight className="h-6 w-6" />}
      >
        <Button
          onClick={() => router.push("/dashboard/feature-flags/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Feature Flag
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search feature flags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading feature flags...
                    </TableCell>
                  </TableRow>
                ) : featureFlags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No feature flags found. Create your first feature flag to
                      get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  featureFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{flag.name}</p>
                          {flag.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[250px]">
                              {flag.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {flag.key}
                        </code>
                      </TableCell>
                      <TableCell>{getTypeBadge(flag.type)}</TableCell>
                      <TableCell>
                        {getEnvironmentBadge(flag.environment)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={() =>
                              toggleFeatureFlag(flag.id, flag.isEnabled)
                            }
                          />
                          {flag.isEnabled ? (
                            <Badge className="bg-green-100 text-green-800 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              On
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Off
                            </Badge>
                          )}
                        </div>
                      </TableCell>
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
                                router.push(`/dashboard/feature-flags/${flag.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/feature-flags/${flag.id}/edit`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
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
