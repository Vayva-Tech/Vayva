import { prisma } from "@vayva/db";
export class OutboxWorker {
    static async processOutbox() {
        // Fetch pending events
        const events = await prisma.outboxEvent.findMany({
            where: {
                status: "PENDING",
                OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
            },
            take: 100,
            orderBy: { createdAt: "asc" },
        });
        for (const event of events) {
            await OutboxWorker.processEvent(event);
        }
    }
    static async processEvent(event) {
        // Mark as processing
        await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: "PROCESSING" },
        });
        try {
            // Route to appropriate handler based on type
            switch (event.type) {
                case "whatsapp.send":
                    // await WhatsAppService.send(event.payload);
                    break;
                case "webhook.deliver":
                    // await WebhookService.deliver(event.payload);
                    break;
                case "notification.send":
                    // await NotificationService.send(event.payload);
                    break;
                default:
                    console.warn(`Unknown outbox event type: ${event.type}`);
            }
            // Mark as processed
            await prisma.outboxEvent.update({
                where: { id: event.id },
                data: { status: "PROCESSED" },
            });
        }
        catch (_error) {
            // Mark as failed and schedule retry
            const nextRetryAt = new Date(Date.now() + 60000); // 1 minute
            await prisma.outboxEvent.update({
                where: { id: event.id },
                data: {
                    status: "FAILED",
                    nextRetryAt,
                },
            });
        }
    }
}
