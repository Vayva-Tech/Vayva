import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_RESERVATIONS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const reservation = await db.reservation.findUnique({
        where: { id, storeId },
        include: {
          table: {
            select: {
              tableNumber: true,
              capacity: true,
            },
          },
        },
      });
      
      if (!reservation) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RESERVATION_NOT_FOUND",
              message: "Reservation not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Handle status transitions
      const updatedReservation = await db.reservation.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
        include: {
          table: {
            select: {
              tableNumber: true,
              section: true,
            },
          },
        },
      });
      
      logger.info("[RESTAURANT_RESERVATION_UPDATED]", {
        reservationId: id,
        oldStatus: reservation.status,
        newStatus: updatedReservation.status,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_RESERVATION_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESERVATION_UPDATE_FAILED",
            message: "Failed to update reservation",
          },
        },
        { status: 500 }
      );
    }
  }
);