import { db } from "@/lib/db";
import { Prisma, type Booking } from "@vayva/db";
import { addMinutes } from "date-fns";
import { CreateServiceData, CreateBookingData, UpdateBookingData, BookingWithDetails } from "@/types/bookings";

export const BookingService = {
    async createServiceProduct(storeId: string, data: CreateServiceData) {
        return await db.product?.create({
            data: {
                storeId,
                title: data.name,
                handle: data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                description: data.description,
                price: new Prisma.Decimal(data.price),
                status: "ACTIVE",
                trackInventory: false,
                productType: "SERVICE",
                metadata: data.metadata as unknown as Prisma.InputJsonValue,
            }
        });
    },
    
    async getBookings(storeId: string, startDate: Date, endDate: Date): Promise<BookingWithDetails[]> {
        const bookings = await db.booking?.findMany({
            where: {
                storeId,
                startsAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                service: true,
                customer: true
            },
            orderBy: {
                startsAt: "asc"
            }
        });
        return bookings as BookingWithDetails[];
    },
    
    async createBooking(storeId: string, data: CreateBookingData) {
        const service = await db.product?.findUnique({ where: { id: data.serviceId } });
        if (!service)
            throw new Error("Service not found");
        let endsAt = data.endsAt;
        if (!endsAt) {
            const meta = service.metadata as Record<string, unknown>;
            const duration = Number(meta?.durationMinutes) || 60;
            endsAt = addMinutes(new Date(data.startsAt), duration);
        }
        
        const overlap = await db.booking?.findFirst({
            where: {
                storeId,
                status: "CONFIRMED",
                OR: [
                    {
                        startsAt: { lte: data.startsAt },
                        endsAt: { gt: data.startsAt }
                    },
                    {
                        startsAt: { lt: endsAt },
                        endsAt: { gte: endsAt }
                    }
                ]
            }
        });
        if (overlap) {
            throw new Error("Time slot unavailable");
        }
        
        let customerId = data.customerId;
        if (!customerId && data.customerEmail) {
            const existing = await db.customer?.findUnique({
                where: { storeId_email: { storeId, email: data.customerEmail } }
            });
            if (existing) {
                customerId = existing.id;
            }
            else {
                const newCustomer = await db.customer?.create({
                    data: {
                        storeId,
                        email: data.customerEmail,
                        firstName: data.customerName?.split(" ")[0] || "Guest",
                        lastName: data.customerName?.split(" ").slice(1).join(" ") || "",
                    }
                });
                customerId = newCustomer.id;
            }
        }
        return await db.booking?.create({
            data: {
                storeId,
                serviceId: data.serviceId,
                customerId,
                startsAt: data.startsAt,
                endsAt: endsAt as Date,
                status: "CONFIRMED",
                notes: data.notes
            }
        });
    },
    
    async updateBooking(storeId: string, bookingId: string, data: UpdateBookingData) {
        const booking = await db.booking?.findFirst({
            where: { id: bookingId, storeId }
        });
        if (!booking)
            throw new Error("Booking not found");
        return await db.booking?.update({
            where: { id: bookingId },
            data: data as Prisma.BookingUpdateInput,
        });
    },
    
    async deleteBooking(storeId: string, bookingId: string) {
        const booking = await db.booking?.findFirst({
            where: { id: bookingId, storeId }
        });
        if (!booking)
            throw new Error("Booking not found");
        return await db.booking?.delete({
            where: { id: bookingId }
        });
    },
    
    async updateBookingStatus(bookingId: string, status: Booking["status"]) {
        return await db.booking?.update({
            where: { id: bookingId },
            data: { status }
        });
    }
};
