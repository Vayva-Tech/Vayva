import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface SectionConfig {
  featured?: {
    mode?: string;
    autoStrategy?: string;
    limit?: number;
    productIds?: string[];
  };
  [key: string]: unknown;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Call backend API to fetch featured products configuration
    const result = await apiJson<{
      sectionConfig?: SectionConfig;
      featured?: {
        mode?: string;
        autoStrategy?: string;
        limit?: number;
        productIds?: string[];
      };
      products?: Array<{
        id: string;
        title: string;
        price: number;
        image?: string;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/storefront/${slug}/featured`,
      {
        headers: {},
      }
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/featured`,
        operation: "GET_FEATURED",
        storeId: undefined,
      }
    );
    throw error;
  }
}
