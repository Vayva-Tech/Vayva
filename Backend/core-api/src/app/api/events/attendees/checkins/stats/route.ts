import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/events/attendees/checkins/stats
 * Returns attendee check-in statistics and details
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const eventId = searchParams.get("eventId");

      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Event ID is required" },
          { status: 400 }
        );
      }

      // Get total registered attendees
      const totalRegistered = await prisma.order.count({
        where: {
          storeId,
          productId: eventId,
          status: { in: ["completed", "processing"] },
        },
      });

      // Get checked-in attendees
      const checkedIn = await prisma.order.findMany({
        where: {
          storeId,
          productId: eventId,
          status: { in: ["completed", "processing"] },
          metadata: {
            path: ["checkedIn"],
            equals: true,
          },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          customer: {
            select: { name: true, email: true, phone: true },
          },
        },
      });

      // Get on-site check-ins today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const onSiteToday = checkedIn.filter((c) => {
        const checkInTime = c.metadata?.checkInTime || c.updatedAt;
        return new Date(checkInTime) >= startOfDay;
      });

      // Get VIPs not yet checked in
      const vipsNotCheckedIn = await prisma.order.findMany({
        where: {
          storeId,
          productId: eventId,
          status: { in: ["completed", "processing"] },
          metadata: {
            path: ["ticketType"],
            equals: "VIP",
          },
          NOT: {
            metadata: {
              path: ["checkedIn"],
              equals: true,
            },
          },
        },
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
      });

      // Get QR scanner devices status
      const scannerDevices = await prisma.device.findMany({
        where: {
          storeId,
          type: "qr_scanner",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          lastSeenAt: true,
          metadata: true,
        },
      });

      // Calculate badge printing queue
      const badgesToPrint = totalRegistered - checkedIn.length;

      // Format on-site attendees
      const onSiteList = onSiteToday.map((checkIn) => {
        const checkInTime = checkIn.metadata?.checkInTime || checkIn.updatedAt;
        return {
          id: checkIn.id,
          customerName: checkIn.customer?.name || "Anonymous",
          email: checkIn.customer?.email,
          ticketType: checkIn.metadata?.ticketType || "General",
          scannedAt: checkInTime,
          formattedTime: checkInTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });

      // Format VIP not arrived list
      const vipNotArrivedList = vipsNotCheckedIn.map((vip) => ({
        id: vip.id,
        customerName: vip.customer?.name || "Anonymous",
        email: vip.customer?.email,
        ticketCount: vip.lineItems?.[0]?.quantity || 1,
      }));

      // Calculate statistics
      const walkInsToday = onSiteToday.filter((c) => 
        c.metadata?.walkIn === true
      ).length;

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalRegistered,
            checkedIn: checkedIn.length,
            checkInRate: totalRegistered > 0 
              ? parseFloat(((checkedIn.length / totalRegistered) * 100).toFixed(1)) 
              : 0,
            notPresent: totalRegistered - checkedIn.length,
            onSiteToday: onSiteToday.length,
            vipNotArrived: vipsNotCheckedIn.length,
            walkInsToday,
            badgesRemaining: badgesToPrint,
          },
          onSiteAttendees: onSiteList.slice(0, 10), // Last 10 check-ins
          vipNotArrived: vipNotArrivedList,
          qrScanner: {
            status: "active",
            devicesConnected: scannerDevices.filter((d) => d.status === "active").length,
            devicesTotal: scannerDevices.length,
            devices: scannerDevices.map((d) => ({
              id: d.id,
              name: d.name || `Scanner ${d.id.slice(0, 4)}`,
              status: d.status || "offline",
              lastSeen: d.lastSeenAt,
            })),
          },
          badgePrinting: {
            remaining: badgesToPrint,
            printed: checkedIn.length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching check-in stats:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch check-in statistics" },
        { status: 500 }
      );
    }
  }
);
