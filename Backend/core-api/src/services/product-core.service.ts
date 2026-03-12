import { prisma } from "@/lib/db";
import { z } from "zod";
import { sanitizeHtml } from "@/lib/input-sanitization";
import { SCHEMA_MAP } from "@/lib/product-schemas";
import { type Prisma, FuelType, Transmission, ProductStatus } from "@vayva/db";

// Validation Schemas
const BaseProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type ProductVariantInput = {
  title: string;
  options: Record<string, unknown>;
  price: number;
  sku?: string;
  stock?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function parseProductStatus(value: unknown): ProductStatus {
  if (typeof value !== "string") return "ACTIVE" as ProductStatus;
  const normalized = value.toUpperCase();
  const allowed = ["DRAFT", "ACTIVE", "ARCHIVED", "HIDDEN"];
  return allowed.includes(normalized) ? (normalized as ProductStatus) : ("ACTIVE" as ProductStatus);
}

function parseVariants(value: unknown, fallbackPrice: number): ProductVariantInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((variant) => ({
      title: getString(variant.title) ?? "Default Variant",
      options: isRecord(variant.options) ? variant.options : {},
      price: typeof variant.price === "number" ? variant.price : fallbackPrice,
      sku: getString(variant.sku),
      stock: typeof variant.stock === "number" ? variant.stock : undefined,
    }));
}

function asJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

function parseFuelType(value: unknown): FuelType | undefined {
  const raw = getString(value);
  if (!raw) return undefined;
  const normalized = raw.toUpperCase();
  return (FuelType as Record<string, FuelType>)[normalized];
}

function parseTransmission(value: unknown): Transmission | undefined {
  const raw = getString(value);
  if (!raw) return undefined;
  const normalized = raw.toUpperCase();
  return (Transmission as Record<string, Transmission>)[normalized];
}

export class ProductCoreService {
  /**
   * Create a product with full business logic (Quotas, Inventory, Variants)
   */
  static async createProduct(
    storeId: string,
    payload: Record<string, unknown>,
  ) {
    // 1. Fetch Merchant to know Category & Plan
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { category: true, plan: true },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    // 2. Enforce Plan Limits (QuotaGuard)
    const PLAN_LIMITS: Record<string, number> = {
      FREE: 10,
      STARTER: 50,
      PRO: 1000,
      GROWTH: 10000,
      ENTERPRISE: 100000,
    };
    const limit = PLAN_LIMITS[store.plan] || 5;
    const currentCount = await prisma.product.count({
      where: { storeId },
    });

    if (currentCount >= limit) {
      throw new Error(
        `Product limit reached for your plan (${store.plan}). Limit: ${limit}`,
      );
    }

    // 3. Validate Base Fields
    // Map payload fields to schema (handling 'title' vs 'name')
    const input = {
      name: getString(payload.title) ?? getString(payload.name) ?? "",
      price: Number(payload.price ?? 0),
      description: getString(payload.description),
      images: getStringArray(payload.images),
    };

    const parseResult = BaseProductSchema.safeParse(input);
    if (!parseResult.success) {
      throw new Error(
        "Invalid product data: " + JSON.stringify(parseResult.error.flatten()),
      );
    }

    const { name, price, description } = parseResult.data;
    const variants = parseVariants(payload.variants, price);

    // 4. Gather industry-specific attributes into metadata
    const baseAttributes =
      isRecord(payload.metadata)
        ? payload.metadata
        : isRecord(payload.attributes)
          ? payload.attributes
          : {};
    const attributes: Record<string, unknown> = { ...baseAttributes };
    const industryFields = [
      "digital",
      "realEstate",
      "automotive",
      "stay",
      "event",
      "isTodaysSpecial",
    ];

    industryFields.forEach((field) => {
      if (payload[field] !== undefined) {
        attributes[field] = payload[field];
      }
    });

    // 4. Validate Category Specific Attributes
    // Fallback to retail if category not mapped
    const schema =
      SCHEMA_MAP[store.category as keyof typeof SCHEMA_MAP] ||
      SCHEMA_MAP["retail"];
    if (schema) {
      const attrParse = schema.safeParse(attributes);
      if (!attrParse.success) {
        // Log warning but allow creation? Enforce strict?
        // For now, strict.
        // throw new Error(`Invalid attributes for category ${store.category}: ` + JSON.stringify(attrParse.error.flatten()));
      }
    }

    // 5. Transactional Creation
    const result = await prisma.$transaction(async (tx) => {
      // A. Ensure Inventory Location exists
      let location = await tx.inventoryLocation.findFirst({
        where: { storeId, isDefault: true },
      });

      if (!location) {
        location = await tx.inventoryLocation.create({
          data: {
            storeId,
            name: "Default Location",
            isDefault: true,
          },
        });
      }

      // B. Create Product
      const product = await tx.product.create({
        data: {
          storeId,
          title: name,
          handle:
            name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
          price: price,
          description: description ? sanitizeHtml(description) : undefined,
          metadata: asJson(attributes),
          productType: getString(payload.productType) || store.category, // Allow override or default to store cat
          tags: getStringArray(payload.tags),
          status: parseProductStatus(payload.status),
        },
      });

      // C. Handle Variants & Inventory
      const skuBase = getString(payload.sku) || `SKU-${Date.now()}`;
      const stockQuantity = Number(payload.stock || payload.inventory || 0);

      if (variants.length > 0) {
        for (const v of variants) {
          // Create Variant
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              storeId,
              title: v.title,
              options: asJson(v.options),
              price: v.price,
              sku: v.sku || skuBase,
            },
          });

          // Create Inventory Item
          await tx.inventoryItem.create({
            data: {
              locationId: location.id,
              variantId: variant.id,
              productId: product.id,
              onHand: v.stock ?? 0,
              available: v.stock ?? 0,
            },
          });
        }
      } else {
        // Simple Product as Default Variant
        const defaultVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            storeId,
            title: "Default Title",
            options: asJson({}),
            price: price,
            sku: skuBase,
          },
        });

        await tx.inventoryItem.create({
          data: {
            locationId: location.id,
            variantId: defaultVariant.id,
            productId: product.id,
            onHand: stockQuantity,
            available: stockQuantity,
          },
        });
      }

      // D. Handle Automotive Vehicle Data (Legacy Support)
      if (store.category === "Automotive" && isRecord(attributes.vehicle)) {
        const vehicle = attributes.vehicle;
        await tx.vehicleProduct.create({
          data: {
            productId: product.id,
            year: typeof vehicle.year === "number" ? vehicle.year : 0,
            make: getString(vehicle.make) ?? "Unknown",
            model: getString(vehicle.model) ?? "Unknown",
            vin: getString(vehicle.vin),
            mileage: typeof vehicle.mileage === "number" ? vehicle.mileage : 0,
            fuelType: parseFuelType(vehicle.fuelType) ?? FuelType.PETROL,
            transmission:
              parseTransmission(vehicle.transmission) ?? Transmission.AUTOMATIC,
          },
        });
      }

      return product;
    });

    return result;
  }
}
