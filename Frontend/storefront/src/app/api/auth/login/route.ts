import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { compare } from "bcryptjs";
import { reportError } from "@/lib/error";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const POST = withStorefrontAPI(async (req: any, ctx: any) => {
  const { requestId } = ctx;
  let email: string | undefined;
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
    const parsed = loginSchema.parse(body);
    email = parsed.email;
    const { password } = parsed;

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { storeId_email: { storeId: store.id, email } },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials", requestId },
        { status: 401, headers: standardHeaders(requestId) },
      );
    }

    // Verify password
    const isValid = await compare(password, customer.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials", requestId },
        { status: 401, headers: standardHeaders(requestId) },
      );
    }

    // Return success
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

    reportError(error, { route: "POST /api/auth/login", email, requestId });
    logger.error("Login error", {
      requestId,
      email,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
