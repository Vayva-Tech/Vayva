import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// Order item validation schema
const orderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  name: z.string().min(1).max(200),
});

// Address validation schema
const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  phone: z.string().min(10).max(20).optional(),
});

// Order creation validation schema
const orderCreateSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["paystack", "flutterwave", "cod", "wallet"]),
  note: z.string().max(1000).optional(),
  shippingCost: z.number().min(0).optional(),
});

// Order query validation schema
const orderQuerySchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  limit: z.coerce?.number().int().min(1).max(200).default(50),
  offset: z.coerce?.number().int().min(0).default(0),
  search: z.string().max(200).optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// GET /api/orders - Get all orders for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Validate query parameters
      const queryValidation = orderQuerySchema.safeParse({
        status: searchParams.get("status"),
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset"),
        search: searchParams.get("search"),
        customerId: searchParams.get("customerId"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      if (!queryValidation.success) {
        return NextResponse.json(
          { success: false, error: "Invalid query parameters", details: queryValidation.error?.format() },
          { status: 400 }
        );
      }

      const { status, limit, offset, search, customerId, dateFrom, dateTo } = queryValidation.data;

      const where: Record<string, unknown> = { storeId };
      if (status) {where.status = status;
      }

      // Forward to Backend API
      const queryParams = new URLSearchParams();
      if (limit) queryParams.set("limit", limit.toString());
      if (offset) queryParams.set("offset", offset.toString());
      if (status) queryParams.set("status", status);
      if (search) queryParams.set("search", search);
      if (customerId) queryParams.set("customerId", customerId);
      if (dateFrom) queryParams.set("dateFrom", dateFrom);
      if (dateTo) queryParams.set("dateTo", dateTo);

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/orders?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch orders" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch orders" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[ORDERS_GET_ERROR] Failed to fetch orders", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch orders" },
        { status: 500 }
      );
    }
  }
);

// POST /api/orders - Create a new order
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validationResult = orderCreateSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { success: false, error: "Invalid order data", details: validationResult.error?.format() },
          { status: 400 }
        );
      }

      const orderData = validationResult.data;

      // Forward to Backend API to create order
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create order" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create order" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[ORDERS_POST_ERROR] Failed to create order", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create order" },
        { status: 500 }
      );
    }
  }
);
