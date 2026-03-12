import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";
import { v4 as uuidv4 } from 'uuid';

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      restaurantId, 
      items, 
      deliveryAddress, 
      deliveryInstructions,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total
    } = body;

    // Validate required fields
    if (!restaurantId || !items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify restaurant exists and is active
    const restaurant = await prisma.store.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Verify all menu items exist and belong to the restaurant
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.product.findMany({
      where: {
        id: { in: menuItemIds },
        storeId: restaurantId,
        status: 'ACTIVE'
      }
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        { error: 'Some menu items are unavailable' },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        storeId: restaurantId,
        customerId: session.user.id,
        orderNumber: `ORDER-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        subtotal: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee || 0),
        tax: new Prisma.Decimal(tax || 0),
        total: new Prisma.Decimal(total),
        deliveryAddress: deliveryAddress,
        deliveryInstructions: deliveryInstructions,
        paymentMethod: paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.menuItemId,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.price),
            total: new Prisma.Decimal(item.price * item.quantity)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Transform response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: parseFloat(order.subtotal.toString()),
      deliveryFee: parseFloat(order.deliveryFee.toString()),
      tax: parseFloat(order.tax.toString()),
      total: parseFloat(order.total.toString()),
      deliveryAddress: order.deliveryAddress,
      deliveryInstructions: order.deliveryInstructions,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.title,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        total: parseFloat(item.total.toString())
      }))
    };

    return NextResponse.json({ order: transformedOrder });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get user's orders
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      customerId: session.user.id
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            logo: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      total: parseFloat(order.total.toString()),
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      restaurant: {
        name: order.store.name,
        logo: order.store.logo
      },
      itemCount: order.items.length,
      firstItem: order.items[0]?.product.title
    }));

    return NextResponse.json({ orders: transformedOrders });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}