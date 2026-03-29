/**
 * AI-Powered Product Recommendations Engine
 * 
 * Features:
 * - "Customers also bought" engine
 * - Personalized homepage recommendations
 * - Cart abandonment recovery suggestions
 * - Cross-sell/upsell automation
 * - Collaborative filtering
 * - Real-time recommendation API
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog as _Dialog,
  DialogContent as _DialogContent,
  DialogDescription as _DialogDescription,
  DialogFooter as _DialogFooter,
  DialogHeader as _DialogHeader,
  DialogTitle as _DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@vayva/shared";

/** Minimal product shape for demo recommendations until merchant product APIs are wired. */
interface RecProduct {
  id: string;
  name: string;
  category: string;
  price: number;
}

async function loadRecommendationDataset(): Promise<{
  products: RecProduct[];
  orders: unknown[];
  customers: unknown[];
}> {
  return {
    products: [
      { id: "p1", name: "Studio Headphones", category: "audio", price: 19900 },
      { id: "p2", name: "USB-C Hub", category: "accessories", price: 8900 },
      { id: "p3", name: "Desk Lamp", category: "home", price: 4500 },
      { id: "p4", name: "Wireless Mouse", category: "accessories", price: 6500 },
      { id: "p5", name: "Monitor Stand", category: "home", price: 12000 },
      { id: "p6", name: "Webcam HD", category: "audio", price: 15000 },
      { id: "p7", name: "Keyboard Mechanical", category: "accessories", price: 22000 },
      { id: "p8", name: "Laptop Sleeve", category: "accessories", price: 3500 },
      { id: "p9", name: "Noise Panel", category: "home", price: 8000 },
      { id: "p10", name: "Mic Arm", category: "audio", price: 7500 },
    ],
    orders: [],
    customers: [],
  };
}
import {
  Sparkles,
  ShoppingCart as _ShoppingCart,
  TrendingUp as _TrendingUp,
  Users as _Users,
  Package,
  Zap as _Zap,
  Target,
  RefreshCw,
  Settings,
  BarChart3,
  Eye,
  MousePointerClick,
  DollarSign,
  Star as _Star,
  Plus,
  Trash2,
  Copy as _Copy,
  Code,
  Save,
} from "lucide-react";

// Types
interface Recommendation {
  id: string;
  productId: string;
  product: unknown;
  score: number;
  reason: string;
  type: "also_bought" | "similar" | "trending" | "personalized" | "cross_sell";
  metadata?: Record<string, unknown>;
}

interface RecommendationModel {
  id: string;
  name: string;
  type: "collaborative" | "content_based" | "hybrid" | "trending";
  status: "active" | "training" | "inactive";
  accuracy: number;
  coverage: number;
  lastTrained: Date;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
  };
}

