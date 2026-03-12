import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// Customer creation validation schema
const customerCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(10).max(20).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const customerQuerySchema = z.object({
  limit: z.coerce?.number().int().min(1).max(200).default(50),
  offset: z.coerce?.number().int().min(0).default(0),
  search: z.string().max(200).optional(),
});

// GET /api/customers - Get all customers for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Validate query parameters
      const queryValidation = customerQuerySchema.safeParse({
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset"),
        search: searchParams.get("search"),
      });

      if (!queryValidation.success) {
        return NextResponse.json(
          { success: false, error: "Invalid query parameters", details: queryValidation.error?.format() },
          { status: 400 }
        );
      }

      const { limit, offset, search } = queryValidation.data;

      // Forward to Backend API
      const queryParams = new URLSearchParams();
      if (limit) queryParams.set("limit", limit.toString());
      if (offset) queryParams.set("offset", offset.toString());
      if (search) queryParams.set("search", search);

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/customers?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch customers" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch customers" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[CUSTOMERS_GET_ERROR] Failed to fetch customers", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch customers" },
        { status: 500 }
      );
    }
  }
);

// POST /api/customers - Create a new customer
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validationResult = customerCreateSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { success: false, error: "Invalid customer data", details: validationResult.error?.format() },
          { status: 400 }
        );
      }

      const customerData = validationResult.data;

      // Forward to Backend API to create customer
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(customerData),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create customer" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create customer" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[CUSTOMERS_POST_ERROR] Failed to create customer", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create customer" },
        { status: 500 }
      );
    }
  }
);
