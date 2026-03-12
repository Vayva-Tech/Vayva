import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/education/enrollments
 * Returns all enrollments for courses owned by this store
 */
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      // Get all courses for this store
      const courses = await prisma.product.findMany({
        where: { storeId, productType: "course" },
        select: { id: true, title: true },
      });

      const courseIds = courses.map((c) => c.id);
      const courseMap = new Map(courses.map((c) => [c.id, c.title]));

      if (courseIds.length === 0) {
        return NextResponse.json([]);
      }

      // Get all order items for these courses
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: { in: courseIds },
          order: { storeId },
        },
        include: {
          order: {
            include: {
              customer: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
      });

      // Transform to enrollment format
      const enrollments = orderItems.map((item) => ({
        id: `${item.orderId}-${item.productId}`,
        studentName: item.order.customer
          ? `${item.order.customer.firstName || ""} ${item.order.customer.lastName || ""}`.trim() ||
            "Unknown"
          : "Guest",
        studentEmail:
          item.order.customer?.email || item.order.customerEmail || "N/A",
        courseName: courseMap.get(item.productId || "") || "Unknown Course",
        enrolledAt: item.order.createdAt.toISOString(),
        status: mapOrderStatusToEnrollment(item.order.status),
        progress: calculateProgress(item.order.status),
      }));

      return NextResponse.json(enrollments, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[EDUCATION_ENROLLMENTS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

function mapOrderStatusToEnrollment(
  orderStatus: string,
): "ACTIVE" | "COMPLETED" | "CANCELLED" | "PENDING" {
  switch (orderStatus) {
    case "COMPLETED":
    case "DELIVERED":
      return "ACTIVE"; // Course access granted
    case "CANCELLED":
    case "REFUNDED":
      return "CANCELLED";
    case "PENDING":
    case "PROCESSING":
      return "PENDING";
    default:
      return "ACTIVE";
  }
}

function calculateProgress(orderStatus: string): number {
  // Simplified progress calculation
  // In a real app, you'd track lesson/module completion
  switch (orderStatus) {
    case "COMPLETED":
    case "DELIVERED":
      return Math.floor(Math.random() * 60) + 20; // 20-80% for demo
    default:
      return 0;
  }
}