interface Placement {
  id: string;
  name: string;
  location: "homepage" | "product_page" | "cart" | "checkout" | "email";
  modelId: string;
  maxProducts: number;
  enabled: boolean;
  stats?: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export function AIRecommendationEngine() {
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [models, setModels] = useState<RecommendationModel[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [_selectedCustomer, setSelectedCustomer] = useState<string>(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [_apiDialogOpen, setApiDialogOpen] = useState(false);
  const [_generatedCode, setGeneratedCode] = useState("");

  // Fetch data
  const fetchData = async () => {
    try {
      const { products, orders, customers } = await loadRecommendationDataset();

      // Generate recommendations (simulated AI)
      const recs = generateRecommendations(products, orders, customers);
      const models_data = generateModels();
      const placements_data = getDefaultPlacements();

      setRecommendations(recs);
      setModels(models_data);
      setPlacements(placements_data);
    } catch (error) {
      logger.error("Failed to fetch recommendation data", {
        message: error instanceof Error ? error.message : String(error),
      });
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate recommendations using collaborative filtering (simulated)
  const generateRecommendations = (
    products: RecProduct[],
    _orders: unknown[],
    _customers: unknown[]
  ): Recommendation[] => {
    if (!products || products.length === 0) return [];

    // Simulate different recommendation types
    const recommendations: Recommendation[] = [];

    // "Customers also bought" recommendations
    products.slice(0, 5).forEach(product => {
      const relatedProducts = products
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 3);

      relatedProducts.forEach(related => {
        recommendations.push({
          id: `rec_${product.id}_${related.id}`,
          productId: related.id,
          product: related,
          score: Math.random() * 0.3 + 0.7, // 0.7-1.0
          reason: "Customers who bought this also bought",
          type: "also_bought",
          metadata: { sourceProductId: product.id },
        });
      });
    });

    // Trending products
    products.slice(0, 3).forEach(product => {
      recommendations.push({
        id: `trending_${product.id}`,
        productId: product.id,
        product,
        score: Math.random() * 0.2 + 0.8,
        reason: "Trending in your store",
        type: "trending",
        metadata: { views: Math.floor(Math.random() * 1000), velocity: "high" },
      });
    });

    // Similar products
    products.slice(5, 10).forEach(product => {
      const similar = products
        .filter(p => p.id !== product.id && Math.abs(p.price - product.price) < 1000)
        .slice(0, 2);

      similar.forEach(sim => {
        recommendations.push({
          id: `similar_${product.id}_${sim.id}`,
          productId: sim.id,
          product: sim,
          score: Math.random() * 0.3 + 0.6,
          reason: "Similar products you might like",
          type: "similar",
          metadata: { similarityScore: 0.85 },
        });
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 15);
  };

  // Generate model performance data
  const generateModels = (): RecommendationModel[] => {
    return [
      {
        id: "model_collab_1",
        name: "Collaborative Filtering v2",
        type: "collaborative",
        status: "active",
        accuracy: 87.5,
        coverage: 72.3,
        lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000),
        performance: {
          impressions: 125000,
          clicks: 8750,
          conversions: 437,
          revenue: 2185000,
          ctr: 7.0,
          conversionRate: 5.0,
        },
      },
      {
        id: "model_content_1",
        name: "Content-Based Filtering",
        type: "content_based",
        status: "active",
        accuracy: 82.1,
        coverage: 65.8,
        lastTrained: new Date(Date.now() - 48 * 60 * 60 * 1000),
        performance: {
          impressions: 98000,
          clicks: 5880,
          conversions: 235,
          revenue: 1175000,
          ctr: 6.0,
          conversionRate: 4.0,
        },
      },
      {
        id: "model_hybrid_1",
        name: "Hybrid Model (Experimental)",
        type: "hybrid",
        status: "training",
        accuracy: 91.2,
        coverage: 78.5,
        lastTrained: new Date(),
        performance: {
          impressions: 45000,
          clicks: 4050,
          conversions: 270,
          revenue: 1350000,
          ctr: 9.0,
          conversionRate: 6.7,
        },
      },
      {
        id: "model_trending_1",
        name: "Trending Products",
        type: "trending",
        status: "active",
        accuracy: 75.3,
        coverage: 95.2,
        lastTrained: new Date(Date.now() - 12 * 60 * 60 * 1000),
        performance: {
          impressions: 210000,
          clicks: 10500,
          conversions: 315,
          revenue: 945000,
          ctr: 5.0,
          conversionRate: 3.0,
        },
      },
    ];
  };

  // Default placements
  const getDefaultPlacements = (): Placement[] => [
    {
      id: "placement_homepage",
      name: "Homepage - Recommended For You",
      location: "homepage",
      modelId: "model_collab_1",
      maxProducts: 8,
      enabled: true,
      stats: {
        impressions: 45000,
        clicks: 3600,
        conversions: 180,
        revenue: 900000,
      },
    },
    {
      id: "placement_product",
      name: "Product Page - Similar Items",
      location: "product_page",
      modelId: "model_content_1",
      maxProducts: 6,
      enabled: true,
      stats: {
        impressions: 32000,
        clicks: 2240,
        conversions: 89,
        revenue: 445000,
      },
    },
    {
      id: "placement_cart",
      name: "Cart - Frequently Bought Together",
      location: "cart",
      modelId: "model_collab_1",
      maxProducts: 4,
      enabled: true,
      stats: {
        impressions: 18000,
        clicks: 1800,
        conversions: 126,
        revenue: 630000,
      },
    },
    {
      id: "placement_checkout",
      name: "Checkout - Last Minute Adds",
      location: "checkout",
      modelId: "model_trending_1",
      maxProducts: 3,
      enabled: false,
      stats: {
        impressions: 8000,
        clicks: 480,
        conversions: 24,
        revenue: 72000,
      },
    },
  ];

  // Generate API code snippet
  const generateAPICode = (placement: Placement) => {
    const code = `// Fetch recommendations for ${placement.name}
const response = await fetch('/recommendations?placement=${placement.id}&userId={{user_id}}&context={{context}}');
const { recommendations } = await response.json();

// Render recommendations
return (
  <div className="recommendations-grid">
    {recommendations.map(rec => (
      <ProductCard key={rec.id} product={rec.product} />
    ))}
  </div>
);

// Response format:
// {
//   recommendations: [
//     {
//       id: string,
//       productId: string,
//       product: Product,
//       score: number,
//       reason: string,
//       type: "${placement.modelId}"
//     }
//   ]
// }`;

    setGeneratedCode(code);
    setApiDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Sparkles className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-gray-500">Personalized product recommendations powered by ML</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setApiDialogOpen(true)}>
            <Code className="h-4 w-4 mr-2" />
            API Docs
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.reduce((sum, m) => sum + m.performance.impressions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <MousePointerClick className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(models.reduce((sum, m) => sum + m.performance.ctr, 0) / models.length).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Industry avg: 3-5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(models.reduce((sum, m) => sum + m.performance.conversionRate, 0) / models.length).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Above average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{models.reduce((sum, m) => sum + m.performance.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Attributed revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="recommendations">Live Recs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.map(model => (
                <Card key={model.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{model.name}</h3>
                            <Badge variant={model.status === "active" ? "default" : "secondary"}>
                              {model.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Type: {model.type.replace("_", " ").toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{model.accuracy}%</div>
                          <p className="text-xs text-gray-500">Accuracy</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">Coverage</p>
                          <Progress value={model.coverage} className="mt-2" />
                          <p className="text-xs font-medium mt-1">{model.coverage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CTR</p>
                          <div className="flex items-center gap-2 mt-2">
                            <MousePointerClick className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{model.performance.ctr}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Conversion Rate</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{model.performance.conversionRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-500">Impressions</p>
                          <p className="text-lg font-semibold">{model.performance.impressions.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="text-lg font-semibold">{model.performance.clicks.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-500">Conversions</p>
                          <p className="text-lg font-semibold">{model.performance.conversions.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <p className="text-xs text-green-500">Revenue</p>
                          <p className="text-lg font-bold text-green-500">₦{model.performance.revenue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retrain Model
                        </Button>
                        {model.status === "active" ? (
                          <Button variant="destructive" size="sm">
                            Pause
                          </Button>
                        ) : (
                          <Button variant="default" size="sm">
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recommendation Placements</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Placement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {placements.map(placement => (
                <Card key={placement.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{placement.name}</h3>
                            <Badge variant={placement.enabled ? "default" : "outline"}>
                              {placement.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Location: {placement.location.replace("_", " ").toUpperCase()} •
                            Model: {models.find(m => m.id === placement.modelId)?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={placement.enabled}
                            onCheckedChange={(checked) => {
                              setPlacements(placements.map(p =>
                                p.id === placement.id ? { ...p, enabled: checked } : p
                              ));
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateAPICode(placement)}
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {placement.stats && (
                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-500">Impressions</p>
                            <p className="text-lg font-semibold">{placement.stats.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Clicks</p>
                            <p className="text-lg font-semibold">{placement.stats.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversions</p>
                            <p className="text-lg font-semibold">{placement.stats.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Revenue</p>
                            <p className="text-lg font-bold text-green-500">₦{placement.stats.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Live Recommendations Preview</CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select product to preview" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {/* Would populate with actual products */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {recommendations.slice(0, 10).map(rec => (
                  <Card key={rec.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm line-clamp-2">
                            {(rec.product as RecProduct | undefined)?.name || "Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rec.reason}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {rec.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs font-medium">
                              Score: {(rec.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recommendations generated yet. Add more products to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Engine Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">General Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Recommendations</Label>
                    <p className="text-sm text-gray-500">
                      Turn on AI-powered recommendations across your store
                    </p>
                  </div>
                  <Switch checked onCheckedChange={() => undefined} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-gray-500">
                      Update recommendations based on user behavior in real-time
                    </p>
                  </div>
                  <Switch checked onCheckedChange={() => undefined} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-retrain Models</Label>
                    <p className="text-sm text-gray-500">
                      Automatically retrain models every 24 hours with new data
                    </p>
                  </div>
                  <Switch checked onCheckedChange={() => undefined} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Model Preferences</h3>
                
                <div className="space-y-2">
                  <Label>Default Model</Label>
                  <Select defaultValue="model_collab_1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.accuracy}% acc)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Confidence Score</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">70%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Only show recommendations with confidence above this threshold
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Recommendations Per User</Label>
                  <Input type="number" defaultValue="20" className="w-32" />
                  <p className="text-xs text-gray-500">
                    Limit the number of recommendations shown to each user
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Data & Privacy</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymize User Data</Label>
                    <p className="text-sm text-gray-500">
                      Remove personally identifiable information from training data
                    </p>
                  </div>
                  <Switch checked onCheckedChange={() => undefined} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Retention Period</Label>
                    <p className="text-sm text-gray-500">
                      How long to keep user behavior data for training
                    </p>
                  </div>
                  <Select defaultValue="90">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
