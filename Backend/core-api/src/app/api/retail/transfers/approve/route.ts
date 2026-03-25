import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";

/**
 * POST /api/retail/transfers/approve
 * Approve/reject inventory transfer requests.
 * Caller must belong to the source or destination store.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = (session.user as { storeId?: string }).storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { transferId, action, notes } = body;

    if (!transferId || !action) {
      return NextResponse.json(
        { error: "Transfer ID and action required" },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 },
      );
    }

    const transfer = await prisma.inventoryTransfer.findFirst({
      where: {
        id: transferId,
        status: "pending",
        OR: [{ fromStoreId: storeId }, { toStoreId: storeId }],
      },
      include: {
        fromStore: true,
        toStore: true,
        items: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    const upd = await prisma.inventoryTransfer.updateMany({
      where: {
        id: transferId,
        status: "pending",
        OR: [{ fromStoreId: storeId }, { toStoreId: storeId }],
      },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        approvedAt: new Date(),
        approvedBy: session.user.id,
        rejectionReason: action === "reject" ? notes : null,
      },
    });

    if (upd.count === 0) {
      return NextResponse.json(
        { error: "Transfer is not pending approval" },
        { status: 400 },
      );
    }

    const updatedTransfer = await prisma.inventoryTransfer.findUnique({
      where: { id: transferId },
      include: {
        fromStore: true,
        toStore: true,
        items: true,
      },
    });

    if (!updatedTransfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    // If approved, update inventory levels
    if (action === "approve") {
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
        }),
      );

      await prisma.transferItem.updateMany({
        where: {
          transferId,
          transfer: {
            OR: [{ fromStoreId: storeId }, { toStoreId: storeId }],
          },
        },
        data: { status: "transferred" },
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
    console.error("Transfer approval error:", error);
    return NextResponse.json(
      { error: "Failed to process transfer approval" },
      { status: 500 },
    );
  }
}
