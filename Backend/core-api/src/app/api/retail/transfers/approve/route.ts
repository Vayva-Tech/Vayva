import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/retail/transfers/approve
 * Approve/reject inventory transfer requests
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transferId, action, notes } = body;

    if (!transferId || !action) {
      return NextResponse.json(
        { error: 'Transfer ID and action required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const transfer = await prisma.inventoryTransfer.findUnique({
      where: { id: transferId },
      include: {
        fromStore: true,
        toStore: true,
        items: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      );
    }

    if (transfer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Transfer is not pending approval' },
        { status: 400 }
      );
    }

    // Update transfer status
    const updatedTransfer = await prisma.inventoryTransfer.update({
      where: { id: transferId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: new Date(),
        approvedBy: session.user.id,
        rejectionReason: action === 'reject' ? notes : null,
      },
    });

    // If approved, update inventory levels
    if (action === 'approve') {
      await Promise.all(
        transfer.items.map(async (item) => {
          // Decrease from source store
          await prisma.storeInventory.update({
            where: {
              storeId_productId: {
                storeId: transfer.fromStoreId,
                productId: item.productId,
              },
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });

          // Increase at destination store
          const destInventory = await prisma.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: transfer.toStoreId,
                productId: item.productId,
              },
            },
          });

          if (destInventory) {
            await prisma.storeInventory.update({
              where: {
                storeId_productId: {
                  storeId: transfer.toStoreId,
                  productId: item.productId,
                },
              },
              data: {
                quantity: { increment: item.quantity },
              },
            });
          } else {
            await prisma.storeInventory.create({
              data: {
                storeId: transfer.toStoreId,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
          }
        })
      );

      // Mark items as transferred
      await prisma.transferItem.updateMany({
        where: { transferId },
        data: { status: 'transferred' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        transfer: updatedTransfer,
        message: `Transfer ${action}d successfully`,
      },
    });
  } catch (error) {
    console.error('Transfer approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer approval' },
      { status: 500 }
    );
  }
}
