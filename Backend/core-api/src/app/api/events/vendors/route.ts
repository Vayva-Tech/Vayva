import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/events/vendors
 * List vendors and logistics for event
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const eventId = searchParams.get("eventId");

      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Event ID is required" },
          { status: 400 }
        );
      }

      // Get all vendors for this event
      const vendors = await prisma.product.findMany({
        where: {
          storeId,
          type: "vendor_service",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        include: {
          lineItems: {
            select: {
              productName: true,
              metadata: true,
            },
            take: 1,
          },
        },
      });

      // Categorize by type
      const catering = vendors.filter((v) => v.metadata?.category === "catering");
      const avEquipment = vendors.filter((v) => v.metadata?.category === "av_equipment");
      const furniture = vendors.filter((v) => v.metadata?.category === "furniture");
      const photography = vendors.filter((v) => v.metadata?.category === "photography");

      // Format vendors
      const formatVendor = (vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.metadata?.category || "general",
        status: vendor.metadata?.status || "pending",
        contactName: vendor.metadata?.contactName,
        contactEmail: vendor.metadata?.contactEmail,
        contactPhone: vendor.metadata?.contactPhone,
        deliveryTime: vendor.metadata?.deliveryTime,
        setupTime: vendor.metadata?.setupTime,
        contractUrl: vendor.metadata?.contractUrl,
        notes: vendor.metadata?.notes,
        price: vendor.price,
        tasks: vendor.metadata?.tasks || [],
      });

      // Get task checklist
      const tasks = await prisma.task.findMany({
        where: {
          storeId,
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        orderBy: { dueDate: "asc" },
      });

      const formattedTasks = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        completed: task.completed,
        assigneeId: task.assigneeId,
      }));

      return NextResponse.json({
        success: true,
        data: {
          totalVendors: vendors.length,
          byCategory: {
            catering: catering.map(formatVendor),
            avEquipment: avEquipment.map(formatVendor),
            furniture: furniture.map(formatVendor),
            photography: photography.map(formatVendor),
            other: vendors
              .filter(
                (v) =>
                  !["catering", "av_equipment", "furniture", "photography"].includes(
                    v.metadata?.category
                  )
              )
              .map(formatVendor),
          },
          allVendors: vendors.map(formatVendor),
          tasks: formattedTasks,
          taskSummary: {
            total: tasks.length,
            completed: tasks.filter((t) => t.completed).length,
            pending: tasks.filter((t) => !t.completed).length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch vendors" },
        { status: 500 }
      );
    }
  }
);
