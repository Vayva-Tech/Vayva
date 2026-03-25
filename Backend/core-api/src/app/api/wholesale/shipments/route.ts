import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ShipmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "shipped", "in_transit", "delivered", "returned", "failed"]).optional(),
  carrier: z.string().optional(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const ShipmentCreateSchema = z.object({
  orderId: z.string(),
  carrier: z.string().min(1),
  trackingNumber: z.string().min(1),
  shipDate: z.string().datetime().optional(),
  estimatedDeliveryDate: z.string().datetime().optional(),
  actualDeliveryDate: z.string().datetime().optional(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  packageWeight: z.number().positive().optional(),
  packageDimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  specialInstructions: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ShipmentQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        carrier: searchParams.get("carrier"),
        orderId: searchParams.get("orderId"),
        customerId: searchParams.get("customerId"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.carrier && { carrier: parseResult.carrier }),
        ...(parseResult.orderId && { orderId: parseResult.orderId }),
        ...(parseResult.customerId && { 
          order: { customerId: parseResult.customerId } 
        }),
        ...(parseResult.dateFrom && { 
          shipDate: { gte: new Date(parseResult.dateFrom) } 
        }),
        ...(parseResult.dateTo && { 
          shipDate: { lte: new Date(parseResult.dateTo) } 
        }),
      };

      const [shipments, total] = await Promise.all([
        prisma.wholesaleShipment.findMany({
          where: whereClause,
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customer: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
              },
            },
            trackingEvents: {
              select: {
                id: true,
                timestamp: true,
                status: true,
                location: true,
                notes: true,
              },
              orderBy: { timestamp: "desc" },
              take: 5,
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { shipDate: "desc" },
        }),
        prisma.wholesaleShipment.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: shipments,
          meta: {
            page: parseResult.page,
            limit: parseResult.limit,
            total,
            totalPages: Math.ceil(total / parseResult.limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_SHIPMENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch shipments" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ShipmentCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid shipment data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify order exists and belongs to store
      const order = await prisma.wholesaleOrder.findFirst({
        where: { id: parseResult.data.orderId, storeId },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Check if order is in correct status for shipping
      if (order.status !== "processing") {
        return NextResponse.json(
          { error: "Order must be in processing status to create shipment" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdShipment = await prisma.$transaction(async (tx) => {
        // Create the shipment
        const shipment = await tx.wholesaleShipment.create({
          data: {
            storeId,
            orderId: parseResult.data.orderId,
            carrier: parseResult.data.carrier,
            trackingNumber: parseResult.data.trackingNumber,
            shipDate: parseResult.data.shipDate ? new Date(parseResult.data.shipDate) : new Date(),
            estimatedDeliveryDate: parseResult.data.estimatedDeliveryDate 
              ? new Date(parseResult.data.estimatedDeliveryDate) 
              : undefined,
            actualDeliveryDate: parseResult.data.actualDeliveryDate 
              ? new Date(parseResult.data.actualDeliveryDate) 
              : undefined,
            shippingAddress: JSON.stringify(parseResult.data.shippingAddress),
            packageWeight: parseResult.data.packageWeight,
            packageDimensions: parseResult.data.packageDimensions 
              ? JSON.stringify(parseResult.data.packageDimensions) 
              : undefined,
            specialInstructions: parseResult.data.specialInstructions,
            status: "shipped",
          },
        });

        // Update order status to shipped
        await tx.wholesaleOrder.update({
          where: { id_storeId: { id: parseResult.data.orderId, storeId } },
          data: { status: "shipped" },
        });

        // Create initial tracking event
        await tx.wholesaleTrackingEvent.create({
          data: {
            shipmentId: shipment.id,
            status: "shipped",
            location: parseResult.data.shippingAddress.city,
            notes: "Package shipped",
          },
        });

        return shipment;
      });

      logger.info("[WHOLESALE_SHIPMENT_CREATE]", {
        shipmentId: createdShipment.id,
        orderId: parseResult.data.orderId,
        carrier: parseResult.data.carrier,
        trackingNumber: parseResult.data.trackingNumber,
      });

      return NextResponse.json(
        { data: createdShipment },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_SHIPMENT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create shipment" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);