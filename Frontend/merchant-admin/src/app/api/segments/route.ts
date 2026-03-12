import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { CustomerSegmentationService } from "@/services/segmentation.service";
import { SegmentCriteria } from "@/types/intelligence";
import { logger } from "@/lib/logger";
import { z } from "zod";

const createSegmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  criteria: z.object({
    rfm: z.object({
      recency: z.number().min(1).max(5),
      frequency: z.number().min(1).max(5),
      monetary: z.number().min(1).max(5)
    }),
    behaviors: z.array(z.string()).default([])
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3b82f6"),
  icon: z.string().default("Users")
});

const updateSegmentSchema = createSegmentSchema.partial();

// GET /api/segments - Get all segments or specific segment
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(request.url);
      const segmentId = searchParams.get("id");
      const customerId = searchParams.get("customerId");
      const overview = searchParams.get("overview");

      if (!storeId) {
        return NextResponse.json(
          { error: "Store ID is required" },
          { status: 400 }
        );
      }

    let result;

    if (customerId) {
      // Get segments for a specific customer
      result = await CustomerSegmentationService.getCustomerSegments(customerId);
    } else if (segmentId) {
      // Get customers in a specific segment
      const customers = await CustomerSegmentationService.getSegmentCustomers(segmentId);
      result = { segmentId, customers };
    } else if (overview === "true") {
      // Get segment overview
      result = await CustomerSegmentationService.getSegmentOverview(storeId);
    } else {
      // Get all segments for store
      result = await CustomerSegmentationService.getSegments(storeId);
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[SEGMENTS_GET]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 }
    );
  }
});

// POST /api/segments - Create a new segment or perform RFM analysis
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await request.json();
      const { action } = body;

      if (!storeId) {
        return NextResponse.json(
          { error: "Store ID is required" },
          { status: 400 }
        );
      }

    let result;

    switch (action) {
      case "create": {
        const validated = createSegmentSchema.parse(body);
        result = await CustomerSegmentationService.createSegment(
          storeId,
          validated.name,
          validated.criteria as SegmentCriteria,
          validated.description,
          validated.color,
          validated.icon
        );
        break;
      }

      case "rfm-analysis":
        result = await CustomerSegmentationService.performRFMAnalysis(storeId);
        break;

      case "create-predefined":
        result = await CustomerSegmentationService.createPredefinedSegments(storeId);
        break;

      case "assign-customer": {
        const { customerId, segmentId, score } = body;
        if (!customerId || !segmentId) {
          return NextResponse.json(
            { error: "customerId and segmentId are required" },
            { status: 400 }
          );
        }
        result = await CustomerSegmentationService.assignCustomerToSegment(
          customerId,
          segmentId,
          score || 0
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'create', 'rfm-analysis', 'create-predefined', or 'assign-customer'" },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SEGMENTS_POST]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to process segment request" },
      { status: 500 }
    );
  }
});

// PATCH /api/segments - Update a segment
export const PATCH = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { segmentId, ...updates } = body;

      if (!segmentId) {
        return NextResponse.json(
          { error: "segmentId is required" },
          { status: 400 }
        );
      }

    const validated = updateSegmentSchema.parse(updates);

    const result = await CustomerSegmentationService.updateSegment(
      segmentId,
      validated
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[SEGMENTS_PATCH]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to update segment" },
      { status: 500 }
    );
  }
});

// DELETE /api/segments - Delete a segment or remove customer from segment
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const segmentId = searchParams.get("id");
      const customerId = searchParams.get("customerId");

    if (customerId && segmentId) {
      // Remove customer from segment
      await CustomerSegmentationService.removeCustomerFromSegment(customerId, segmentId);
      return NextResponse.json(
        { message: "Customer removed from segment" },
        { status: 200 }
      );
    }

    if (segmentId) {
      // Delete segment
      await CustomerSegmentationService.deleteSegment(segmentId);
      return NextResponse.json(
        { message: "Segment deleted successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Either segmentId or both customerId and segmentId are required" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("[SEGMENTS_DELETE]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to delete segment" },
      { status: 500 }
    );
  }
});
