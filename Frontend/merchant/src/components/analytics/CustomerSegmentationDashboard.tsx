"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, TrendingUp, Gift, Crown, UserCheck, RefreshCw, Plus, Palette } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSegment, SegmentOverview } from "@/types/intelligence";
import { useToast } from "@/hooks/use-toast";
import { SegmentDistributionChart } from "./SegmentDistributionChart";

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-5 w-5" />,
  Gift: <Gift className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  UserCheck: <UserCheck className="h-5 w-5" />,
};

const PREDEFINED_SEGMENTS = [
  {
    name: "VIP Champions",
    description: "High-value, frequent buyers - your most valuable customers",
    icon: "Crown",
    color: "#f59e0b",
    criteria: { rfm: { recency: 5, frequency: 5, monetary: 5 }, behaviors: ["high_value"] },
  },
  {
    name: "Loyal Regulars",
    description: "Consistent, engaged customers with repeat purchases",
    icon: "UserCheck",
    color: "#3b82f6",
    criteria: { rfm: { recency: 4, frequency: 4, monetary: 3 }, behaviors: ["repeat_buyer"] },
  },
  {
    name: "Rising Stars",
    description: "New customers with high growth potential",
    icon: "TrendingUp",
    color: "#10b981",
    criteria: { rfm: { recency: 5, frequency: 2, monetary: 3 }, behaviors: ["new_customer"] },
  },
  {
    name: "At Risk",
    description: "Previously valuable customers who haven't purchased recently",
    icon: "Gift",
    color: "#f43f5e",
    criteria: { rfm: { recency: 1, frequency: 4, monetary: 4 }, behaviors: ["re_engagement"] },
  },
];

export function CustomerSegmentationDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SegmentOverview | null>(null);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [creatingPredefined, setCreatingPredefined] = useState(false);
  const [newSegmentOpen, setNewSegmentOpen] = useState(false);
  const { toast } = useToast();

  // New segment form state
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentDescription, setNewSegmentDescription] = useState("");
  const [newSegmentColor, setNewSegmentColor] = useState("#3b82f6");
  const [newSegmentRecency, setNewSegmentRecency] = useState(3);
  const [newSegmentFrequency, setNewSegmentFrequency] = useState(3);
  const [newSegmentMonetary, setNewSegmentMonetary] = useState(3);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/segments?overview=true");

      if (!response.ok) {
        throw new Error("Failed to fetch segments");
      }

      const result = await response.json();
      setData(result.data);
      setSegments(result.data?.segments || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const performRFMAnalysis = async () => {
    try {
      setAnalyzing(true);

      const response = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rfm-analysis" }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform RFM analysis");
      }

      toast({
        title: "RFM Analysis Complete",
        description: "Customer segmentation has been updated based on RFM analysis.",
      });

      await fetchSegments();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to perform analysis",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const createPredefinedSegments = async () => {
    try {
      setCreatingPredefined(true);

      const response = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-predefined" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create predefined segments");
      }

      toast({
        title: "Segments Created",
        description: "Default customer segments have been created successfully.",
      });

      await fetchSegments();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create segments",
        variant: "destructive",
      });
    } finally {
      setCreatingPredefined(false);
    }
  };

  const createCustomSegment = async () => {
    try {
      const response = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newSegmentName,
          description: newSegmentDescription,
          color: newSegmentColor,
          icon: "Users",
          criteria: {
            rfm: {
              recency: newSegmentRecency,
              frequency: newSegmentFrequency,
              monetary: newSegmentMonetary,
            },
            behaviors: ["custom"],
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create segment");
      }

      toast({
        title: "Segment Created",
        description: `${newSegmentName} has been created successfully.`,
      });

      setNewSegmentOpen(false);
      setNewSegmentName("");
      setNewSegmentDescription("");
      await fetchSegments();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create segment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Segmentation</h1>
          <p className="text-gray-500">
            AI-powered RFM analysis to understand and target your customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={performRFMAnalysis}
            disabled={analyzing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
            {analyzing ? "Analyzing..." : "Run RFM Analysis"}
          </Button>
          <Dialog open={newSegmentOpen} onOpenChange={setNewSegmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Custom Segment</DialogTitle>
                <DialogDescription>
                  Define criteria to automatically segment your customers
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Segment Name</Label>
                  <Input
                    id="name"
                    value={newSegmentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSegmentName(e.target.value)}
                    placeholder="e.g., Weekend Shoppers"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSegmentDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSegmentDescription(e.target.value)}
                    placeholder="Describe this customer segment..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>RFM Criteria (1-5 scale)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Recency</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={newSegmentRecency}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSegmentRecency(parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={newSegmentFrequency}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSegmentFrequency(parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monetary</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={newSegmentMonetary}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSegmentMonetary(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={newSegmentColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSegmentColor(e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <span className="text-sm text-gray-500">{newSegmentColor}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewSegmentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createCustomSegment} disabled={!newSegmentName}>
                  Create Segment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalCustomers || 0}</div>
              <p className="text-xs text-gray-500">
                Across {segments.length} segments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {segments.find((s) => s.name.includes("VIP"))?.customerCount || 0}
              </div>
              <p className="text-xs text-gray-500">
                Top value customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {segments.find((s) => s.name.includes("Risk"))?.customerCount || 0}
              </div>
              <p className="text-xs text-gray-500">
                Need re-engagement
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Segments</CardTitle>
              <Palette className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segments.length}</div>
              <p className="text-xs text-gray-500">
                Active segments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!loading && data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Segment Distribution</CardTitle>
              <CardDescription>
                Customer distribution across segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentDistributionChart segments={segments} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Segment Value</CardTitle>
              <CardDescription>
                Total value contribution by segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segments
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 5)
                  .map((segment) => (
                    <div key={segment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: segment.color + "20" }}
                        >
                          <span style={{ color: segment.color }}>
                            {SEGMENT_ICONS[segment.icon] || <Users className="h-4 w-4" />}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-sm text-gray-500">
                            {segment.customerCount} customers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₦{segment.totalValue.toLocaleString("en-NG")}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {((segment.totalValue / (data?.totalCustomers || 1)) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Segments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customer Segments</h2>
          {segments.length === 0 && !loading && (
            <Button
              variant="outline"
              onClick={createPredefinedSegments}
              disabled={creatingPredefined}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${creatingPredefined ? "animate-spin" : ""}`} />
              {creatingPredefined ? "Creating..." : "Create Default Segments"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : segments.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-4 text-lg font-medium">No Segments Yet</h3>
              <p className="mt-2 text-gray-500">
                Get started by creating default customer segments or running an RFM analysis
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={createPredefinedSegments}
                  disabled={creatingPredefined}
                >
                  {creatingPredefined ? "Creating..." : "Create Default Segments"}
                </Button>
                <Button onClick={performRFMAnalysis} disabled={analyzing}>
                  {analyzing ? "Analyzing..." : "Run RFM Analysis"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: segment.color + "20" }}
                    >
                      <span style={{ color: segment.color }}>
                        {SEGMENT_ICONS[segment.icon] || <Users className="h-5 w-5" />}
                      </span>
                    </div>
                    <Badge variant="secondary">{segment.customerCount}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{segment.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {segment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="font-semibold">
                        ₦{segment.totalValue.toLocaleString("en-NG")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/customers?segment=${segment.id}`;
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
