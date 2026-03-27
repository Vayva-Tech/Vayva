import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Call backend products endpoint
    const response = await apiClient.publicGet<any>(`/api/v1/products/${productId}`);

    const product = response.data;

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const publicProduct = {
      id: product.id,
      name: product.title,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      images: product.productImages
        ?.sort((a: any, b: any) => a.position - b.position)
        .map((img: any) => img.url) || [],
      handle: product.handle,
      options: product.options || [],
      variants: product.variants || [],
      trackInventory: product.trackInventory,
      stockLevel: product.stockLevel || 0,
    };

    return NextResponse.json(publicProduct);
  } catch (error) {
    console.error("[PRODUCT_DETAIL] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
