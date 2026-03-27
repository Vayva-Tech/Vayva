/**
 * Fashion Customers API
 * GET /api/fashion/customers - List customers
 * POST /api/fashion/customers - Create customer
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");

    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ data: customers, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion customers", error);
    return NextResponse.json(
      { error: "Failed to fetch customers", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address
      }
    });

    logger.info("Fashion customer created", { customerId: customer.id });
    return NextResponse.json({ data: customer, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion customer", error);
    return NextResponse.json(
      { error: "Failed to create customer", success: false },
      { status: 500 }
    );
  }
}
