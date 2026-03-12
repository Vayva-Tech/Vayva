import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError, PaymentStatus } from "@vayva/shared";

export const POST = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const body = await request.json().catch(() => ({}));

    const courseId = String(body?.courseId || "");
    const studentEmail = String(body?.studentEmail || "");
    const studentName = body?.studentName ? String(body.studentName) : null;

    if (!courseId || !studentEmail) {
      return NextResponse.json(
        { error: "Missing required fields", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const course = await db.course.findFirst({
      where: { id: courseId, storeId, isPublished: true },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const amount = Number(course.price);

    const result = await db.$transaction(async (tx: any) => {
      const account = await tx.customerAccount.upsert({
        where: { email: studentEmail },
        update: { firstName: studentName || undefined },
        create: { email: studentEmail, firstName: studentName || undefined },
        select: { id: true },
      });

      const enrollment = await tx.enrollment.upsert({
        where: {
          courseId_studentId: {
            courseId: course.id,
            studentId: account.id,
          },
        },
        update: {
          status: "active",
          lastAccessedAt: new Date(),
        },
        create: {
          courseId: course.id,
          studentId: account.id,
          status: "active",
          progress: 0,
        },
        select: { id: true },
      });

      if (!amount || amount <= 0) {
        return {
          enrollmentId: enrollment.id,
          orderId: null,
          reference: null,
          requiresPayment: false,
        };
      }

      const count = await tx.order.count();
      const orderNumber = count + 1001;
      const refCode = `CRS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const order = await tx.order.create({
        data: {
          storeId,
          refCode,
          orderNumber,
          status: "DRAFT",
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: "UNFULFILLED",
          subtotal: amount,
          total: amount,
          shippingTotal: 0,
          discountTotal: 0,
          tax: 0,
          currency: "NGN",
          source: "STOREFRONT",
          deliveryMethod: "digital",
          paymentMethod: "PAYSTACK",
          customerEmail: studentEmail,
          customerNote: studentName || undefined,
          metadata: {
            type: "COURSE_ENROLLMENT",
            enrollmentId: enrollment.id,
            courseId: course.id,
          },
        },
        select: { id: true, refCode: true },
      });

      return {
        enrollmentId: enrollment.id,
        orderId: order.id,
        reference: order.refCode,
        requiresPayment: true,
      };
    });

    return NextResponse.json(
      { success: true, data: result, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to create enrollment checkout", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
