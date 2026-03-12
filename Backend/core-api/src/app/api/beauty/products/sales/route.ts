/**
 * Beauty Product Sales API Routes
 * GET /api/beauty/products/sales - List product sales
 * POST /api/beauty/products/sales - Create product sale
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Product Sales
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const clientId = searchParams.get("clientId");
      const productId = searchParams.get("productId");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const sales = await prisma.beautyProductSale.findMany({
        where: {
          merchantId: storeId,
          ...(clientId ? { clientId } : {}),
          ...(productId ? { productId } : {}),
          ...(dateFrom || dateTo ? {
            soldAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              price: true,
            }
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
            }
          }
        },
        orderBy: { soldAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyProductSale.count({
        where: {
          merchantId: storeId,
          ...(clientId ? { clientId } : {}),
          ...(productId ? { productId } : {}),
          ...(dateFrom || dateTo ? {
            soldAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
      });

      // Add calculated fields
      const salesWithCalcs = sales.map(sale => ({
        ...sale,
        clientName: sale.client ? `${sale.client.firstName} ${sale.client.lastName}` : "Walk-in",
        productName: sale.product.name,
        productBrand: sale.product.brand,
        productCategory: sale.product.category,
        isDiscounted: sale.discount > 0,
        discountPercentage: sale.discount > 0 
          ? Math.round((sale.discount / (sale.unitPrice * sale.quantity)) * 100)
          : 0,
        finalPrice: sale.totalPrice - sale.discount + sale.tax,
        profit: (sale.unitPrice - sale.product.price) * sale.quantity - sale.discount,
        clientIsVip: sale.client?.status === "vip",
        wasPartOfAppointment: !!sale.appointment,
      }));

      // Summary statistics
      const stats = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + s.totalPrice, 0),
        totalDiscounts: sales.reduce((sum, s) => sum + s.discount, 0),
        totalTax: sales.reduce((sum, s) => sum + s.tax, 0),
        netRevenue: sales.reduce((sum, s) => sum + s.totalPrice - s.discount + s.tax, 0),
        avgTransactionValue: sales.length > 0 
          ? Math.round(sales.reduce((sum, s) => sum + s.totalPrice, 0) / sales.length)
          : 0,
        byCategory: {
          skincare: sales.filter(s => s.product.category === "skincare").length,
          haircare: sales.filter(s => s.product.category === "haircare").length,
          makeup: sales.filter(s => s.product.category === "makeup").length,
          tools: sales.filter(s => s.product.category === "tools").length,
          accessories: sales.filter(s => s.product.category === "accessories").length,
        },
      };

      return NextResponse.json({
        success: true,
        data: salesWithCalcs,
        meta: { total, limit, offset, stats },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PRODUCT_SALES_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Product Sale
export const POST = withVayvaAPI(
  PERMISSIONS.FINANCE_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        clientId,
        productId,
        appointmentId,
        quantity,
        unitPrice,
        discount,
        tax,
        soldBy,
        notes,
      } = body;

      // Validation
      if (!productId || !quantity || unitPrice === undefined) {
        return NextResponse.json(
          { error: "Product ID, quantity, and unit price are required" },
          { status: 400 }
        );
      }

      // Verify entities exist
      const [product, client, appointment] = await Promise.all([
        prisma.beautyProduct.findFirst({ 
          where: { id: productId, merchantId: storeId, isActive: true } 
        }),
        clientId 
          ? prisma.beautyClient.findFirst({ where: { id: clientId, merchantId: storeId } })
          : Promise.resolve(null),
        appointmentId 
          ? prisma.beautyAppointment.findFirst({ 
              where: { id: appointmentId, merchantId: storeId } 
            })
          : Promise.resolve(null)
      ]);

      if (!product) {
        return NextResponse.json(
          { error: "Product not found or inactive" },
          { status: 404 }
        );
      }

      if (clientId && !client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      if (appointmentId && !appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Check stock availability
      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` },
          { status: 400 }
        );
      }

      const totalPrice = unitPrice * quantity;
      const finalDiscount = discount || 0;
      const finalTax = tax || 0;

      const sale = await prisma.beautyProductSale.create({
        data: {
          merchantId: storeId,
          clientId: client?.id || null,
          productId,
          appointmentId: appointment?.id || null,
          quantity,
          unitPrice,
          totalPrice,
          discount: finalDiscount,
          tax: finalTax,
          soldBy: soldBy || "", // Would come from auth context
          notes,
        },
      });

      // Update product stock
      await prisma.beautyProduct.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      // Update client spending if applicable
      if (client) {
        await prisma.beautyClient.update({
          where: { id: clientId },
          data: { totalSpent: { increment: totalPrice - finalDiscount } },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...sale,
          clientName: client ? `${client.firstName} ${client.lastName}` : "Walk-in",
          productName: product.name,
          productBrand: product.brand,
          finalPrice: totalPrice - finalDiscount + finalTax,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_PRODUCT_SALES_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);