"use client";
import { Button } from "@vayva/ui";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Layers,
  Package,
  Shirt,
  Watch,
  Footprints,
  Sparkles,
  Home,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

interface CategoryProduct {
  name: string;
  price: number;
  status: "active" | "draft";
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  productCount: number;
  iconBg: string;
  iconColor: string;
  recentProducts: CategoryProduct[];
}

const ICONS = [Shirt, Watch, Footprints, Sparkles, Home, Package];
const ICON_STYLES = [
  { iconBg: "bg-pink-50", iconColor: "text-pink-600" },
  { iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { iconBg: "bg-green-50", iconColor: "text-green-600" },
  { iconBg: "bg-gray-50", iconColor: "text-gray-600" },
];

function formatNaira(amount: number): string {
  return "\u20A6" + amount.toLocaleString("en-NG");
}

function buildCategories(
  categoryNames: string[],
  products: Array<{
    name: string;
    price: number;
    status: string;
    productType: string | null;
  }>,
): Category[] {
  return categoryNames.map((name, idx) => {
    const Icon = ICONS[idx % ICONS.length]!;
    const style = ICON_STYLES[idx % ICON_STYLES.length]!;
    const inCat = products.filter(
      (p) => (p.productType || "Uncategorized") === name,
    );
    const recentProducts: CategoryProduct[] = inCat.slice(0, 4).map((p) => ({
      name: p.name,
      price: p.price,
      status: p.status === "ACTIVE" || p.status === "published" ? "active" : "draft",
    }));
    return {
      id: `cat-${idx}-${name}`,
      name,
      icon: <Icon className="w-6 h-6" />,
      productCount: inCat.length,
      iconBg: style.iconBg,
      iconColor: style.iconColor,
      recentProducts,
    };
  });
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        apiJson<{ categories?: string[] }>("/products/categories"),
        apiJson<{
          items?: Array<{
            name: string;
            price: number;
            status: string;
            productType?: string | null;
          }>;
        }>("/products?limit=100&status=all"),
      ]);

      const names = catRes?.categories?.length
        ? catRes.categories
        : ["Uncategorized"];
      const items =
        prodRes?.items?.map((p) => ({
          name: p.name,
          price: Number(p.price) || 0,
          status: p.status,
          productType: p.productType ?? null,
        })) ?? [];

      const uncategorized = items.filter((p) => !p.productType);
      if (uncategorized.length > 0 && !names.includes("Uncategorized")) {
        names.push("Uncategorized");
      }

      setCategories(buildCategories(names, items));
    } catch {
      toast.error("Could not load catalog");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const { totalCategories, totalProducts, avgPerCategory, topCategory } = useMemo(() => {
    const totalCategories = categories.length;
    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);
    const avgPerCategory =
      totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0;
    const top = categories.reduce(
      (best, c) => (c.productCount > best.productCount ? c : best),
      categories[0] ?? { name: "—", productCount: 0 },
    );
    return {
      totalCategories,
      totalProducts,
      avgPerCategory,
      topCategory: top?.name ?? "—",
    };
  }, [categories]);

  const quickStats = [
    {
      label: "Total Categories",
      value: totalCategories,
      icon: <Layers className="w-5 h-5" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Total Products",
      value: totalProducts,
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Avg per Category",
      value: avgPerCategory,
      icon: <BarChart3 className="w-5 h-5" />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Top Category",
      value: topCategory,
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
        Loading catalog…
      </div>
    );
  }

  return (
    <ErrorBoundary serviceName="CatalogDashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catalog</h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize your products by categories (product type)
            </p>
          </div>
          <Button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-green-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            Add Category
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold text-gray-900 tracking-tight ${stat.isText ? "text-lg" : ""}`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl ${category.iconBg} ${category.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}
                >
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min((category.productCount / 20) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {category.productCount} of 20 max
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Products
              </p>
              <div className="space-y-1.5">
                {category.recentProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No products in this category yet</p>
                ) : (
                  category.recentProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {product.status === "draft" && (
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                        <span className="text-xs font-semibold text-gray-900">
                          {formatNaira(product.price)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center min-h-[280px] hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
            Add New Category
          </h3>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Set product type when editing products
          </p>
        </div>
      </div>
      </ErrorBoundary>
    </div>
  );
}

