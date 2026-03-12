import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { wholesale } from "@vayva/industry-fashion";

const CreateOrderSchema = z.object({
  buyerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
  })),
  terms: z.enum(['net30', 'net60', 'cod']),
  notes: z.string().optional(),
});

const ApproveOrderSchema = z.object({
  orderId: z.string().uuid(),
});

// GET /api/fashion/wholesale/orders - Get pending orders
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (_req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const orders = await wholesale.getPendingOrders(storeId);

      return NextResponse.json(
        { orders },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale orders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/fashion/wholesale/orders - Create a wholesale order
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = CreateOrderSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const order = await wholesale.createOrder(storeId, result.data);

      return NextResponse.json(
        { order },
        { status: 201, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale order creation error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// PATCH /api/fashion/wholesale/orders - Approve a wholesale order
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = ApproveOrderSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { orderId } = result.data;
      const order = await wholesale.approveOrder(orderId);

      return NextResponse.json(
        { order },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale order approval error:", error);
      return NextResponse.json(
        { error: "Failed to approve order" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
