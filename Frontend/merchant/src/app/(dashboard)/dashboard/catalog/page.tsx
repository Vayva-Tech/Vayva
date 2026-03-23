"use client";
// @ts-nocheck

import { useState } from "react";
import {
  Plus,
  Layers,
  ShoppingBag,
  Shirt,
  Watch,
  Footprints,
  Sparkles,
  Home,
  Package,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Mock Data ──────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Fashion",
    icon: <Shirt className="w-6 h-6" />,
    productCount: 18,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    recentProducts: [
      { name: "Ankara Print Maxi Dress", price: 18500, status: "active" },
      { name: "Adire Tie-Dye Tote Bag", price: 7500, status: "active" },
      { name: "Agbada Men's 3-Piece Set", price: 45000, status: "active" },
      { name: "Dashiki Print Shirt", price: 8900, status: "draft" },
    ],
  },
  {
    id: "2",
    name: "Accessories",
    icon: <Watch className="w-6 h-6" />,
    productCount: 12,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    recentProducts: [
      { name: "Beaded Waist Chain", price: 4200, status: "active" },
      { name: "Gele Head Wrap (Aso-Oke)", price: 12000, status: "active" },
      { name: "Kente Cloth Clutch Purse", price: 9500, status: "active" },
    ],
  },
  {
    id: "3",
    name: "Shoes",
    icon: <Footprints className="w-6 h-6" />,
    productCount: 8,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    recentProducts: [
      { name: "Handwoven Leather Sandals", price: 15000, status: "active" },
      { name: "Ankara Print Sneakers", price: 22000, status: "active" },
      { name: "Abuja Suede Loafers", price: 18500, status: "draft" },
    ],
  },
  {
    id: "4",
    name: "Beauty",
    icon: <Sparkles className="w-6 h-6" />,
    productCount: 5,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    recentProducts: [
      { name: "Shea Butter Body Cream", price: 4500, status: "active" },
      { name: "African Black Soap Bundle", price: 3200, status: "active" },
      { name: "Coconut Oil Hair Serum", price: 5800, status: "active" },
    ],
  },
  {
    id: "5",
    name: "Home",
    icon: <Home className="w-6 h-6" />,
    productCount: 4,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    recentProducts: [
      { name: "Handcrafted Calabash Bowl", price: 6500, status: "active" },
      { name: "Adire Throw Pillow Set", price: 8200, status: "active" },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return "\u20A6" + amount.toLocaleString("en-NG");
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function CatalogPage() {
  const totalCategories = CATEGORIES.length;
  const totalProducts = CATEGORIES.reduce((sum, c) => sum + c.productCount, 0);
  const avgPerCategory = Math.round(totalProducts / totalCategories);

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
      value: "Fashion",
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your products by categories
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-green-500/20 transition-colors">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Quick Stats */}
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
                <p className={`text-2xl font-bold text-gray-900 tracking-tight ${stat.isText ? "text-lg" : ""}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${category.iconBg} ${category.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Product Count Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min((category.productCount / 20) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {category.productCount} of 20 max
              </p>
            </div>

            {/* Recent Products */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Products
              </p>
              <div className="space-y-1.5">
                {category.recentProducts.map((product, idx) => (
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
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add Category Card */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center min-h-[280px] hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
            Add New Category
          </h3>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Create a new product category
          </p>
        </div>
      </div>
    </div>
  );
}
