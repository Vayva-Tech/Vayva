import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

// GET /api/cart - Get current cart
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const sessionId = searchParams.get("sessionId");

    // Build query params
    const params: Record<string, string> = {};
    if (customerId) params.customerId = customerId;
    if (sessionId) params.sessionId = sessionId;

    // Call backend API
    const response = await apiClient.get<any>('/api/v1/carts', params, { 
      requiresAuth: false,
      useSession: true 
    });

    // Transform backend response to frontend format
    const cart = response.data;
    
    if (!cart) {
      return NextResponse.json({ items: [], total: 0, count: 0 });
    }

    // Calculate totals from backend data
    const items = cart.items?.map((item: any) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        id: item.variant?.product?.id,
        title: item.variant?.product?.title,
        handle: item.variant?.product?.handle,
        image: item.variant?.product?.productImages?.[0]?.url || null,
      },
      variant: {
        id: item.variant?.id,
        sku: item.variant?.sku,
        price: Number(item.variant?.price) || 0,
        compareAtPrice: item.variant?.compareAtPrice,
        title: item.variant?.title,
      },
    })) || [];

    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);

    return NextResponse.json({
      id: cart.id,
      items,
      total,
      count: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      email: cart.email,
      phone: cart.phone,
      recoveryStatus: cart.recoveryStatus,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error("[CART_GET] Error fetching cart:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}

// POST /api/cart - Create or update cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, email, phone, customerId } = body;

    // For session-based carts, get/create session token
    let sessionId: string | undefined;
    if (!customerId) {
      const { cookies } = require('next/headers');
      const cookieStore = await cookies();
      sessionId = cookieStore.get("cart_session")?.value;
      
      if (!sessionId) {
        const { randomUUID } = require('crypto');
        sessionId = randomUUID();
        cookieStore.set("cart_session", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    }

    // Add items one by one using backend API
    // First, get or create cart
    const cartParams: Record<string, string> = {};
    if (customerId) cartParams.customerId = customerId;
    if (sessionId) cartParams.sessionId = sessionId;

    const cartResponse = await apiClient.post<any>('/api/v1/carts', {
      customerId,
      sessionId,
      email,
      phone,
    }, { requiresAuth: false, useSession: !customerId });

    const cart = cartResponse.data;

    // Add each item
    for (const item of items) {
      await apiClient.post<any>(`/api/v1/carts/items`, {
        cartId: cart.id,
        productId: item.productId || item.variantId, // Handle both formats
        variantId: item.variantId,
        quantity: item.quantity,
      }, { requiresAuth: false, useSession: !customerId });
    }

    // Fetch updated cart
    const updatedCartResponse = await apiClient.get<any>(`/api/v1/carts/${cart.id}`, {}, {
      requiresAuth: false,
      useSession: !customerId,
    });

    const updatedCart = updatedCartResponse.data;

    // Transform response
    const cartItems = updatedCart.items?.map((item: any) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        id: item.variant?.product?.id,
        title: item.variant?.product?.title,
        handle: item.variant?.product?.handle,
        image: item.variant?.product?.productImages?.[0]?.url || null,
      },
      variant: {
        id: item.variant?.id,
        sku: item.variant?.sku,
        price: Number(item.variant?.price) || 0,
        compareAtPrice: item.variant?.compareAtPrice,
        title: item.variant?.title,
      },
    })) || [];

    const total = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);

    return NextResponse.json({
      id: updatedCart.id,
      items: cartItems,
      total,
      count: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      email: updatedCart.email,
      phone: updatedCart.phone,
      recoveryStatus: updatedCart.recoveryStatus,
      createdAt: updatedCart.createdAt,
      updatedAt: updatedCart.updatedAt,
    });
  } catch (error) {
    console.error("[CART_POST] Error saving cart:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const sessionId = searchParams.get("sessionId");

    // Get cart first
    const params: Record<string, string> = {};
    if (customerId) params.customerId = customerId;
    if (sessionId) params.sessionId = sessionId;

    const cartResponse = await apiClient.get<any>('/api/v1/carts', params, {
      requiresAuth: false,
      useSession: true,
    });

    if (cartResponse.data?.id) {
      // Clear the cart
      await apiClient.post<any>(`/api/v1/carts/${cartResponse.data.id}/clear`, {}, {
        requiresAuth: false,
        useSession: !customerId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_DELETE] Error clearing cart:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
