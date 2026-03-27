import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface SavePaymentMethodRequest {
  token: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string;
  accountNumber?: string;
  isDefault?: boolean;
}

// POST /api/payment-methods - Save a new payment method
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = parsedBody as Record<string, unknown>;
      
      const token = typeof body.token === 'string' ? body.token : undefined;
      const last4 = typeof body.last4 === 'string' ? body.last4 : undefined;
      const brand = typeof body.brand === 'string' ? body.brand : undefined;
      const expiryMonth = typeof body.expiryMonth === 'number' ? body.expiryMonth : undefined;
      const expiryYear = typeof body.expiryYear === 'number' ? body.expiryYear : undefined;
      const bankName = typeof body.bankName === 'string' ? body.bankName : undefined;
      const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber : undefined;
      const isDefault = typeof body.isDefault === 'boolean' ? body.isDefault : false;

      if (!token || !last4 || !brand) {
        return NextResponse.json({ 
          error: "Token, last4, and brand are required" 
        }, { status: 400 });
      }

      // Get store owner
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { ownerId: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      // If this should be default, unset other defaults
      if (isDefault) {
        await prisma.savedPaymentMethod.updateMany({
          where: {
            storeId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Create saved payment method
      const paymentMethod = await prisma.savedPaymentMethod.create({
        data: {
          storeId,
          userId: store.ownerId,
          token,
          last4,
          brand,
          expiryMonth: expiryMonth || 0,
          expiryYear: expiryYear || 0,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          isDefault,
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info("[PAYMENT_METHOD_SAVED]", {
        storeId,
        paymentMethodId: paymentMethod.id,
        brand,
        last4,
        isDefault,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: paymentMethod.id,
          token: paymentMethod.token,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
          expiryMonth: paymentMethod.expiryMonth,
          expiryYear: paymentMethod.expiryYear,
          bankName: paymentMethod.bankName,
          accountNumber: paymentMethod.accountNumber,
          isDefault: paymentMethod.isDefault,
          createdAt: paymentMethod.createdAt,
        },
        message: "Payment method saved successfully",
      });
    } catch (error: unknown) {
      logger.error("[SAVE_PAYMENT_METHOD_ERROR]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

// GET /api/payment-methods - List saved payment methods
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const paymentMethods = await prisma.savedPaymentMethod.findMany({
        where: {
          storeId,
          status: "ACTIVE",
        },
        orderBy: [
          { isDefault: "desc" }, // Default first
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          token: true,
          last4: true,
          brand: true,
          expiryMonth: true,
          expiryYear: true,
          bankName: true,
          accountNumber: true,
          isDefault: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: paymentMethods,
        count: paymentMethods.length,
      });
    } catch (error: unknown) {
      logger.error("[GET_PAYMENT_METHODS_ERROR]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
