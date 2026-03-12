import { Worker } from "bullmq";
import { prisma, type DispatchJobStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { getRedis } from "@vayva/redis";
import { kwikProvider } from "../lib/providers";
import type { RedisConnection, DeliveryJobData } from "../types";

export function registerDeliveryWorker(connection: RedisConnection): void {
  new Worker<DeliveryJobData>(
    QUEUES.DELIVERY_SCHEDULER,
    async (job) => {
      const { orderId } = job.data;

      const redis = await getRedis();
      const idempotencyKey = `delivery_sched:${orderId}`;
      const exists = await redis.get(idempotencyKey);
      if (exists) return;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            include: {
              addresses: {
                where: { isDefault: true },
                take: 1,
              },
            },
          },
          store: {
            include: { deliverySettings: true },
          },
          items: true,
          shipments: { take: 1 },
        },
      });

      if (!order || !order.storeId) {
        logger.error(`[DELIVERY] Order ${orderId} or associated store not found`, { orderId, app: "worker" });
        return;
      }

      const existingShipment = order.shipments[0] ?? null;
      let address: { name: string; phone: string; address: string; city?: string } | undefined;

      if (existingShipment) {
        address = {
          name: existingShipment.recipientName || "",
          phone: existingShipment.recipientPhone || "",
          address: existingShipment.addressLine1 || "",
          city: existingShipment.addressCity ?? undefined,
        };
      } else if (order.customer?.addresses?.[0]) {
        const addr = order.customer.addresses[0];
        address = {
          name: addr.recipientName || `${order.customer.firstName} ${order.customer.lastName}`,
          phone: addr.recipientPhone || order.customer.phone || "",
          address: addr.addressLine1 || "",
          city: addr.city ?? undefined,
        };
      }

      if (!address || !address.name || !address.phone || !address.address) {
        logger.error(`[DELIVERY] Order ${orderId} missing valid shipping address`, { orderId, app: "worker" });
        return;
      }

      let shipment = existingShipment;
      if (!shipment) {
        shipment = await prisma.shipment.create({
          data: {
            storeId: order.storeId,
            orderId: order.id,
            status: "REQUESTED",
            recipientName: address.name,
            recipientPhone: address.phone,
            addressLine1: address.address,
            addressCity: address.city,
          },
        });
      }

      try {
        const result = await kwikProvider.createJob({
          pickup: {
            name: order.store?.deliverySettings?.pickupName || order.store?.name || "Vayva Store",
            phone: order.store?.deliverySettings?.pickupPhone || "08000000000",
            address: order.store?.deliverySettings?.pickupAddressLine1 || "Lagos, Nigeria",
          },
          dropoff: {
            name: address.name,
            phone: address.phone,
            address: address.address,
          },
          items: order.items.map((i: { title: string; quantity: number }) => ({
            description: i.title,
            quantity: i.quantity,
          })),
        });

        await prisma.dispatchJob.create({
          data: {
            storeId: order.storeId,
            shipmentId: shipment.id,
            carrier: "KWIK",
            providerJobId: result.providerJobId,
            status: result.status as DispatchJobStatus,
            vehicleType: "bike",
          },
        });

        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            trackingUrl: result.trackingUrl,
            externalId: result.providerJobId,
            status: "ACCEPTED",
          },
        });

        await redis.set(idempotencyKey, "1", "EX", 60 * 60 * 24 * 7);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[DELIVERY] Failed to schedule", {
          error: error.message,
          stack: error.stack,
          orderId,
          app: "worker",
        });
        throw err;
      }
    },
    { 
      connection,
      concurrency: 5,
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered delivery worker", { queue: QUEUES.DELIVERY_SCHEDULER, app: "worker" });
}
