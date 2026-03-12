import { Job, Worker } from "bullmq";
import { prisma } from "@vayva/db";
import { QUEUES } from "@vayva/shared";
import { logger } from "../lib/logger";

// Simple iCal Parser (Regex based for MVP avoidance of heavy deps, or use node-ical)
function parseIcal(icalData: string) {
    const events: { start: Date, end: Date, summary: string, uid: string }[] = [];
    const lines = icalData.split(/\r\n|\n|\r/);

    let inEvent = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentEvent: Record<string, string> = {};

    for (const line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
            inEvent = true;
            currentEvent = {};
        } else if (line.startsWith("END:VEVENT")) {
            inEvent = false;
            if (currentEvent.dtstart && currentEvent.dtend) {
                events.push({
                    start: parseDate(currentEvent.dtstart),
                    end: parseDate(currentEvent.dtend),
                    summary: currentEvent.summary || "External Booking",
                    uid: currentEvent.uid || crypto.randomUUID()
                });
            }
        } else if (inEvent) {
            if (line.startsWith("DTSTART")) currentEvent.dtstart = line.split(":")[1];
            if (line.startsWith("DTEND")) currentEvent.dtend = line.split(":")[1];
            if (line.startsWith("SUMMARY")) currentEvent.summary = line.split(":")[1];
            if (line.startsWith("UID")) currentEvent.uid = line.split(":")[1];
        }
    }
    return events;
}

function parseDate(dateStr: string) {
    // Basic typical iCal format: 20230101T120000Z or 20230101
    const y = parseInt(dateStr.substring(0, 4));
    const m = parseInt(dateStr.substring(4, 6)) - 1;
    const d = parseInt(dateStr.substring(6, 8));
    
    // Check if time component exists
    if (dateStr.includes("T")) {
        const timePart = dateStr.split("T")[1];
        const h = parseInt(timePart.substring(0, 2));
        const min = parseInt(timePart.substring(2, 4));
        return new Date(Date.UTC(y, m, d, h, min));
    }
    
    return new Date(Date.UTC(y, m, d));
}

export const calendarSyncWorker = new Worker(
    QUEUES.CALENDAR_SYNC_SCHEDULER,
    async (job: Job) => {
        logger.info("Running Calendar Sync Job", { jobId: job.id });
        
        try {
            // Fetch active syncs
            const syncs = await prisma.bookingCalendarSync.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { lastSyncedAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } }, // 1 hour ago
                        { lastSyncedAt: null }
                    ]
                }
            });

            logger.info(`Found ${syncs.length} calendars to sync`);

            for (const sync of syncs) {
                try {
                    logger.info(`Syncing ${sync.name} from ${sync.url}`);
                    const response = await fetch(sync.url);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ICS: ${response.status} ${response.statusText}`);
                    }

                    const icalText = await response.text();
                    const events = parseIcal(icalText);

                    logger.info(`Parsed ${events.length} events from ${sync.name}`);

                    let createdCount = 0;

                    for (const event of events) {
                        // Check duplication
                        const exists = await prisma.booking.findFirst({
                            where: {
                                serviceId: sync.productId,
                                metadata: {
                                    path: ['externalUid'],
                                    equals: event.uid
                                }
                            }
                        });

                        if (!exists) {
                            // Get storeId from product
                            const product = await prisma.product.findUnique({
                                where: { id: sync.productId },
                                select: { storeId: true }
                            });
                            
                            if (!product) {
                                logger.warn(`Product ${sync.productId} not found, skipping event`);
                                continue;
                            }
                            
                            await prisma.booking.create({
                                data: {
                                    storeId: product.storeId,
                                    serviceId: sync.productId,
                                    startsAt: event.start,
                                    endsAt: event.end,
                                    status: "CONFIRMED",
                                    notes: `Imported from ${sync.name}: ${event.summary}`,
                                    metadata: {
                                        externalUid: event.uid,
                                        source: "ICAL_IMPORT",
                                        syncId: sync.id
                                    }
                                }
                            });
                            createdCount++;
                        }
                    }

                    await prisma.bookingCalendarSync.update({
                        where: { id: sync.id },
                        data: {
                            lastSyncedAt: new Date(),
                            syncStatus: "SUCCESS",
                            error: null
                        }
                    });
                    
                    logger.info(`Imported ${createdCount} new bookings for ${sync.name}`);

                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    logger.error(`Failed to sync calendar ${sync.id}`, { error: errorMessage });
                    
                    await prisma.bookingCalendarSync.update({
                        where: { id: sync.id },
                        data: {
                            lastSyncedAt: new Date(),
                            syncStatus: "ERROR",
                            error: errorMessage
                        }
                    });
                }
            }

        } catch (error) {
            logger.error("Global Calendar Sync Failed", error as Error);
            throw error;
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        },
        concurrency: 2,
        lockDuration: 60000,
        stalledInterval: 60000,
        maxStalledCount: 2,
    }
);
