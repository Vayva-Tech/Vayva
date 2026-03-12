import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { hash } from "bcryptjs";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

export const POST = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  try {
    const t = await getTenantFromHost(req.headers.get("host") || undefined);
    if (!t.ok) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: t.slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { email, password, firstName, lastName } = registerSchema.parse(body);

    // Check availability
    const existing = await prisma.customer.findUnique({
      where: { storeId_email: { storeId: store.id, email } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Customer already exists", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const hashedPassword = await hash(password, 10);

    // Create Customer Record
    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        email,
        firstName,
        lastName,
        marketingOptIn: true,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName} ${customer.lastName}`,
        },
        requestId,
      },
      { headers: standardHeaders(requestId) },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }
    if (error instanceof BaseError) throw error;

    logger.error("Registration error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Registration failed", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
