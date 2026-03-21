import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const productType = searchParams.get("productType");
        const limit = Number(searchParams.get("limit")) || 50;
        
        // Call backend API to fetch products by store slug
        const result = await apiJson<{
            products: Array<{
                id: string;
                title: string;
                description: string;
                price: number;
                productType: string;
                status: string;
                images?: Array<{ url: string }>;
            }>;
            total: number;
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/${slug}/products?search=${search || ''}&category=${category || ''}&productType=${productType || ''}&limit=${limit}`,
            {
                headers: {},
            }
        );
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/products`,
                operation: "GET_PRODUCTS_BY_SLUG",
                storeId: undefined,
            }
        );
        throw error;
    }
}
