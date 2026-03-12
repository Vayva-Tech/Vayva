import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        sku: item.sku,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          images: item.product.images.length > 0 ? item.product.images : [item.product.imageUrl].filter(Boolean),
          category: item.product.categoryId,
        } : null,
      })),
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      notes: order.notes,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return Response.json({
      order: transformedOrder,
    });
  } catch (error) {
    console.error('Order detail API error:', error);
    return Response.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}