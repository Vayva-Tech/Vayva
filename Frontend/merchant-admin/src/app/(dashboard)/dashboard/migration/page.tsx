"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  FileJson,
  Database,
  Zap,
  BarChart3,
  Play,
  Pause,
  Eye,
  X,
  FileCheck,
  AlertTriangle,
  Package,
  Users,
  Store,
  MapPin,
  Building2,
  Globe,
} from "lucide-react";

// Types
interface MigrationJob {
  id: string;
  name: string;
  source: "csv" | "excel" | "json" | "shopify" | "woocommerce" | "squarespace" | "bigcommerce" | "wix" | "etsy" | "prestashop" | "magento";
  status: "draft" | "pending" | "preview_ready" | "in_progress" | "completed" | "failed" | "cancelled";
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  settings: {
    skipExisting: boolean;
    updateExisting: boolean;
    importImages: boolean;
    importInventory: boolean;
    defaultCategoryId?: string;
    defaultCurrency: string;
  };
  preview?: MigrationPreview;
  errors?: MigrationError[];
}

interface MigrationPreview {
  sampleProducts: Array<{
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    validationErrors: string[];
  }>;
  totalProducts: number;
  validationSummary: {
    valid: number;
    warnings: number;
    errors: number;
  };
  categoryMapping: Array<{ source: string; suggested: string; confidence: number }>;
  priceRange: { min: number; max: number; avg: number };
  currency: string;
}

interface MigrationError {
  row: number;
  field: string;
  value: string;
  message: string;
  severity: "error" | "warning";
}

interface MigrationStats {
  totalJobs: number;
  completedJobs: number;
  totalProductsImported: number;
  totalProductsFailed: number;
  last7DaysImports: number;
  averageProcessingTime: number;
  successRate: number;
}

