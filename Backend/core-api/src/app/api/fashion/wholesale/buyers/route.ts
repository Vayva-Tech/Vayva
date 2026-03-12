import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { wholesale } from "@vayva/industry-fashion";

const RegisterBuyerSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
});

const ApproveBuyerSchema = z.object({
  buyerId: z.string().uuid(),
  creditLimit: z.number().min(0),
  netTerms: z.enum(['net30', 'net60', 'cod']),
});

// POST /api/fashion/wholesale/buyers - Register a new wholesale buyer
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = RegisterBuyerSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const buyer = await wholesale.registerBuyer(storeId, result.data);

      return NextResponse.json(
        { buyer },
        { status: 201, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale buyer registration error:", error);
      return NextResponse.json(
        { error: "Failed to register buyer" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// PATCH /api/fashion/wholesale/buyers - Approve a wholesale buyer
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = ApproveBuyerSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { buyerId, creditLimit, netTerms } = result.data;
      const buyer = await wholesale.approveBuyer(buyerId, creditLimit, netTerms);

      return NextResponse.json(
        { buyer },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale buyer approval error:", error);
      return NextResponse.json(
        { error: "Failed to approve buyer" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
