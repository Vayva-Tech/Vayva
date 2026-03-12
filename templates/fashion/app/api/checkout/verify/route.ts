import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { Paystack } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return Response.json(
        { error: 'Reference and order ID are required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING') {
      return Response.json(
        { error: 'Order already processed' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    let paymentResult;
    try {
      paymentResult = await Paystack.verifyTransaction(reference);
    } catch (error) {
      console.error('Paystack verification error:', error);
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });

      return Response.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (paymentResult.data.status !== 'success') {
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });

      return Response.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Verify amount matches
    const expectedAmount = Paystack.formatAmount(order.total, order.currency);
    if (paymentResult.data.amount < expectedAmount) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });

      return Response.json(
        { error: 'Payment amount is insufficient' },
        { status: 400 }
      );
    }

    // Process successful payment
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCESS',
        status: 'CONFIRMED',
        transactionId: reference,
        paymentMethod: 'card',
      },
      include: {
        items: true,
      },
    });

    // Update product inventory
    await Promise.all(
      updatedOrder.items.map(async (item) => {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      })
    );

    // Transform response
    const paymentResponse = {
      id: reference,
      reference,
      status: 'success',
      amount: paymentResult.data.amount,
      currency: paymentResult.data.currency,
      paidAt: paymentResult.data.paid_at,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    };

    return Response.json({
      payment: paymentResponse,
    });
  } catch (error) {
    console.error('Checkout verify error:', error);
    return Response.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}