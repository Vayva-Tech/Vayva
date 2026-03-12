/**
 * Beauty Products API Routes
 * GET /api/beauty/products - List products
 * POST /api/beauty/products - Create product
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Products
export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");
      const category = searchParams.get("category"); // skincare, haircare, makeup, tools, accessories
      const isActive = searchParams.get("isActive"); // true/false
      const lowStock = searchParams.get("lowStock"); // true/false

      const products = await prisma.beautyProduct.findMany({
        where: {
          merchantId: storeId,
          ...(category ? { category } : {}),
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
          ...(lowStock === "true" ? { stock: { lte: prisma.beautyProduct.fields.minStock } } : {}),
        },
        orderBy: [
          { category: "asc" },
          { name: "asc" },
        ],
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyProduct.count({
        where: {
          merchantId: storeId,
          ...(category ? { category } : {}),
          ...(isActive !== null ? { isActive: isActive === "true" } : {}),
          ...(lowStock === "true" ? { stock: { lte: prisma.beautyProduct.fields.minStock } } : {}),
        },
      });

      // Add calculated fields
      const productsWithMetrics = await Promise.all(products.map(async (product) => {
        const salesCount = await prisma.beautyProductSale.count({
          where: {
            merchantId: storeId,
            productId: product.id,
          },
        });

        const totalRevenue = await prisma.beautyProductSale.aggregate({
          where: {
            merchantId: storeId,
            productId: product.id,
          },
          _sum: {
            totalPrice: true,
          },
        });

        const profitMargin = product.cost > 0 
          ? Math.round(((product.price - product.cost) / product.price) * 100)
          : 100;

        const isLowStock = product.stock <= product.minStock;
        const isOutOfStock = product.stock === 0;

        return {
          ...product,
          salesCount,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          profitMargin,
          isLowStock,
          isOutOfStock,
          isPopular: salesCount >= 10,
          isHighValue: product.price >= 50,
          stockStatus: isOutOfStock ? "out_of_stock" : 
                      isLowStock ? "low_stock" : "adequate",
        };
      }));

      // Summary statistics
      const stats = {
        totalProducts: products.length,
        byCategory: {
          skincare: products.filter(p => p.category === "skincare").length,
          haircare: products.filter(p => p.category === "haircare").length,
          makeup: products.filter(p => p.category === "makeup").length,
          tools: products.filter(p => p.category === "tools").length,
          accessories: products.filter(p => p.category === "accessories").length,
        },
        lowStockItems: products.filter(p => p.stock <= p.minStock).length,
        outOfStockItems: products.filter(p => p.stock === 0).length,
        totalInventoryValue: products.reduce((sum, p) => sum + (p.stock * p.cost), 0),
        avgProfitMargin: products.length > 0 
          ? Math.round(products.reduce((sum, p) => sum + (p.cost > 0 ? ((p.price - p.cost) / p.price) * 100 : 100), 0) / products.length)
          : 0,
      };

      return NextResponse.json({
        success: true,
        data: productsWithMetrics,
        meta: { total, limit, offset, stats },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PRODUCTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Product
export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        name,
        brand,
        category,
        sku,
        price,
        cost,
        stock,
        minStock,
        description,
        ingredients,
        size,
      } = body;

      // Validation
      if (!name || !category || !sku || price === undefined) {
        return NextResponse.json(
          { error: "Name, category, SKU, and price are required" },
          { status: 400 }
        );
      }

      // Validate category
      const validCategories = ["skincare", "haircare", "makeup", "tools", "accessories"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
          { status: 400 }
        );
      }

      // Check if SKU already exists
      const existingProduct = await prisma.beautyProduct.findFirst({
        where: {
          merchantId: storeId,
          sku: { equals: sku, mode: "insensitive" },
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }

      const product = await prisma.beautyProduct.create({
        data: {
          merchantId: storeId,
          name,
          brand,
          category,
          sku,
          price,
          cost: cost || 0,
          stock: stock || 0,
          minStock: minStock || 5,
          description,
          ingredients: ingredients || [],
          size,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PRODUCTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);