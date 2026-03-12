"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  FlaskConical,
  Plus,
  RefreshCw,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  Users,
  MousePointer,
  Percent,
  Sigma,
} from "lucide-react";

// Types
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed" | "stopped";
  type: "product_price" | "product_title" | "product_image" | "cta_button" | "checkout_flow" | "email_subject" | "landing_page";
  target: {
    productId?: string;
    categoryId?: string;
    pageUrl?: string;
    audience?: string;
  };
  variants: ABTestVariant[];
  settings: {
    trafficAllocation: number;
    minSampleSize: number;
    confidenceLevel: number;
    autoStopDays: number;
  };
  schedule: {
    startDate?: string;
    endDate?: string;
    timezone: string;
  };
  results?: ABTestResults;
  createdAt: string;
  updatedAt: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  control: boolean;
  trafficPercent: number;
  config: Record<string, unknown>;
  stats: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  };
}

interface ABTestResults {
  winnerId?: string;
  confidence: number;
  uplift: number;
  isSignificant: boolean;
  sampleSize: number;
  duration: number;
  recommendation: string;
}

const TEST_TYPE_LABELS: Record<string, string> = {
  product_price: "Product Price",
  product_title: "Product Title",
  product_image: "Product Image",
  cta_button: "CTA Button",
  checkout_flow: "Checkout Flow",
  email_subject: "Email Subject",
  landing_page: "Landing Page",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: <Clock className="w-3 h-3" />, label: "Draft" },
  running: { color: "bg-emerald-100 text-emerald-800", icon: <Play className="w-3 h-3" />, label: "Running" },
  paused: { color: "bg-amber-100 text-amber-800", icon: <Pause className="w-3 h-3" />, label: "Paused" },
  completed: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-3 h-3" />, label: "Completed" },
  stopped: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" />, label: "Stopped" },
};

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [activeTest, setActiveTest] = useState<ABTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ tests: ABTest[] }>("/api/ab-testing/tests");
      setTests(response.tests || []);
    } catch (error) {
      logger.error("[AB Testing] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (data: Omit<ABTest, "id" | "createdAt" | "updatedAt">) => {
    try {
      await apiJson("/api/ab-testing/tests", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[AB Testing] Create failed:", { error });
    }
  };

  const handleUpdateStatus = async (testId: string, status: string) => {
    try {
      await apiJson(`/api/ab-testing/tests/${testId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (error) {
      logger.error("[AB Testing] Status update failed:", { error });
    }
  };

  const handleAssignVariant = async (testId: string, variantId: string) => {
    try {
      await apiJson(`/api/ab-testing/tests/${testId}/assign`, {
        method: "POST",
        body: JSON.stringify({ variantId }),
      });
      loadData();
    } catch (error) {
      logger.error("[AB Testing] Assignment failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const runningTests = tests.filter((t) => t.status === "running");
  const completedTests = tests.filter((t) => t.status === "completed");
  const draftTests = tests.filter((t) => t.status === "draft");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-muted-foreground mt-1">
            Optimize conversions with data-driven experiments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
            </DialogHeader>
            <CreateTestForm
              onSubmit={handleCreateTest}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Play className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold">{runningTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">
                  {tests.reduce((sum, t) => 
                    sum + t.variants.reduce((vSum, v) => vSum + v.stats.visitors, 0), 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Uplift</p>
                <p className="text-2xl font-bold">
                  {completedTests.length > 0
                    ? `${(completedTests.reduce((sum, t) => sum + (t.results?.uplift || 0), 0) / completedTests.length).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active Tests
            {runningTests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{runningTests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4">
            {runningTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewDetails={() => setActiveTest(test)}
                onPause={() => handleUpdateStatus(test.id, "paused")}
                onStop={() => handleUpdateStatus(test.id, "stopped")}
              />
            ))}
            {runningTests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active tests running.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start your first test
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          <div className="grid gap-4">
            {draftTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewDetails={() => setActiveTest(test)}
                onStart={() => handleUpdateStatus(test.id, "running")}
              />
            ))}
            {draftTests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No draft tests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4">
            {completedTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewDetails={() => setActiveTest(test)}
              />
            ))}
            {completedTests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No completed tests yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onViewDetails={() => setActiveTest(test)}
              />
            ))}
            {tests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No tests created yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Details Dialog */}
      {activeTest && (
        <Dialog open={!!activeTest} onOpenChange={() => setActiveTest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeTest.name}</DialogTitle>
            </DialogHeader>
            <TestDetails test={activeTest} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Test Card Component
function TestCard({
  test,
  onViewDetails,
  onStart,
  onPause,
  onStop,
}: {
  test: ABTest;
  onViewDetails: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}) {
  const totalVisitors = test.variants.reduce((sum, v) => sum + v.stats.visitors, 0);
  const totalConversions = test.variants.reduce((sum, v) => sum + v.stats.conversions, 0);
  const overallConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

  const statusConfig = STATUS_CONFIG[test.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{test.name}</h3>
              <Badge className={statusConfig.color}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Target className="w-4 h-4" />
                {TEST_TYPE_LABELS[test.type]}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                {totalVisitors.toLocaleString()} visitors
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MousePointer className="w-4 h-4" />
                {overallConversionRate.toFixed(2)}% conversion
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {test.status === "draft" && onStart && (
              <Button size="sm" onClick={onStart}>
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            {test.status === "running" && (
              <>
                {onPause && (
                  <Button size="sm" variant="outline" onClick={onPause}>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
                {onStop && (
                  <Button size="sm" variant="destructive" onClick={onStop}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                )}
              </>
            )}
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Details
            </Button>
          </div>
        </div>

        {/* Variant Progress */}
        <div className="mt-4 space-y-2">
          {test.variants.map((variant) => (
            <div key={variant.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {variant.name}
                  {variant.control && (
                    <Badge variant="outline" className="ml-2 text-xs">Control</Badge>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {variant.stats.visitors.toLocaleString()} visitors
                  {variant.stats.conversionRate > 0 && (
                    <span className="ml-2 text-emerald-600">
                      {variant.stats.conversionRate.toFixed(2)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(variant.stats.visitors / Math.max(1, totalVisitors)) * 100} className="flex-1" />
                <span className="text-xs text-muted-foreground w-10">{variant.trafficPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Test Details Component
function TestDetails({ test }: { test: ABTest }) {
  const winner = test.variants.find((v) => v.id === test.results?.winnerId);

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {test.results && (
        <Card className={`${test.results.isSignificant ? "bg-emerald-50 border-emerald-200" : "bg-gray-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sigma className={`w-5 h-5 ${test.results.isSignificant ? "text-emerald-600" : "text-gray-500"}`} />
              <h4 className="font-semibold">Results</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Winner</p>
                <p className="font-semibold text-lg">{winner?.name || "No clear winner"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="font-semibold text-lg">{(test.results.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uplift</p>
                <p className={`font-semibold text-lg ${test.results.uplift > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {test.results.uplift > 0 ? "+" : ""}{test.results.uplift.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm">{test.results.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Variants Comparison */}
      <div>
        <h4 className="font-semibold mb-3">Variant Performance</h4>
        <div className="grid gap-3">
          {test.variants.map((variant) => (
            <Card key={variant.id} className={variant.id === test.results?.winnerId ? "border-emerald-500" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold">{variant.name}</h5>
                      {variant.control && <Badge variant="outline">Control</Badge>}
                      {variant.id === test.results?.winnerId && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Traffic: {variant.trafficPercent}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{variant.stats.conversionRate.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-lg font-semibold">{variant.stats.visitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Visitors</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{variant.stats.conversions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(variant.stats.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Create Test Form
function CreateTestForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<ABTest, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ABTest["type"]>("product_price");
  const [variants, setVariants] = useState<Omit<ABTestVariant, "id" | "stats">[]>([
    { name: "Control", control: true, trafficPercent: 50, config: {} },
    { name: "Variant B", control: false, trafficPercent: 50, config: {} },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      type,
      status: "draft",
      target: {},
      variants: variants.map((v) => ({
        ...v,
        id: crypto.randomUUID(),
        stats: { visitors: 0, conversions: 0, conversionRate: 0, revenue: 0 },
      })),
      settings: {
        trafficAllocation: 100,
        minSampleSize: 1000,
        confidenceLevel: 0.95,
        autoStopDays: 14,
      },
      schedule: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  };

  const updateVariant = (index: number, updates: Partial<typeof variants[0]>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...updates } : v))
    );
  };

  const addVariant = () => {
    const newPercent = Math.floor(100 / (variants.length + 1));
    setVariants((prev) =>
      prev.map((v) => ({ ...v, trafficPercent: newPercent })).concat({
        name: `Variant ${String.fromCharCode(67 + prev.length - 1)}`,
        control: false,
        trafficPercent: newPercent,
        config: {},
      })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Test Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Homepage CTA Test"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you testing and why?"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Test Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ABTest["type"])}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEST_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Variants</Label>
        <div className="space-y-2 mt-1.5">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={variant.name}
                onChange={(e) => updateVariant(index, { name: e.target.value })}
                placeholder="Variant name"
              />
              <div className="flex items-center gap-2 w-32">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={variant.trafficPercent}
                  onChange={(e) =>
                    updateVariant(index, { trafficPercent: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                  max={100}
                />
              </div>
              {variant.control && <Badge variant="outline">Control</Badge>}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" className="mt-2" onClick={addVariant}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name || variants.length < 2}>
          <FlaskConical className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>
    </form>
  );
}
