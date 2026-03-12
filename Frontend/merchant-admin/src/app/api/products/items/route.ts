import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { sanitizeText, sanitizeHtml, sanitizeNumber, sanitizeUrl } from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (request: NextRequest, { storeId }: APIContext) => {
    try {
        const { searchParams } = new URL(request.url);
        // Parse query parameters with ProductListRequest type
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        // Build where clause with proper typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any>= { storeId };
        if (status && status !== "ALL") {
            where.status = String(status);
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                include: {
                    inventoryItems: true
                }
            }),
            prisma.product.count({ where })
        ]);
        const formattedProducts = products.map((product) => {
            const totalQuantity =
                product.inventoryItems?.reduce(
                    (sum: number, item: { available?: number | null }) => sum + Number(item?.available ?? 0),
                    0
                ) || 0;
            return {
                id: product.id,
                merchantId: product.storeId,
                type: "RETAIL",
                name: product.title,
                description: product.description || "",
                price: Number(product.price),
                currency: "NGN",
                status: product.status,
                inventory: {
                    enabled: product.trackInventory,
                    quantity: totalQuantity,
                },
                itemsSold: 0,
                createdAt: product.createdAt.toISOString(),
            };
        });
        return NextResponse.json({
            data: formattedProducts,
            meta: {
                total,
                limit,
                offset
            }
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[PRODUCTS_ITEMS_GET] Failed to fetch products", { storeId, error });
        return NextResponse.json({
            data: [],
            meta: {
                total: 0,
                limit: 0,
                offset: 0,
            },
            error: "Failed to fetch products",
        }, { status: 500 });
    }
});
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (request: NextRequest, { storeId, user }: APIContext) => {
    try {
        const userId = user.id;
        const body = await request.json();
        // Comprehensive input sanitization
        const sanitizedTitle = sanitizeText(body.title || '');
        const sanitizedDescription = sanitizeHtml(body.description || "");
        const sanitizedPrice = sanitizeNumber(body.price || 0, { min: 0, max: 100000000, decimals: 2 });
        const sanitizedSku = body.sku ? sanitizeText(body.sku) : undefined;
        // Validate required fields
        if (!sanitizedTitle || !sanitizedPrice) {
            return NextResponse.json({ error: "Product title and price are required" }, { status: 400 });
        }
        // Sanitize images if provided
        const metaImages = ((body.metadata as Record<string, unknown>)?.images || []) as Array<Record<string, unknown>>;
        const sanitizedImages = metaImages.map((img: Record<string, unknown>) => ({
            url: sanitizeUrl(typeof img.url === "string" ? img.url : "") || "",
            position: sanitizeNumber(img.position, { min: 0, max: 100 }) || 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })).filter((img: any) => img.url) || [];
        const product = await prisma.product.create({
            data: {
                storeId,
                title: sanitizedTitle,
                description: sanitizedDescription,
                handle: body.handle ? sanitizeText(body.handle) :
                    (sanitizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
                        "-" +
                        Math.random().toString(36).substring(2, 7)),
                price: sanitizedPrice,
                status: body.status === "ACTIVE" || body.status === "DRAFT" ? body.status : "DRAFT",
                productType: body.productType ? sanitizeText(body.productType) : undefined,
                sku: sanitizedSku,
                trackInventory: body.trackInventory ?? true,
                productImages: sanitizedImages.length > 0 ? {
                    create: sanitizedImages
                } : undefined,
            },
            include: {
                productImages: true,
            }
        });
        // Audit Log
        await logAuditEvent(storeId, userId, AuditEventType.PRODUCT_CREATED, {
            targetType: "PRODUCT",
            targetId: product.id,
            meta: {
                name: product.title,
                price: Number(product.price),
            }
        });
        return NextResponse.json(product);
    }
    catch (error) {
        logger.error("[PRODUCTS_ITEMS_POST] Failed to create product", { storeId, error });
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
});
