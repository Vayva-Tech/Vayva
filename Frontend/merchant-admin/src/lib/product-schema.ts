import { z } from "zod";
import { ProductServiceType, ProductServiceStatus } from "@vayva/shared";
export const productSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    type: z.nativeEnum(ProductServiceType),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    status: z.nativeEnum(ProductServiceStatus),
    // Retail specific
    searchTags: z.array(z.string()).optional(),
    // Inventory (UI Object)
    inventory: z
        .object({
        enabled: z.boolean(),
        quantity: z.coerce.number().min(0),
        lowStockThreshold: z.coerce.number().optional(),
    })
        .optional(),
    // Service specific
    availability: z
        .object({
        days: z.array(z.string()),
        timeRange: z.string(),
    })
        .optional(),
    // Food specific
    isTodaysSpecial: z.boolean().optional(),
    // Digital specific
    digital: z.object({
        fileUrl: z.string().url().optional(),
        fileSize: z.string().optional(),
        licenseType: z.enum(["Personal", "Commercial"]).optional(),
    }).optional(),
    // Real Estate specific
    realEstate: z.object({
        bedrooms: z.coerce.number().optional(),
        bathrooms: z.coerce.number().optional(),
        sqft: z.coerce.number().optional(),
        propertyType: z.string().optional(),
        amenities: z.array(z.string()).optional(),
    }).optional(),
    // Automotive specific
    automotive: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.coerce.number().optional(),
        vin: z.string().optional(),
        mileage: z.coerce.number().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
    }).optional(),
    // Stay / Hotel specific
    stay: z.object({
        roomType: z.string().optional(),
        maxGuests: z.coerce.number().optional(),
        amenities: z.array(z.string()).optional(),
        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),
    }).optional(),
    // Event specific
    event: z.object({
        date: z.string().optional(),
        venue: z.string().optional(),
        isVirtual: z.boolean().optional(),
        ticketTiers: z.array(z.object({
            name: z.string(),
            price: z.coerce.number()
        })).optional(),
    }).optional(),
    // Additional fields for DB
    handle: z.string().optional(),
});