const SOURCE_LABELS: Record<string, string> = {
  csv: "CSV File",
  excel: "Excel File",
  json: "JSON Import",
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  squarespace: "Squarespace",
  bigcommerce: "BigCommerce",
  wix: "Wix",
  etsy: "Etsy",
  prestashop: "PrestaShop",
  magento: "Magento",
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  csv: <FileSpreadsheet className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
  json: <FileJson className="w-4 h-4" />,
  shopify: <Store className="w-4 h-4" />,
  woocommerce: <Store className="w-4 h-4" />,
  squarespace: <Globe className="w-4 h-4" />,
  bigcommerce: <Building2 className="w-4 h-4" />,
  wix: <Globe className="w-4 h-4" />,
  etsy: <Store className="w-4 h-4" />,
  prestashop: <Store className="w-4 h-4" />,
  magento: <Store className="w-4 h-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-blue-100 text-blue-800",
  preview_ready: "bg-purple-100 text-purple-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function CatalogMigrationDashboard() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<MigrationJob | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh for active jobs
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        apiJson<{ jobs: MigrationJob[] }>("/api/migration/jobs"),
        apiJson<MigrationStats>("/api/migration/stats"),
      ]);
      setJobs(jobsRes.jobs || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[Migration] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMigration = async (jobId: string) => {
    try {
      await apiJson(`/api/migration/jobs/${jobId}/start`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Migration] Start failed:", { error });
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await apiJson(`/api/migration/jobs/${jobId}/cancel`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Migration] Cancel failed:", { error });
    }
  };

  const handleCreateJob = async (data: {
    name: string;
    source: string;
    fileUrl: string;
    settings: MigrationJob["settings"];
  }) => {
    try {
      await apiJson("/api/migration/jobs", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Migration] Create failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const recentJobs = jobs.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-teal-600" />
            Catalog Migration
          </h1>
          <p className="text-muted-foreground mt-1">
            Import products from CSV, Excel, or other platforms
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Migration
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products Imported</p>
                  <p className="text-2xl font-bold">{stats.totalProductsImported.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Time</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageProcessingTime / 60)}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600 animate-pulse" />
              Active Migrations ({activeJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg border bg-amber-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        {SOURCE_ICONS[job.source]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{job.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {SOURCE_LABELS[job.source]} • {job.totalItems.toLocaleString()} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {job.processedItems.toLocaleString()} / {job.totalItems.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((job.processedItems / job.totalItems) * 100)}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelJob(job.id)}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={(job.processedItems / job.totalItems) * 100}
                    className="mt-3 h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {job.estimatedTimeRemaining
                      ? `Estimated ${Math.round(job.estimatedTimeRemaining / 60)} minutes remaining`
                      : "Processing..."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">
            Migration Jobs
            {jobs.length > 0 && (
              <Badge variant="secondary" className="ml-2">{jobs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sources">Supported Sources</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration History</CardTitle>
              <CardDescription>Track all your catalog import jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{job.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {SOURCE_ICONS[job.source]}
                          <span>{SOURCE_LABELS[job.source]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{job.totalItems.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(job.processedItems / job.totalItems) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-xs">
                            {job.successCount}/{job.totalItems}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[job.status]}>
                          {job.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {job.status === "preview_ready" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartMigration(job.id)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {jobs.length === 0 && (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No migration jobs yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start your first migration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Import Sources</CardTitle>
              <CardDescription>Connect and migrate from these platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">File Upload</h4>
                        <p className="text-xs text-muted-foreground">CSV, Excel, JSON</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Upload files up to 100MB</li>
                      <li>• Auto-mapping support</li>
                      <li>• Image URL import</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">E-commerce</h4>
                        <p className="text-xs text-muted-foreground">Shopify, WooCommerce</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• API integration</li>
                      <li>• Full product data</li>
                      <li>• Variant support</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Website Builders</h4>
                        <p className="text-xs text-muted-foreground">Wix, Squarespace</p>
                      </div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Export/import flow</li>
                      <li>• Category mapping</li>
                      <li>• SEO data preserved</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Templates</CardTitle>
              <CardDescription>Use these templates for bulk uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium">CSV Template</p>
                      <p className="text-sm text-muted-foreground">Standard product import format</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Excel Template</p>
                      <p className="text-sm text-muted-foreground">Multi-sheet with variants</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FileJson className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">JSON Schema</p>
                      <p className="text-sm text-muted-foreground">API integration format</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Inventory Update</p>
                      <p className="text-sm text-muted-foreground">Stock level updates only</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {SOURCE_ICONS[selectedJob.source]}
                {selectedJob.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedJob.totalItems.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedJob.successCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedJob.errorCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedJob.warningCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="font-medium mb-2">Import Settings</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>Skip Existing</span>
                    <Badge variant={selectedJob.settings.skipExisting ? "default" : "outline"}>
                      {selectedJob.settings.skipExisting ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>Update Existing</span>
                    <Badge variant={selectedJob.settings.updateExisting ? "default" : "outline"}>
                      {selectedJob.settings.updateExisting ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>Import Images</span>
                    <Badge variant={selectedJob.settings.importImages ? "default" : "outline"}>
                      {selectedJob.settings.importImages ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>Import Inventory</span>
                    <Badge variant={selectedJob.settings.importInventory ? "default" : "outline"}>
                      {selectedJob.settings.importInventory ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {selectedJob.preview && (
                <div>
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="space-y-2">
                    {selectedJob.preview.sampleProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(product.price)} • {product.category}
                            </p>
                          </div>
                        </div>
                        {product.validationErrors.length > 0 ? (
                          <Badge variant="destructive">{product.validationErrors.length} errors</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800">Valid</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {selectedJob.errors && selectedJob.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Errors ({selectedJob.errors.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedJob.errors.slice(0, 10).map((error, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded bg-red-50">
                        <span className="text-xs font-mono text-red-600">Row {error.row}</span>
                        <span className="text-sm text-red-800">{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                {selectedJob.status === "preview_ready" && (
                  <Button onClick={() => handleStartMigration(selectedJob.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Migration
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <CreateMigrationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateJob}
      />
    </div>
  );
}

function CreateMigrationDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    source: string;
    fileUrl: string;
    settings: MigrationJob["settings"];
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    source: "csv",
    fileUrl: "",
    settings: {
      skipExisting: false,
      updateExisting: true,
      importImages: true,
      importInventory: true,
      defaultCurrency: "NGN",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Migration Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Job Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Shopify Migration Jan 2026"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Source Platform</Label>
            <Select
              value={form.source}
              onValueChange={(value) => setForm({ ...form, source: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="excel">Excel File</SelectItem>
                <SelectItem value="json">JSON Import</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="woocommerce">WooCommerce</SelectItem>
                <SelectItem value="squarespace">Squarespace</SelectItem>
                <SelectItem value="wix">Wix</SelectItem>
                <SelectItem value="etsy">Etsy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>File URL / Source URL</Label>
            <Input
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Import Settings</Label>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Update existing products</span>
              <Switch
                checked={form.settings.updateExisting}
                onCheckedChange={(checked) =>
                  setForm({ ...form, settings: { ...form.settings, updateExisting: checked } })
                }
              />
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Import images</span>
              <Switch
                checked={form.settings.importImages}
                onCheckedChange={(checked) =>
                  setForm({ ...form, settings: { ...form.settings, importImages: checked } })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Create & Preview
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
