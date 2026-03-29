import { api } from '@/lib/api-client';
import { addMinutes } from "date-fns";
import { CreateServiceData, CreateBookingData, UpdateBookingData, BookingWithDetails } from "@/types/bookings";

export const BookingService = {
    async createServiceProduct(storeId: string, data: CreateServiceData) {
        const response = await api.post('/services', {
            storeId,
            name: data.name,
            description: data.description,
            price: data.price,
            productType: "SERVICE",
            metadata: data.metadata,
        });
        return response.data;
    },
    
    async getBookings(storeId: string, startDate: Date, endDate: Date): Promise<BookingWithDetails[]> {
        const response = await api.get('/bookings', {
            storeId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        return response.data || [];
    },
    
    async createBooking(storeId: string, data: CreateBookingData) {
        const response = await api.post('/bookings', {
            storeId,
            serviceId: data.serviceId,
            customerId: data.customerId,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
            notes: data.notes,
        });
        return response.data;
    },
    
    async updateBooking(storeId: string, bookingId: string, data: UpdateBookingData) {
        const response = await api.patch(`/bookings/${bookingId}`, data);
        return response.data;
    },
    
    async deleteBooking(storeId: string, bookingId: string) {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data;
    },
    
    async updateBookingStatus(bookingId: string, status: string) {
        const response = await api.patch(`/bookings/${bookingId}/status`, { status });
        return response.data;
    }
};
