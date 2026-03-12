import { Job, Worker } from "bullmq";
import { prisma } from "@vayva/db";
import { QUEUES } from "@vayva/shared";
import { logger } from "../lib/logger";

const ABANDONED_THRESHOLD_HOURS = 1;
const NOTIFICATION_WINDOW_HOURS = 24;

// WhatsApp service URL from environment
const WHATSAPP_SERVICE_URL = process.env.SERVICE_URL_WHATSAPP || "http://localhost:3005";

export const cartRecoveryWorker = new Worker(
    QUEUES.CART_RECOVERY_SCHEDULER,
    async (job: Job) => {
        logger.info("Running Cart Recovery Job", { jobId: job.id });

        try {
            const thresholdTime = new Date();
            thresholdTime.setHours(thresholdTime.getHours() - ABANDONED_THRESHOLD_HOURS);

            const staleCarts = await prisma.cart.findMany({
                where: {
                    updatedAt: { lt: thresholdTime },
                    createdAt: { gt: new Date(Date.now() - NOTIFICATION_WINDOW_HOURS * 3600 * 1000) },
                    recoveryStatus: "NONE",
                    OR: [
                        { email: { not: null } },
                        { phone: { not: null } }
                    ],
                    items: { some: {} }
                },
                include: {
                    items: true
                },
                take: 50
            });

            if (staleCarts.length === 0) {
                logger.info("No abandoned carts found");
                return;
            }

            logger.info(`Found ${staleCarts.length} stale carts`);

            for (const cart of staleCarts) {
                if (cart.phone) {
                    // Send WhatsApp recovery message via Evolution API
                    try {
                        const checkoutUrl = cart.checkoutUrl || `https://vayva.shop/checkout/${cart.id}`;
                        const itemsList = cart.items.map((item: any) => `${item.quantity}x ${item.name || 'Product'}`).join(", ");
                        
                        await fetch(`${WHATSAPP_SERVICE_URL}/v1/whatsapp/send-message`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                to: cart.phone,
                                text: `Hi! You left items in your cart: ${itemsList}. Complete your order here: ${checkoutUrl}`,
                                template: "cart_recovery"
                            })
                        });
                        
                        logger.info(`Recovery WhatsApp sent to ${cart.phone}`);
                    } catch (waError) {
                        logger.error(`Failed to send WhatsApp to ${cart.phone}`, waError as Error);
                        // Continue to mark as attempted even if WhatsApp fails
                    }

                    await prisma.cart.update({
                        where: { id: cart.id },
                        data: { recoveryStatus: "SENT" }
                    });
                    logger.info(`Recovery marked as sent for cart ${cart.id}`);
                }
            }

        } catch (error) {
            logger.error("Cart Recovery Failed", error as Error);
            throw error;
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        },
        concurrency: 3,
        lockDuration: 30000,
        stalledInterval: 30000,
        maxStalledCount: 2,
    }
);
