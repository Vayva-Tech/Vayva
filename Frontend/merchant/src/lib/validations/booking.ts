import { z } from "zod";

export const BookingCreateSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});

export const ServiceCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0),
  metadata: z.record(z.unknown()).optional(),
});
